
export enum AssistantMode {
  INSPECTION = 'INSPECTION',
  MEASUREMENT = 'MEASUREMENT',
  REPAIR = 'REPAIR',
  VALIDATION = 'VALIDATION',
  TUTORIAL = 'TUTORIAL',
  THERMAL = 'THERMAL'
}

export type NetCategory = 'GND' | 'VCC' | '3V3' | '5V' | 'SIGNAL' | 'BUS' | 'PROTECTION';
export type ThermalLevel = 'COOL' | 'NOMINAL' | 'WARM' | 'HOT' | 'CRITICAL';
export type Persona = 'SENIOR_ENG' | 'HARDWARE_HACKER' | 'PROFESSOR' | 'SOVIET_TECH';

export interface Point {
  x: number;
  y: number;
}

export interface BoardPose {
  corners: {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
  };
  confidence: number;
}

export interface Heuristic {
  context: string;
  inference: string;
  probability: number;
}

export interface PCBNet {
  id: string;
  label: string;
  category: NetCategory;
  points: Point[];
}

export interface PCBComponent {
  id: string;
  type: 'ic' | 'resistor' | 'capacitor' | 'diode' | 'transistor' | 'connector' | 'other';
  name: string;
  category: string;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  status: 'ok' | 'faulty' | 'suspicious' | 'unknown';
  failureAnalysis?: string;
  nets: string[];
  causalRole: string; // "Why is this here?"
  thermalSignature: ThermalLevel; // Heuristic heat map
}

export interface LogicStage {
  name: string;
  description: string;
  order: number;
  components: string[]; // IDs
}

export interface ProbingStep {
  id: string;
  title: string;
  description: string;
  redProbe: Point;
  blackProbe: Point;
  expectedRange: { min: number; max: number; unit: string };
  reasoning: string;
  faultTheory: string;
}

export interface AnalysisResult {
  boardPose: BoardPose;
  components: PCBComponent[];
  nets: PCBNet[];
  steps: ProbingStep[];
  heuristics: Heuristic[];
  logicFlow: LogicStage[];
  safetyNotes: string[];
  generalRecommendation: string;
  estimatedComplexity: 'easy' | 'moderate' | 'advanced';
}

export interface DiagnosticLog {
  timestamp: number;
  stepId: string;
  value: string;
  status: 'PASS' | 'FAIL';
  note?: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  error?: string;
  result?: AnalysisResult;
  history: DiagnosticLog[];
  activeNetFilter?: NetCategory;
  activePersona: Persona;
  isVoiceEnabled: boolean;
}
