interface PiggyBankProps {
  size?: number;
  /** 0-100+ fill level; visually capped at 100% even if the underlying % exceeds it. */
  fillPct: number;
}

const BODY_TOP = 34;
const BODY_BOTTOM = 78;

export default function PiggyBank({ size = 64, fillPct }: PiggyBankProps) {
  const clamped = Math.max(0, Math.min(100, fillPct));
  const fillY = BODY_BOTTOM - ((BODY_BOTTOM - BODY_TOP) * clamped) / 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="piggy-body-clip">
          <ellipse cx="48" cy="56" rx="30" ry="22" />
        </clipPath>
      </defs>

      {/* Empty body outline */}
      <ellipse cx="48" cy="56" rx="30" ry="22" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="2.5" />

      {/* Fill level, clipped to the body shape */}
      <g clipPath="url(#piggy-body-clip)">
        <rect x="16" y={fillY} width="64" height={BODY_BOTTOM - fillY + 10} fill="var(--color-orange-decor)" />
      </g>

      {/* Legs */}
      <rect x="28" y="72" width="7" height="10" rx="2.5" fill="var(--color-orange)" />
      <rect x="61" y="72" width="7" height="10" rx="2.5" fill="var(--color-orange)" />

      {/* Snout */}
      <ellipse cx="76" cy="54" rx="7" ry="6" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="2" />
      <circle cx="74" cy="54" r="1.4" fill="var(--color-orange)" />
      <circle cx="78" cy="54" r="1.4" fill="var(--color-orange)" />

      {/* Ear */}
      <path d="M32 36 26 26 38 32Z" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="2" strokeLinejoin="round" />

      {/* Eye */}
      <circle cx="40" cy="48" r="2.2" fill="var(--color-ink)" />

      {/* Coin slot */}
      <rect x="42" y="36" width="12" height="3" rx="1.5" fill="var(--color-ink)" />
    </svg>
  );
}
