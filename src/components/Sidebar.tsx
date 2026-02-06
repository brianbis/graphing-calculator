import type { PlottedFunction } from '../types';
import FunctionRow from './FunctionRow';
import Keypad from './Keypad';
import './Sidebar.css';

interface Props {
  functions: PlottedFunction[];
  activeFunctionId: string | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdateExpression: (id: string, expr: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onToggleVisibility: (id: string) => void;
  onSetActive: (id: string) => void;
  onKeypadInsert: (text: string) => void;
  onKeypadClear: () => void;
  onKeypadBackspace: () => void;
}

export default function Sidebar({
  functions,
  activeFunctionId,
  onAdd,
  onRemove,
  onUpdateExpression,
  onUpdateColor,
  onToggleVisibility,
  onSetActive,
  onKeypadInsert,
  onKeypadClear,
  onKeypadBackspace,
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
            active={f.id === activeFunctionId}
            onExpressionChange={(expr) => onUpdateExpression(f.id, expr)}
            onColorChange={(color) => onUpdateColor(f.id, color)}
            onToggleVisible={() => onToggleVisibility(f.id)}
            onDelete={() => onRemove(f.id)}
            onFocus={() => onSetActive(f.id)}
          />
        ))}
        {functions.length === 0 && (
          <div className="sidebar-empty">
            Click "+ Add" to plot a function
          </div>
        )}
      </div>
      <Keypad
        onInsert={onKeypadInsert}
        onClear={onKeypadClear}
        onBackspace={onKeypadBackspace}
      />
    </div>
  );
}
