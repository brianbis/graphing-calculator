export interface PlottedFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  error: string | null;
}

export interface Viewport {
  centerX: number;
  centerY: number;
  scale: number; // pixels per math unit
}
