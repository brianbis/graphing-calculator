import ExpressionInput from './ExpressionInput';
import './FunctionRow.css';

interface Props {
  expression: string;
  color: string;
  visible: boolean;
  error: string | null;
  onExpressionChange: (expr: string) => void;
  onColorChange: (color: string) => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}

export default function FunctionRow({
  expression,
  color,
  visible,
  error,
  onExpressionChange,
  onColorChange,
  onToggleVisible,
  onDelete,
}: Props) {
  return (
    <div className="function-row">
      <div className="function-row-controls">
        <ExpressionInput
          value={expression}
          error={error}
          onChange={onExpressionChange}
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
