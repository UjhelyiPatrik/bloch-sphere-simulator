import React, { useState, useMemo } from 'react';
import { GateCommand, GateType, ComplexVector } from './quantum/types';
import { computeHistory, defaultInitialState } from './quantum/engine';
import { BlochSphere } from './components/BlochSphere';
import { GatePalette } from './components/GatePalette';
import { Timeline } from './components/Timeline';
import { Controls } from './components/Controls';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { evaluate, complex, Complex } from 'mathjs';

function uuid() { return Math.random().toString(36).slice(2,9); }

export default function App() {
  const [alphaExpr, setAlphaExpr] = useState('1');
  const [betaExpr, setBetaExpr] = useState('0');
  const [paramErrors, setParamErrors] = useState<Record<string, boolean>>({});
  const [gates, setGates] = useState<GateCommand[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const parseExpr = (expr: string): Complex => {
    try {
      const val = evaluate(expr);
      if (typeof val === 'number') return complex(val, 0);
      if (val && typeof val === 'object' && 're' in val && 'im' in val) {
        const anyVal = val as { re: number; im: number };
        return complex(anyVal.re, anyVal.im);
      }
      return complex(0,0);
    } catch {
      return complex(Number.NaN, Number.NaN);
    }
  };

  const { initialState, ampErrors } = useMemo(() => {
    const a = parseExpr(alphaExpr);
    const b = parseExpr(betaExpr);
    const aInvalid = Number.isNaN(a.re) || Number.isNaN(a.im);
    const bInvalid = Number.isNaN(b.re) || Number.isNaN(b.im);
    
    const aUse = aInvalid ? complex(1,0) : a;
    const bUse = bInvalid ? complex(0,0) : b;
    // Normalize
    const mag = Math.hypot(Math.hypot(aUse.re, aUse.im), Math.hypot(bUse.re, bUse.im)) || 1;
    return {
      initialState: [complex(aUse.re / mag, aUse.im / mag), complex(bUse.re / mag, bUse.im / mag)] as ComplexVector,
      ampErrors: { alpha: aInvalid, beta: bInvalid }
    };
  }, [alphaExpr, betaExpr]);

  const history = useMemo(() => computeHistory(initialState, gates).history, [initialState, gates]);
  const current = history[stepIndex] || history[history.length -1];
  const ghosts = history.slice(0, stepIndex);

  function addGate(type: GateType) {
    setGates(g => [...g, { id: uuid(), type }]);
  }
  function onParamChange(id: string, value: string) {
    setGates(g => g.map(x => x.id === id ? { ...x, params: value } : x));
    // validate expression
    let valid = true;
    try { const v = evaluate(value); if (typeof v !== 'number') valid = false; } catch { valid = false; }
    setParamErrors(errs => ({ ...errs, [id]: !valid }));
  }
  function removeGate(id: string) {
    setGates(g => g.filter(x => x.id !== id));
  }
  function onSelect(i: number) { setStepIndex(prev => prev === i + 1 ? 0 : i + 1); }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeIdStr = String(active.id);
    const isPaletteItem = activeIdStr.startsWith('palette-');
    const currentGateId = stepIndex > 0 ? gates[stepIndex - 1].id : null;

    let newGates = [...gates];

    if (isPaletteItem) {
      const type = activeIdStr.replace('palette-', '') as GateType;
      const newGate = { id: uuid(), type };
      
      if (over.id === 'timeline-drop') {
        newGates.push(newGate);
      } else {
        const overIndex = gates.findIndex(g => g.id === over.id);
        if (overIndex !== -1) {
          newGates.splice(overIndex, 0, newGate);
        } else {
          newGates.push(newGate);
        }
      }
    } else {
      if (active.id === over.id) return;
      const oldIndex = gates.findIndex(g => g.id === active.id);
      const newIndex = gates.findIndex(g => g.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        newGates = arrayMove(gates, oldIndex, newIndex);
      } else {
        return;
      }
    }

    setGates(newGates);

    if (currentGateId) {
      const newCurrentIndex = newGates.findIndex(g => g.id === currentGateId);
      if (newCurrentIndex !== -1) {
        setStepIndex(newCurrentIndex + 1);
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <header className="p-2 bg-gray-800 flex items-center gap-4 text-sm">
        <span className="font-semibold text-neon">Bloch Sphere Simulator</span>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-gray-900 overflow-y-auto border-r border-gray-700">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <GatePalette onAdd={addGate} />
            <SortableContext items={gates.map(g=>g.id)}>
              <Timeline 
                gates={gates} 
                activeIndex={stepIndex-1} 
                onSelect={onSelect} 
                onParamChange={onParamChange} 
                onRemove={removeGate} 
                paramErrors={paramErrors}
                alpha={alphaExpr}
                setAlpha={setAlphaExpr}
                beta={betaExpr}
                setBeta={setBetaExpr}
                ampErrors={ampErrors}
              />
            </SortableContext>
            <DragOverlay>
              {activeId?.startsWith('palette-') ? (
                <button className="px-2 py-1 rounded bg-gray-700 text-xs border border-neon shadow-lg cursor-grabbing text-gray-100">
                  {activeId.replace('palette-', '')}
                </button>
              ) : null}
            </DragOverlay>
          </DndContext>
          <Controls
            canPrev={stepIndex>0}
            canNext={stepIndex < history.length-1}
            onPrev={()=>setStepIndex(i=>Math.max(0,i-1))}
            onNext={()=>setStepIndex(i=>Math.min(history.length-1,i+1))}
            onStart={()=>setStepIndex(0)}
            onEnd={()=>setStepIndex(history.length-1)}
          />
        </div>
        <div className="flex-1 bg-black">
          <BlochSphere current={current} ghosts={ghosts} />
        </div>
      </div>
    </div>
  );
}
