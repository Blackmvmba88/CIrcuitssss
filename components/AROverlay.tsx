
import React from 'react';
import { AnalysisResult, AssistantMode, Point, NetCategory, ThermalLevel } from '../types';

interface AROverlayProps {
  analysis?: AnalysisResult;
  mode: AssistantMode;
  currentStepIndex: number;
  activeNetFilter?: NetCategory;
}

const AROverlay: React.FC<AROverlayProps> = ({ analysis, mode, currentStepIndex, activeNetFilter }) => {
  if (!analysis || !analysis.boardPose) return null;

  const { corners } = analysis.boardPose;

  const project = (u1000: number, v1000: number): Point => {
    const u = u1000 / 1000;
    const v = v1000 / 1000;
    const topX = corners.topLeft.x + u * (corners.topRight.x - corners.topLeft.x);
    const topY = corners.topLeft.y + u * (corners.topRight.y - corners.topLeft.y);
    const bottomX = corners.bottomLeft.x + u * (corners.bottomRight.x - corners.bottomLeft.x);
    const bottomY = corners.bottomLeft.y + u * (corners.bottomRight.y - corners.bottomLeft.y);
    return {
      x: topX + v * (bottomX - topX),
      y: topY + v * (bottomY - topY)
    };
  };

  const getThermalColor = (level: ThermalLevel) => {
    switch (level) {
      case 'COOL': return '#3b82f6';
      case 'NOMINAL': return '#10b981';
      case 'WARM': return '#fbbf24';
      case 'HOT': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#64748b';
    }
  };

  const currentStep = analysis.steps?.[currentStepIndex];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <defs>
        <filter id="blur-thermal" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="30" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Surface Logic Grid */}
      <polygon 
        points={`${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`}
        fill="rgba(59, 130, 246, 0.01)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" strokeDasharray="5,15"
      />

      {/* Mode: Thermal Heuristics */}
      {mode === AssistantMode.THERMAL && analysis.components.map(comp => {
        const cx = (comp.xmin + comp.xmax) / 2;
        const cy = (comp.ymin + comp.ymax) / 2;
        const p = project(cx, cy);
        return (
          <g key={`thermal-${comp.id}`}>
             <circle cx={p.x} cy={p.y} r="60" fill={getThermalColor(comp.thermalSignature)} className="opacity-40 animate-pulse" style={{ filter: 'url(#blur-thermal)' }} />
             {comp.thermalSignature === 'CRITICAL' && (
                <text x={p.x} y={p.y - 40} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono uppercase tracking-widest drop-shadow-lg">CRITICAL_TEMP</text>
             )}
          </g>
        );
      })}

      {/* Logic Stages Flow Lines */}
      {mode === AssistantMode.TUTORIAL && analysis.logicFlow.map((stage, idx) => {
        if (idx === 0) return null;
        const prevStage = analysis.logicFlow[idx - 1];
        const prevCompId = prevStage.components[0];
        const currCompId = stage.components[0];
        const prevComp = analysis.components.find(c => c.id === prevCompId);
        const currComp = analysis.components.find(c => c.id === currCompId);
        
        if (prevComp && currComp) {
          const p1 = project((prevComp.xmin + prevComp.xmax)/2, (prevComp.ymin + prevComp.ymax)/2);
          const p2 = project((currComp.xmin + currComp.xmax)/2, (currComp.ymin + currComp.ymax)/2);
          return (
            <g key={`flow-${idx}`}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="10,5" />
              <circle cx={p2.x} cy={p2.y} r="5" fill="white" className="animate-ping" />
            </g>
          );
        }
        return null;
      })}

      {/* Standard AR Components */}
      {mode !== AssistantMode.THERMAL && analysis.components.map((comp) => {
        const tl = project(comp.xmin, comp.ymin);
        const tr = project(comp.xmax, comp.ymin);
        const br = project(comp.xmax, comp.ymax);
        const bl = project(comp.xmin, comp.ymax);
        
        const isFaulty = comp.status === 'faulty' || comp.status === 'suspicious';
        const color = isFaulty ? '#f43f5e' : '#3b82f6';
        const isTutorial = mode === AssistantMode.TUTORIAL;

        return (
          <g key={comp.id}>
            <polygon 
              points={`${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`}
              stroke={color} strokeWidth={isTutorial ? "4" : "1.5"} fill="none"
              className={isFaulty ? 'animate-pulse' : ''}
            />
            
            {isTutorial && (
              <g transform={`translate(${tl.x}, ${tl.y - 50})`}>
                 <rect width="220" height="45" fill="rgba(15, 23, 42, 0.95)" stroke={color} strokeWidth="1" rx="6" />
                 <text x="10" y="18" fill="white" fontSize="10" fontWeight="900" className="font-mono uppercase italic tracking-tight">{comp.name}</text>
                 <text x="10" y="34" fill="rgba(255,255,255,0.6)" fontSize="8" className="font-mono italic">"{comp.causalRole}"</text>
              </g>
            )}

            {isFaulty && !isTutorial && (
              <g transform={`translate(${tl.x}, ${tl.y - 45})`}>
                <rect width="180" height="40" fill="#f43f5e" rx="6" className="shadow-2xl opacity-90" />
                <text x="10" y="18" fill="white" fontSize="10" fontWeight="900" className="font-mono uppercase italic">SUSPECT: {comp.name}</text>
                <text x="10" y="32" fill="rgba(255,255,255,0.7)" fontSize="8" className="font-mono">{comp.failureAnalysis?.substring(0, 30)}...</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Active Step Probes */}
      {currentStep && mode === AssistantMode.MEASUREMENT && (
        <g>
          {(() => {
            const red = project(currentStep.redProbe.x, currentStep.redProbe.y);
            const black = project(currentStep.blackProbe.x, currentStep.blackProbe.y);
            return (
              <>
                <path d={`M ${black.x} ${black.y} Q ${(black.x+red.x)/2} ${Math.min(black.y, red.y)-120} ${red.x} ${red.y}`} 
                      stroke="white" strokeWidth="2" strokeDasharray="8,8" fill="none" className="opacity-30" />
                <circle cx={black.x} cy={black.y} r="20" fill="#0f172a" stroke="#475569" strokeWidth="4" />
                <g>
                   <circle cx={red.x} cy={red.y} r="20" fill="#dc2626" stroke="white" strokeWidth="4" style={{ filter: 'url(#glow-red)' }} />
                   <circle cx={red.x} cy={red.y} r="50" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
                </g>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
};

export default AROverlay;
