import { useState, useMemo, useCallback } from 'react';
import type { PlottedFunction, Viewport } from './types';
import { tryCompile } from './utils/mathEval';
import type { CompiledFunction } from './utils/canvasRenderer';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import './App.css';

const PALETTE = [
  '#e94560', '#4cc9f0', '#43a047', '#fb8c00',
  '#a855f7', '#06d6a0', '#f472b6', '#38bdf8',
];

let nextId = 1;

function makeId() {
  return String(nextId++);
}

const firstId = makeId();

const DEFAULT_VIEWPORT: Viewport = {
  centerX: 0,
  centerY: 0,
  scale: 50,
};

function App() {
  const [functions, setFunctions] = useState<PlottedFunction[]>([
    {
      id: firstId,
      expression: 'x^2',
      color: PALETTE[0],
      visible: true,
      error: null,
    },
  ]);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [activeFunctionId, setActiveFunctionId] = useState<string | null>(firstId);

  const compiled = useMemo<CompiledFunction[]>(() => {
    const results: CompiledFunction[] = [];
    for (const f of functions) {
      const result = tryCompile(f.expression);
      if (result.fn) {
        results.push({
          id: f.id,
          fn: result.fn,
          color: f.color,
          visible: f.visible,
        });
      }
    }
    return results;
  }, [functions]);

  const functionsWithErrors = useMemo<PlottedFunction[]>(() => {
    return functions.map((f) => {
      const result = tryCompile(f.expression);
      return { ...f, error: result.error };
    });
  }, [functions]);

  const addFunction = useCallback(() => {
    const id = makeId();
    setFunctions((prev) => [
      ...prev,
      {
        id,
        expression: '',
        color: PALETTE[prev.length % PALETTE.length],
        visible: true,
        error: 'Empty expression',
      },
    ]);
    setActiveFunctionId(id);
  }, []);

  const removeFunction = useCallback((id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
    setActiveFunctionId((cur) => (cur === id ? null : cur));
  }, []);

  const updateExpression = useCallback((id: string, expr: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expression: expr } : f))
    );
  }, []);

  const updateColor = useCallback((id: string, color: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, color } : f))
    );
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  }, []);

  const handleKeypadInsert = useCallback((text: string) => {
    if (!activeFunctionId) return;
    setFunctions((prev) =>
      prev.map((f) =>
        f.id === activeFunctionId
          ? { ...f, expression: f.expression + text }
          : f
      )
    );
  }, [activeFunctionId]);

  const handleKeypadClear = useCallback(() => {
    if (!activeFunctionId) return;
    setFunctions((prev) =>
      prev.map((f) =>
        f.id === activeFunctionId ? { ...f, expression: '' } : f
      )
    );
  }, [activeFunctionId]);

  const handleKeypadBackspace = useCallback(() => {
    if (!activeFunctionId) return;
    setFunctions((prev) =>
      prev.map((f) =>
        f.id === activeFunctionId
          ? { ...f, expression: f.expression.slice(0, -1) }
          : f
      )
    );
  }, [activeFunctionId]);

  return (
    <div className="app">
      <Sidebar
        functions={functionsWithErrors}
        activeFunctionId={activeFunctionId}
        onAdd={addFunction}
        onRemove={removeFunction}
        onUpdateExpression={updateExpression}
        onUpdateColor={updateColor}
        onToggleVisibility={toggleVisibility}
        onSetActive={setActiveFunctionId}
        onKeypadInsert={handleKeypadInsert}
        onKeypadClear={handleKeypadClear}
        onKeypadBackspace={handleKeypadBackspace}
      />
      <GraphCanvas
        functions={compiled}
        viewport={viewport}
        onViewportChange={setViewport}
      />
    </div>
  );
}

export default App;
