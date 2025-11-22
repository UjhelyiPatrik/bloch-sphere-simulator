import React from 'react';

interface ControlsProps {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ canPrev, canNext, onPrev, onNext, onStart, onEnd }) => {
  return (
    <div className="flex gap-2 p-2">
      <button disabled={!canPrev} onClick={onStart} className="btn">{'<<'}</button>
      <button disabled={!canPrev} onClick={onPrev} className="btn">{'< Prev'}</button>
      <button disabled={!canNext} onClick={onNext} className="btn">{'Next >'}</button>
      <button disabled={!canNext} onClick={onEnd} className="btn">{'End >>'}</button>
    </div>
  );
};
