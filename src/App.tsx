import { useState, useMemo, useCallback } from 'react';
import type { PlottedFunction, Viewport } from './types';
import { tryCompile } from './utils/mathEval';
import type { CompiledFunction } from './utils/canvasRenderer';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import './App.css';

const PALETTE = [
  '#e53935', '#1e88e5', '#43a047', '#fb8c00',
  '#8e24aa', '#00acc1', '#6d4c41', '#546e7a',
];

let nextId = 1;

function makeId() {
  return String(nextId++);
}

const DEFAULT_VIEWPORT: Viewport = {
  centerX: 0,
  centerY: 0,
  scale: 50,
};

function App() {
  const [functions, setFunctions] = useState<PlottedFunction[]>([
    {
      id: makeId(),
      expression: 'x^2',
      color: PALETTE[0],
      visible: true,
      error: null,
    },
  ]);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

  // Compile expressions, memoized by the full functions array
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

  // Update errors in function state based on compilation
  const functionsWithErrors = useMemo<PlottedFunction[]>(() => {
    return functions.map((f) => {
      const result = tryCompile(f.expression);
      return { ...f, error: result.error };
    });
  }, [functions]);

  const addFunction = useCallback(() => {
    setFunctions((prev) => [
      ...prev,
      {
        id: makeId(),
        expression: '',
        color: PALETTE[prev.length % PALETTE.length],
        visible: true,
        error: 'Empty expression',
      },
    ]);
  }, []);

  const removeFunction = useCallback((id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
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

  return (
    <div className="app">
      <Sidebar
        functions={functionsWithErrors}
        onAdd={addFunction}
        onRemove={removeFunction}
        onUpdateExpression={updateExpression}
        onUpdateColor={updateColor}
        onToggleVisibility={toggleVisibility}
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
