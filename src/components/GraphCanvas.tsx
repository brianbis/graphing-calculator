import { useRef, useEffect, useCallback } from 'react';
import type { Viewport } from '../types';
import { renderGraph, type CompiledFunction, type CanvasTheme } from '../utils/canvasRenderer';
import './GraphCanvas.css';

const THEME: CanvasTheme = {
  bg: '#0a0a1a',
  grid: '#1a1a3e',
  axis: '#8888aa',
  label: '#777799',
};

interface Props {
  functions: CompiledFunction[];
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
}

export default function GraphCanvas({ functions, viewport, onViewportChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = sizeRef.current;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderGraph(ctx, functions, viewportRef.current, width, height, THEME);
  }, [functions]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        sizeRef.current = { width, height };
        draw();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [functions, viewport, draw]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    draggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    const vp = viewportRef.current;
    onViewportChange({
      ...vp,
      centerX: vp.centerX - dx / vp.scale,
      centerY: vp.centerY + dy / vp.scale,
    });
  }, [onViewportChange]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vp = viewportRef.current;
      const rect = container.getBoundingClientRect();
      const { width, height } = sizeRef.current;

      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      const mathX = vp.centerX + (mouseScreenX - width / 2) / vp.scale;
      const mathY = vp.centerY - (mouseScreenY - height / 2) / vp.scale;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(1, Math.min(1e6, vp.scale * zoomFactor));

      const newCenterX = mathX - (mouseScreenX - width / 2) / newScale;
      const newCenterY = mathY + (mouseScreenY - height / 2) / newScale;

      onViewportChange({
        centerX: newCenterX,
        centerY: newCenterY,
        scale: newScale,
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [onViewportChange]);

  return (
    <div
      ref={containerRef}
      className="graph-canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
