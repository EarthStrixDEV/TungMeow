interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Keep only digits and at most one ".", trimmed to 2 decimals. */
function sanitize(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

export default function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <input
      inputMode="decimal"
      placeholder="0.00"
      value={value}
      onChange={(e) => onChange(sanitize(e.target.value))}
      className="w-full text-center text-[22px] font-extrabold text-ink bg-hover rounded-input border-none py-3 outline-none placeholder:text-ink-soft"
    />
  );
}
