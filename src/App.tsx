import React, { useState, useMemo } from 'react';
import { GateCommand, GateType, ComplexVector } from './quantum/types';
import { computeHistory, defaultInitialState } from './quantum/engine';
import { BlochSphere } from './components/BlochSphere';
import { GatePalette } from './components/GatePalette';
import { Timeline } from './components/Timeline';
import { Controls } from './components/Controls';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
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
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(true);

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
    setInsertionIndex(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      setInsertionIndex(null);
      return;
    }

    const activeIdStr = String(active.id);
    if (activeIdStr.startsWith('palette-')) {
      if (over.id === 'timeline-drop') {
        setInsertionIndex(gates.length);
        return;
      }
      const overIndex = gates.findIndex(g => g.id === over.id);
      if (overIndex !== -1) {
        // Calculate if we are above or below the center
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        
        if (activeRect && overRect) {
           const activeCenterY = activeRect.top + activeRect.height / 2;
           const overCenterY = overRect.top + overRect.height / 2;
           
           if (activeCenterY < overCenterY) {
              setInsertionIndex(overIndex);
           } else {
              setInsertionIndex(overIndex + 1);
           }
        } else {
           setInsertionIndex(overIndex); // Fallback
        }
      }
    } else {
      setInsertionIndex(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setInsertionIndex(null);
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
          // Use the calculated insertion index if available, otherwise fallback to overIndex
          // But wait, handleDragOver logic for insertionIndex is visual.
          // We should use the same logic here or rely on insertionIndex if we stored it?
          // Storing insertionIndex in state is fine, but handleDragEnd might not have the latest if it updates fast?
          // Actually, let's re-calculate or use the same logic.
          
          const activeRect = active.rect.current.translated;
          const overRect = over.rect;
          let insertAt = overIndex;

          if (activeRect && overRect) {
             const activeCenterY = activeRect.top + activeRect.height / 2;
             const overCenterY = overRect.top + overRect.height / 2;
             if (activeCenterY >= overCenterY) {
                insertAt = overIndex + 1;
             }
          }
          newGates.splice(insertAt, 0, newGate);
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <GatePalette onAdd={addGate} />
            <SortableContext items={gates.map(g=>g.id)}>
              <Timeline 
                gates={gates} 
                history={history}
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
                insertionIndex={insertionIndex}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
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
          <BlochSphere current={current} ghosts={showHistory ? ghosts : []} />
        </div>
      </div>
    </div>
  );
}
