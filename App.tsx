
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AssistantMode, AnalysisResult, AnalysisState, DiagnosticLog, NetCategory, Persona } from './types';
import CameraView from './components/CameraView';
import AROverlay from './components/AROverlay';
import { analyzeFrame, readMultimeter } from './services/geminiService';

const PERSONAS: { id: Persona; label: string; icon: string }[] = [
  { id: 'SENIOR_ENG', label: 'Senior Engineer', icon: '👨‍🔬' },
  { id: 'HARDWARE_HACKER', label: 'Hacker/Maker', icon: '🧑‍💻' },
  { id: 'PROFESSOR', label: 'Professor', icon: '🎓' },
  { id: 'SOVIET_TECH', label: 'Old School Tech', icon: '🛠️' },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AssistantMode>(AssistantMode.INSPECTION);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    history: [],
    activePersona: 'SENIOR_ENG',
    isVoiceEnabled: false
  });
  const [query, setQuery] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [reading, setReading] = useState('');
  const [isReadingMeter, setIsReadingMeter] = useState(false);

  const isBoardLocked = !!analysisState.result;

  const speak = useCallback((text: string) => {
    if (!analysisState.isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [analysisState.isVoiceEnabled]);

  const handleCapture = useCallback(async (base64: string) => {
    if (isReadingMeter) {
      setAnalysisState(prev => ({ ...prev, isAnalyzing: true }));
      try {
        const { value, unit } = await readMultimeter(base64);
        setReading(value);
        setIsReadingMeter(false);
        speak(`Value detected: ${value} ${unit}`);
      } catch (err: any) {
        setAnalysisState(prev => ({ ...prev, error: "OCR failure: " + err.message }));
      } finally {
        setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
      }
      return;
    }

    setAnalysisState(prev => ({ ...prev, isAnalyzing: true, result: undefined, error: undefined }));
    setStepIndex(0);
    setReading('');
    
    try {
      const result = await analyzeFrame(base64, mode, query, analysisState.activePersona);
      setAnalysisState(prev => ({ ...prev, isAnalyzing: false, result }));
      speak(result.generalRecommendation);
    } catch (error: any) {
      setAnalysisState(prev => ({ ...prev, isAnalyzing: false, error: error.message }));
    }
  }, [mode, query, isReadingMeter, analysisState.activePersona, speak]);

  const resetAnalysis = () => {
    setAnalysisState(prev => ({ ...prev, result: undefined, error: undefined }));
    setStepIndex(0);
    setReading('');
    setIsReadingMeter(false);
  };

  const currentStep = useMemo(() => {
    return analysisState.result?.steps?.[stepIndex];
  }, [analysisState.result, stepIndex]);

  const logMeasurement = () => {
    if (!currentStep || !reading) return;
    const actual = parseFloat(reading);
    const { min, max } = currentStep.expectedRange;
    const status = (actual >= min && actual <= max) ? 'PASS' : 'FAIL';
    
    const entry: DiagnosticLog = {
      timestamp: Date.now(),
      stepId: currentStep.id,
      value: `${reading} ${currentStep.expectedRange.unit}`,
      status,
      note: status === 'FAIL' ? currentStep.faultTheory : undefined
    };

    setAnalysisState(prev => ({ ...prev, history: [entry, ...prev.history] }));
    if (status === 'PASS') {
      speak("Reading valid. Proceeding to next step.");
      if (analysisState.result?.steps && stepIndex < analysisState.result.steps.length - 1) {
        setStepIndex(v => v + 1);
        setReading('');
      }
    } else {
      speak(`Fault detected. Theory: ${currentStep.faultTheory}`);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] overflow-hidden font-sans text-slate-200">
      {/* Control Surface */}
      <aside className="w-[34rem] flex flex-col bg-slate-900/95 backdrop-blur-3xl border-r border-blue-500/20 z-50 shadow-2xl overflow-y-auto">
        <header className="p-8 border-b border-white/5 space-y-8">
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-5">
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10">⚡</div>
                <div>
                   <h1 className="text-xl font-black uppercase italic tracking-tighter">CircuitSense <span className="text-blue-500 not-italic">Elite</span></h1>
                   <p className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Tactical AI Workbench</p>
                </div>
             </div>
             <button 
                onClick={() => setAnalysisState(p => ({ ...p, isVoiceEnabled: !p.isVoiceEnabled }))}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${analysisState.isVoiceEnabled ? 'bg-blue-500 border-blue-400' : 'bg-white/5 border-white/10 opacity-30'}`}
             >
                {analysisState.isVoiceEnabled ? '🔊' : '🔇'}
             </button>
          </div>

          <div className="space-y-3">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Active Expert Persona</label>
             <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map(p => (
                   <button 
                      key={p.id}
                      onClick={() => setAnalysisState(prev => ({ ...prev, activePersona: p.id }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        analysisState.activePersona === p.id ? 'bg-blue-600/20 border-blue-500 text-white shadow-md' : 'bg-white/5 border-transparent text-slate-500'
                      }`}
                   >
                      <span className="text-lg">{p.icon}</span>
                      {p.label}
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.values(AssistantMode).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${
                mode === m ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-600'
              }`}>
                <span className="text-sm">{
                   m === 'INSPECTION' ? '🔍' : m === 'MEASUREMENT' ? '📏' : m === 'REPAIR' ? '🛠️' : m === 'VALIDATION' ? '✅' : m === 'THERMAL' ? '🔥' : '💡'
                }</span>
                {m.substring(0, 8)}
              </button>
            ))}
          </div>

          <textarea 
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Contextual Query (e.g. 'Short detected', 'I2C debugging')"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-xs font-mono h-24 focus:border-blue-500/50 outline-none"
          />
        </header>

        <section className="flex-1 p-8 space-y-10">
          {analysisState.result ? (
            <div className="space-y-10 animate-in slide-in-from-left duration-500">
               {/* Logic Flow Stage Navigator */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Topology Stages</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                     {analysisState.result.logicFlow.map((stage, i) => (
                        <div key={i} className="flex-shrink-0 bg-white/5 border border-white/5 p-4 rounded-2xl w-32 space-y-1 group hover:border-blue-500/30 transition-all">
                           <span className="text-[9px] font-black text-slate-600 uppercase block">Stage {stage.order}</span>
                           <h4 className="text-[10px] font-bold text-blue-400 uppercase leading-none">{stage.name}</h4>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Causal Analysis (The "Why") */}
               {mode === AssistantMode.TUTORIAL && (
                  <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] space-y-4">
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <span>💡</span> Causal Knowledge Base
                     </h3>
                     <div className="space-y-4">
                        {analysisState.result.components.slice(0, 3).map(c => (
                           <div key={c.id} className="space-y-1">
                              <span className="text-[9px] font-black text-white/50 uppercase">{c.name}</span>
                              <p className="text-[11px] text-blue-100/80 leading-relaxed italic">"{c.causalRole}"</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Active Step HUD */}
               {currentStep && mode === AssistantMode.MEASUREMENT && (
                 <div className="bg-slate-800/60 p-7 rounded-[2.5rem] border border-white/5 space-y-6 relative group overflow-hidden shadow-xl">
                    <div className="flex justify-between items-center">
                       <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">OP_SEQ {stepIndex+1}/{analysisState.result.steps.length}</span>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-base font-black text-white uppercase">{currentStep.title}</h3>
                       <p className="text-[11px] text-slate-500 italic">"{currentStep.description}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-black/60 p-4 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Expect</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{currentStep.expectedRange.min}-{currentStep.expectedRange.max} {currentStep.expectedRange.unit}</span>
                       </div>
                       <div className="bg-black/60 p-4 rounded-2xl border border-white/5 focus-within:border-blue-500/50">
                          <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Detect</span>
                          <input type="number" value={reading} onChange={e => setReading(e.target.value)} onKeyDown={e => e.key === 'Enter' && logMeasurement()}
                                 placeholder="0.00" className="w-full bg-transparent text-sm font-mono text-white outline-none font-bold" />
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={logMeasurement} className="flex-1 py-4 bg-blue-600/20 border border-blue-500/40 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest">Commit</button>
                      <button onClick={() => setIsReadingMeter(true)} className={`w-16 rounded-2xl border transition-all flex items-center justify-center ${isReadingMeter ? 'bg-emerald-500 border-emerald-400 animate-pulse' : 'bg-white/5 border-white/10'}`}>📷</button>
                    </div>
                 </div>
               )}

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Audit Trail</h4>
                  <div className="space-y-2">
                     {analysisState.history.slice(0, 5).map((h, i) => (
                        <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-1 ${
                          h.status === 'PASS' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/10 border-rose-500/20'
                        }`}>
                           <div className="flex justify-between text-[10px] font-black">
                              <span className="text-white/80 uppercase">{analysisState.result?.steps.find(s => s.id === h.stepId)?.title}</span>
                              <span className={h.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>{h.status}</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-mono text-slate-500">
                              <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                              <span className="text-white">{h.value}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-5 border-4 border-dashed border-white/5 rounded-[4rem]">
              <span className="text-8xl mb-8">🤖</span>
              <p className="text-xs font-mono uppercase tracking-[1em]">Engine Idle</p>
            </div>
          )}
        </section>
      </aside>

      {/* AR Tactical Viewport */}
      <main className="flex-1 relative bg-black">
        <CameraView isProcessing={analysisState.isAnalyzing} onCapture={handleCapture} />
        <AROverlay 
          analysis={analysisState.result} 
          mode={mode} 
          currentStepIndex={stepIndex} 
          activeNetFilter={analysisState.activeNetFilter}
        />

        {/* HUD Elements */}
        <div className="absolute top-10 left-10 right-10 pointer-events-none flex justify-between items-start">
           <div className="flex flex-col gap-3">
              <div className="px-6 py-3 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl text-[10px] font-mono text-white tracking-[0.3em] flex items-center gap-4">
                 <div className={`w-3 h-3 rounded-full ${isBoardLocked ? 'bg-blue-500 shadow-[0_0_15px_blue]' : 'bg-emerald-500 animate-pulse'}`} />
                 {isBoardLocked ? 'TOPOLOGY_SYNC: OK' : 'SEEKING_QUAD...'}
              </div>
           </div>

           <div className="flex flex-col items-end gap-2">
              <div className="px-4 py-2 bg-black/60 rounded-xl border border-white/10 text-[9px] font-mono text-slate-500 uppercase">
                 Role: {analysisState.activePersona}
              </div>
              {analysisState.result && (
                <div className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-[9px] font-mono text-blue-300 uppercase">
                   Complexity: {analysisState.result.estimatedComplexity}
                </div>
              )}
           </div>
        </div>

        {isBoardLocked && !analysisState.isAnalyzing && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
             <div className="px-10 py-3 bg-blue-600/80 backdrop-blur-2xl rounded-full border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.8em] shadow-2xl">
               SPATIAL_LOCK_ACTIVE
             </div>
          </div>
        )}

        {/* Global FX */}
        {analysisState.isAnalyzing && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
            <div className="w-full h-1 bg-blue-500 shadow-[0_0_80px_#3b82f6] absolute top-0 animate-[deep-scan_2s_linear_infinite]" />
            <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[1px] animate-pulse" />
          </div>
        )}
      </main>

      <style>{`
        @keyframes deep-scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
