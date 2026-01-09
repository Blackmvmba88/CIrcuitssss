
import { GoogleGenAI, Type } from "@google/genai";
import { AssistantMode, AnalysisResult, Persona } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFrame = async (
  base64Image: string,
  mode: AssistantMode,
  query?: string,
  persona: Persona = 'SENIOR_ENG'
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstructions = `
    You are the "CircuitSense Forensic Architect". Persona: ${persona}.
    Analyze this PCB image. You must identify topological stages, causal intent, and thermal heuristics.
    
    ENGINEERING PROTOCOL:
    1. SPATIAL ANCHOR: Locate corners [0-1000].
    2. CAUSAL LOGIC: For every major component, explain its intent ('causalRole'). 
       - e.g. "Filters high-frequency noise before MCU input" or "Protects rail from reverse polarity".
    3. THERMAL HEURISTICS: Predict component heat levels ('thermalSignature') based on typical efficiency (LDOs are WARM/HOT, MCUs are NOMINAL, Connectors are COOL).
    4. LOGIC FLOW: Group components into functional stages (e.g. Stage 1: Power Input, Stage 2: Filtering, Stage 3: Logic).
    5. DIAGNOSTICS: Correlate query "${query || 'none'}" to failure modes.

    OUTPUT SCHEMA:
    - 'causalRole': A short engineering explanation.
    - 'thermalSignature': ['COOL', 'NOMINAL', 'WARM', 'HOT', 'CRITICAL'].
    - 'logicFlow': Functional stages of the board.
    - Coordinates: Integers [0, 1000].
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: systemInstructions }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          boardPose: {
            type: Type.OBJECT,
            properties: {
              corners: {
                type: Type.OBJECT,
                properties: {
                  topLeft: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                  topRight: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                  bottomRight: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                  bottomLeft: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                }
              },
              confidence: { type: Type.NUMBER }
            },
            required: ['corners', 'confidence']
          },
          components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['ic', 'resistor', 'capacitor', 'diode', 'transistor', 'connector', 'other'] },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                ymin: { type: Type.NUMBER },
                xmin: { type: Type.NUMBER },
                ymax: { type: Type.NUMBER },
                xmax: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ['ok', 'faulty', 'suspicious', 'unknown'] },
                failureAnalysis: { type: Type.STRING },
                causalRole: { type: Type.STRING },
                thermalSignature: { type: Type.STRING, enum: ['COOL', 'NOMINAL', 'WARM', 'HOT', 'CRITICAL'] },
                nets: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['id', 'type', 'name', 'ymin', 'xmin', 'ymax', 'xmax', 'status', 'causalRole', 'thermalSignature']
            }
          },
          nets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['GND', 'VCC', '3V3', '5V', 'SIGNAL', 'BUS', 'PROTECTION'] },
                points: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                }
              },
              required: ['id', 'label', 'category', 'points']
            }
          },
          logicFlow: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                order: { type: Type.NUMBER },
                components: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['name', 'description', 'order', 'components']
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                redProbe: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                blackProbe: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                expectedRange: {
                  type: Type.OBJECT,
                  properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER }, unit: { type: Type.STRING } }
                },
                reasoning: { type: Type.STRING },
                faultTheory: { type: Type.STRING }
              },
              required: ['id', 'title', 'description', 'redProbe', 'blackProbe', 'expectedRange']
            }
          },
          heuristics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                context: { type: Type.STRING },
                inference: { type: Type.STRING },
                probability: { type: Type.NUMBER }
              }
            }
          },
          safetyNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          generalRecommendation: { type: Type.STRING },
          estimatedComplexity: { type: Type.STRING, enum: ['easy', 'moderate', 'advanced'] }
        },
        required: ['boardPose', 'components', 'nets', 'logicFlow', 'steps', 'heuristics', 'safetyNotes', 'generalRecommendation', 'estimatedComplexity']
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e: any) {
    throw new Error(`Topological inference failed: ${e.message}`);
  }
};

export const readMultimeter = async (base64Image: string): Promise<{ value: string; unit: string }> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: [{
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Identify the number and unit on the multimeter display. JSON: { value, unit }" }
      ]
    }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          value: { type: Type.STRING },
          unit: { type: Type.STRING }
        },
        required: ['value', 'unit']
      }
    }
  });
  return JSON.parse(response.text);
};
