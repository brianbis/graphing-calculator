import { useRef, useEffect, useCallback } from 'react';
import type { Viewport } from '../types';
import { renderGraph, type CompiledFunction } from '../utils/canvasRenderer';
import './GraphCanvas.css';

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
  // Keep latest viewport in a ref so event handlers always see current value
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
    renderGraph(ctx, functions, viewportRef.current, width, height);
  }, [functions]);

  // Resize observer
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

  // Redraw when functions or viewport change
  useEffect(() => {
    draw();
  }, [functions, viewport, draw]);

  // Mouse handlers for pan
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

  // Wheel handler for zoom — attached manually with { passive: false }
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vp = viewportRef.current;
      const rect = container.getBoundingClientRect();
      const { width, height } = sizeRef.current;

      // Mouse position in screen coords relative to canvas
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      // Math point under cursor before zoom
      const mathX = vp.centerX + (mouseScreenX - width / 2) / vp.scale;
      const mathY = vp.centerY - (mouseScreenY - height / 2) / vp.scale;

      // Zoom factor
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(1, Math.min(1e6, vp.scale * zoomFactor));

      // Adjust center so math point under cursor stays fixed
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
