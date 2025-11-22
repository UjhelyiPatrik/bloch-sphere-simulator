import React from 'react';
import { GateCommand } from '../quantum/types';
import { SortableGate } from './SortableGate';
import { useDroppable } from '@dnd-kit/core';

interface TimelineProps {
  gates: GateCommand[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onParamChange: (id: string, value: string) => void;
  paramErrors?: Record<string, boolean>;
}

export const Timeline: React.FC<TimelineProps> = ({ gates, activeIndex, onSelect, onParamChange, paramErrors }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'timeline-drop' });
  return (
    <div className="p-2 space-y-2" ref={setNodeRef}>
      <h2 className="text-sm font-semibold flex items-center gap-2">Timeline {isOver && <span className="text-[10px] text-neon">Drop to Add</span>}</h2>
      <ol className="space-y-1 min-h-16 border border-dashed border-gray-600 rounded p-1">
        {gates.map((g,i) => (
          <SortableGate key={g.id} gate={g} index={i} active={i===activeIndex} error={!!paramErrors?.[g.id]} onSelect={onSelect} onParamChange={onParamChange} />
        ))}
        {gates.length===0 && <li className="text-[10px] text-gray-400 px-1">Drag gates here</li>}
      </ol>
    </div>
  );
};
