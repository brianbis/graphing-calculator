import type { PlottedFunction } from '../types';
import FunctionRow from './FunctionRow';
import './Sidebar.css';

interface Props {
  functions: PlottedFunction[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdateExpression: (id: string, expr: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onToggleVisibility: (id: string) => void;
}

export default function Sidebar({
  functions,
  onAdd,
  onRemove,
  onUpdateExpression,
  onUpdateColor,
  onToggleVisibility,
}: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Functions</h2>
        <button className="sidebar-add-btn" onClick={onAdd}>
          + Add
        </button>
      </div>
      <div className="sidebar-list">
        {functions.map((f) => (
          <FunctionRow
            key={f.id}
            expression={f.expression}
            color={f.color}
            visible={f.visible}
            error={f.error}
            onExpressionChange={(expr) => onUpdateExpression(f.id, expr)}
            onColorChange={(color) => onUpdateColor(f.id, color)}
            onToggleVisible={() => onToggleVisibility(f.id)}
            onDelete={() => onRemove(f.id)}
          />
        ))}
        {functions.length === 0 && (
          <div className="sidebar-empty">
            Click "+ Add" to plot a function
          </div>
        )}
      </div>
    </div>
  );
}
