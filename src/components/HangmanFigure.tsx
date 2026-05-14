interface Props {
  wrongCount: number;
}

// 6 stages: head, body, left arm, right arm, left leg, right leg
export function HangmanFigure({ wrongCount }: Props) {
  return (
    <svg viewBox="0 0 220 260" className="w-56 h-64 mx-auto">
      {/* Gallows */}
      <line
        x1="20"
        y1="240"
        x2="180"
        y2="240"
        stroke="oklch(0.45 0.1 50)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="240"
        x2="50"
        y2="20"
        stroke="oklch(0.45 0.1 50)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="20"
        x2="150"
        y2="20"
        stroke="oklch(0.45 0.1 50)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="20"
        x2="150"
        y2="50"
        stroke="oklch(0.45 0.1 50)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Body parts */}
      {wrongCount >= 1 && (
        <circle cx="150" cy="70" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
      )}
      {wrongCount >= 2 && (
        <line x1="150" y1="90" x2="150" y2="160" stroke="currentColor" strokeWidth="4" />
      )}
      {wrongCount >= 3 && (
        <line x1="150" y1="110" x2="120" y2="140" stroke="currentColor" strokeWidth="4" />
      )}
      {wrongCount >= 4 && (
        <line x1="150" y1="110" x2="180" y2="140" stroke="currentColor" strokeWidth="4" />
      )}
      {wrongCount >= 5 && (
        <line x1="150" y1="160" x2="125" y2="200" stroke="currentColor" strokeWidth="4" />
      )}
      {wrongCount >= 6 && (
        <line x1="150" y1="160" x2="175" y2="200" stroke="currentColor" strokeWidth="4" />
      )}
    </svg>
  );
}
