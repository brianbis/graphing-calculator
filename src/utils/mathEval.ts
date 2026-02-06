import { compile, type EvalFunction } from 'mathjs';

export function tryCompile(expr: string): { fn: EvalFunction; error: null } | { fn: null; error: string } {
  if (!expr.trim()) {
    return { fn: null, error: 'Empty expression' };
  }
  try {
    const compiled = compile(expr);
    // Test evaluation to catch errors early
    compiled.evaluate({ x: 0 });
    return { fn: compiled, error: null };
  } catch (e) {
    return { fn: null, error: (e as Error).message };
  }
}

export function safeEvaluate(fn: EvalFunction, x: number): number {
  try {
    const result = fn.evaluate({ x });
    if (typeof result !== 'number' || !isFinite(result)) {
      return NaN;
    }
    return result;
  } catch {
    return NaN;
  }
}
