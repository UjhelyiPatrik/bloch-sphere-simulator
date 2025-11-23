import React from 'react';

interface ControlsProps {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; primary?: boolean }> = ({ onClick, disabled, children, primary }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`
      px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all duration-200
      flex items-center justify-center gap-2
      ${disabled 
        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800' 
        : primary
          ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-500'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-600'
      }
    `}
  >
    {children}
  </button>
);

export const Controls: React.FC<ControlsProps> = ({ canPrev, canNext, onPrev, onNext, onStart, onEnd }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <ControlButton disabled={!canPrev} onClick={onStart}>
        <span className="text-lg leading-none">«</span>
      </ControlButton>
      <ControlButton disabled={!canPrev} onClick={onPrev}>
        <span className="text-lg leading-none">‹</span> Prev
      </ControlButton>
      
      <div className="w-px h-8 bg-slate-800 mx-2"></div>
      
      <ControlButton disabled={!canNext} onClick={onNext} primary>
        Next <span className="text-lg leading-none">›</span>
      </ControlButton>
      <ControlButton disabled={!canNext} onClick={onEnd}>
        <span className="text-lg leading-none">»</span>
      </ControlButton>
    </div>
  );
};
