import './Keypad.css';

interface Props {
  onInsert: (text: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

interface KeyDef {
  label: string;
  insert: string;
  className?: string;
}

const ROWS: KeyDef[][] = [
  [
    { label: 'sin', insert: 'sin(', className: 'key--fn' },
    { label: 'cos', insert: 'cos(', className: 'key--fn' },
    { label: 'tan', insert: 'tan(', className: 'key--fn' },
    { label: 'log', insert: 'log(', className: 'key--fn' },
  ],
  [
    { label: 'sqrt', insert: 'sqrt(', className: 'key--fn' },
    { label: 'abs', insert: 'abs(', className: 'key--fn' },
    { label: 'x', insert: 'x', className: 'key--fn' },
    { label: '^', insert: '^', className: 'key--op' },
  ],
  [
    { label: '7', insert: '7' },
    { label: '8', insert: '8' },
    { label: '9', insert: '9' },
    { label: '/', insert: '/', className: 'key--op' },
  ],
  [
    { label: '4', insert: '4' },
    { label: '5', insert: '5' },
    { label: '6', insert: '6' },
    { label: '*', insert: '*', className: 'key--op' },
  ],
  [
    { label: '1', insert: '1' },
    { label: '2', insert: '2' },
    { label: '3', insert: '3' },
    { label: '-', insert: '-', className: 'key--op' },
  ],
  [
    { label: '0', insert: '0' },
    { label: '.', insert: '.' },
    { label: 'pi', insert: 'pi', className: 'key--fn' },
    { label: '+', insert: '+', className: 'key--op' },
  ],
  [
    { label: '(', insert: '(' },
    { label: ')', insert: ')' },
    { label: 'DEL', insert: '__backspace__', className: 'key--action' },
    { label: 'CLR', insert: '__clear__', className: 'key--action' },
  ],
];

export default function Keypad({ onInsert, onClear, onBackspace }: Props) {
  const handleClick = (key: KeyDef) => {
    if (key.insert === '__backspace__') {
      onBackspace();
    } else if (key.insert === '__clear__') {
      onClear();
    } else {
      onInsert(key.insert);
    }
  };

  return (
    <div className="keypad">
      {ROWS.map((row, ri) => (
        <div key={ri} className="keypad-row">
          {row.map((key) => (
            <button
              key={key.label}
              className={`keypad-key ${key.className || ''}`}
              onClick={() => handleClick(key)}
            >
              {key.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
