import type { TransactionType } from "../../data";

interface TypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export default function TypeToggle({ value, onChange }: TypeToggleProps) {
  const base =
    "flex-1 py-3 rounded-[12px] text-sm font-extrabold text-center cursor-pointer transition-colors";
  return (
    <div className="flex gap-2.5 bg-hover rounded-[14px] p-1">
      <button
        type="button"
        aria-pressed={value === "income"}
        className={`${base} ${value === "income" ? "bg-blue text-white" : "text-ink-soft"}`}
        onClick={() => onChange("income")}
      >
        ↓ Income
      </button>
      <button
        type="button"
        aria-pressed={value === "expense"}
        className={`${base} ${value === "expense" ? "bg-orange text-white" : "text-ink-soft"}`}
        onClick={() => onChange("expense")}
      >
        ↑ Expense
      </button>
    </div>
  );
}
