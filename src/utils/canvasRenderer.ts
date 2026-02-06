import type { Viewport } from '../types';
import type { EvalFunction } from 'mathjs';
import { safeEvaluate } from './mathEval';

// Convert math coordinates to screen (canvas pixel) coordinates
function mathToScreen(
  mathX: number,
  mathY: number,
  viewport: Viewport,
  width: number,
  height: number
): [number, number] {
  const screenX = (mathX - viewport.centerX) * viewport.scale + width / 2;
  const screenY = -(mathY - viewport.centerY) * viewport.scale + height / 2;
  return [screenX, screenY];
}

// Find a "nice" grid spacing given the current scale
function niceStep(roughStep: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  if (residual <= 1) return magnitude;
  if (residual <= 2) return 2 * magnitude;
  if (residual <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
) {
  // Target ~80px between grid lines
  const targetPixelSpacing = 80;
  const mathSpacing = niceStep(targetPixelSpacing / viewport.scale);

  const left = viewport.centerX - width / 2 / viewport.scale;
  const right = viewport.centerX + width / 2 / viewport.scale;
  const top = viewport.centerY + height / 2 / viewport.scale;
  const bottom = viewport.centerY - height / 2 / viewport.scale;

  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Vertical grid lines
  const startX = Math.floor(left / mathSpacing) * mathSpacing;
  for (let mx = startX; mx <= right; mx += mathSpacing) {
    const [sx] = mathToScreen(mx, 0, viewport, width, height);
    ctx.moveTo(Math.round(sx) + 0.5, 0);
    ctx.lineTo(Math.round(sx) + 0.5, height);
  }

  // Horizontal grid lines
  const startY = Math.floor(bottom / mathSpacing) * mathSpacing;
  for (let my = startY; my <= top; my += mathSpacing) {
    const [, sy] = mathToScreen(0, my, viewport, width, height);
    ctx.moveTo(0, Math.round(sy) + 0.5);
    ctx.lineTo(width, Math.round(sy) + 0.5);
  }

  ctx.stroke();
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
) {
  const targetPixelSpacing = 80;
  const mathSpacing = niceStep(targetPixelSpacing / viewport.scale);

  const [originX, originY] = mathToScreen(0, 0, viewport, width, height);

  // Axis lines
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();

  // X axis
  if (originY >= 0 && originY <= height) {
    ctx.moveTo(0, Math.round(originY) + 0.5);
    ctx.lineTo(width, Math.round(originY) + 0.5);
  }

  // Y axis
  if (originX >= 0 && originX <= width) {
    ctx.moveTo(Math.round(originX) + 0.5, 0);
    ctx.lineTo(Math.round(originX) + 0.5, height);
  }

  ctx.stroke();

  // Tick marks and labels
  ctx.fillStyle = '#555';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const left = viewport.centerX - width / 2 / viewport.scale;
  const right = viewport.centerX + width / 2 / viewport.scale;
  const top_ = viewport.centerY + height / 2 / viewport.scale;
  const bottom = viewport.centerY - height / 2 / viewport.scale;

  const tickSize = 5;

  // X-axis ticks
  const startX = Math.floor(left / mathSpacing) * mathSpacing;
  for (let mx = startX; mx <= right; mx += mathSpacing) {
    if (Math.abs(mx) < mathSpacing * 0.01) continue; // skip origin
    const [sx] = mathToScreen(mx, 0, viewport, width, height);
    const ty = Math.max(0, Math.min(height - 20, originY));

    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.moveTo(Math.round(sx) + 0.5, ty - tickSize);
    ctx.lineTo(Math.round(sx) + 0.5, ty + tickSize);
    ctx.stroke();

    const label = formatLabel(mx);
    ctx.fillText(label, sx, ty + tickSize + 2);
  }

  // Y-axis ticks
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const startY = Math.floor(bottom / mathSpacing) * mathSpacing;
  for (let my = startY; my <= top_; my += mathSpacing) {
    if (Math.abs(my) < mathSpacing * 0.01) continue; // skip origin
    const [, sy] = mathToScreen(0, my, viewport, width, height);
    const tx = Math.max(30, Math.min(width, originX));

    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.moveTo(tx - tickSize, Math.round(sy) + 0.5);
    ctx.lineTo(tx + tickSize, Math.round(sy) + 0.5);
    ctx.stroke();

    const label = formatLabel(my);
    ctx.fillText(label, tx - tickSize - 3, sy);
  }
}

function formatLabel(value: number): string {
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 0.01 && value !== 0)) {
    return value.toExponential(1);
  }
  // Remove trailing zeros
  return parseFloat(value.toPrecision(10)).toString();
}

function drawFunction(
  ctx: CanvasRenderingContext2D,
  fn: EvalFunction,
  color: string,
  viewport: Viewport,
  width: number,
  height: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  let penDown = false;
  let lastY = 0;

  for (let px = 0; px < width; px++) {
    // Convert pixel x to math x
    const mathX = viewport.centerX + (px - width / 2) / viewport.scale;
    const mathY = safeEvaluate(fn, mathX);

    if (isNaN(mathY)) {
      penDown = false;
      continue;
    }

    const [, screenY] = mathToScreen(mathX, mathY, viewport, width, height);

    // Lift pen if the line would jump wildly (discontinuity detection)
    if (penDown && Math.abs(screenY - lastY) > height) {
      penDown = false;
    }

    if (!penDown) {
      ctx.moveTo(px, screenY);
      penDown = true;
    } else {
      ctx.lineTo(px, screenY);
    }

    lastY = screenY;
  }

  ctx.stroke();
}

export interface CompiledFunction {
  id: string;
  fn: EvalFunction;
  color: string;
  visible: boolean;
}

export function renderGraph(
  ctx: CanvasRenderingContext2D,
  functions: CompiledFunction[],
  viewport: Viewport,
  width: number,
  height: number
) {
  // Clear
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw layers
  drawGrid(ctx, viewport, width, height);
  drawAxes(ctx, viewport, width, height);

  // Draw each visible function
  for (const f of functions) {
    if (f.visible) {
      drawFunction(ctx, f.fn, f.color, viewport, width, height);
    }
  }
}
