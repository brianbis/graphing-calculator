import './ExpressionInput.css';

interface Props {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export default function ExpressionInput({ value, error, onChange, onFocus }: Props) {
  return (
    <div className="expression-input-wrapper">
      <input
        type="text"
        className={`expression-input ${error ? 'expression-input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="e.g. x^2, sin(x)"
        spellCheck={false}
        autoComplete="off"
      />
      {error && <div className="expression-input-error">{error}</div>}
    </div>
  );
}
