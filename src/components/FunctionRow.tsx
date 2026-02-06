import ExpressionInput from './ExpressionInput';
import './FunctionRow.css';

interface Props {
  expression: string;
  color: string;
  visible: boolean;
  error: string | null;
  active: boolean;
  onExpressionChange: (expr: string) => void;
  onColorChange: (color: string) => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  onFocus: () => void;
}

export default function FunctionRow({
  expression,
  color,
  visible,
  error,
  active,
  onExpressionChange,
  onColorChange,
  onToggleVisible,
  onDelete,
  onFocus,
}: Props) {
  return (
    <div className={`function-row ${active ? 'function-row--active' : ''}`}>
      <div className="function-row-controls">
        <ExpressionInput
          value={expression}
          error={error}
          onChange={onExpressionChange}
          onFocus={onFocus}
        />
        <input
          type="color"
          className="function-row-color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          title="Change color"
        />
        <button
          className={`function-row-btn ${visible ? '' : 'function-row-btn--off'}`}
          onClick={onToggleVisible}
          title={visible ? 'Hide function' : 'Show function'}
        >
          {visible ? '👁' : '👁‍🗨'}
        </button>
        <button
          className="function-row-btn function-row-btn--delete"
          onClick={onDelete}
          title="Remove function"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
