import { useEffect, useState } from "react";

const PIP_LAYOUTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export default function Dice({ value, disabled, rolling, onRoll, colorHex }) {
  const [displayValue, setDisplayValue] = useState(value || 1);

  useEffect(() => {
    if (!rolling) {
      if (value) setDisplayValue(value);
      return;
    }
    const interval = setInterval(() => {
      setDisplayValue(1 + Math.floor(Math.random() * 6));
    }, 80);
    return () => clearInterval(interval);
  }, [rolling, value]);

  const pips = PIP_LAYOUTS[displayValue] || [];

  return (
    <button
      className="dice"
      onClick={onRoll}
      disabled={disabled}
      style={{ "--dice-accent": colorHex }}
      aria-label="Roll dice"
    >
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="2" y="2" width="56" height="56" rx="12" fill="#fff" stroke="var(--dice-accent)" strokeWidth="3" />
        {pips.map(([r, c], i) => (
          <circle key={i} cx={13 + c * 17} cy={13 + r * 17} r="4.2" fill="var(--dice-accent)" />
        ))}
      </svg>
    </button>
  );
}
