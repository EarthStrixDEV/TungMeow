import { useState } from "react";
import Card from "../../components/ui/Card";
import { EXPENSE_CATEGORIES } from "../../data/categories";
import type { BudgetCap } from "../../data/types";

interface BudgetCapCardProps {
  budgetCaps: BudgetCap[];
  onSave: (category: string, monthlyLimit: number) => Promise<void>;
}

export default function BudgetCapCard({ budgetCaps, onSave }: BudgetCapCardProps) {
  const capByCategory: Record<string, number> = Object.fromEntries(
    budgetCaps.map((c) => [c.category, c.monthlyLimit]),
  );

  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      EXPENSE_CATEGORIES.map((c) => [c.id, capByCategory[c.id] !== undefined ? String(capByCategory[c.id]) : ""]),
    ),
  );
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const handleSave = async (category: string) => {
    const raw = drafts[category] ?? "";
    const amount = raw.trim() === "" ? 0 : Number(raw);
    if (!Number.isFinite(amount)) return;
    setSavingCategory(category);
    try {
      await onSave(category, amount);
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <Card className="p-4 desktop:px-6 desktop:py-[22px]">
      <h3 className="mb-3 text-[15.5px] font-extrabold">Budget Caps</h3>
      <div className="flex flex-col gap-3">
        {EXPENSE_CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2.5">
            <label htmlFor={`budget-cap-${cat.id}`} className="w-[112px] shrink-0 text-[13px] font-bold">
              {cat.emoji} {cat.id}
            </label>
            <input
              id={`budget-cap-${cat.id}`}
              type="number"
              min="0"
              value={drafts[cat.id]}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [cat.id]: e.target.value }))}
              className="flex-1 rounded-input border border-line px-3 py-2 text-sm"
              placeholder="No limit"
            />
            <button
              type="button"
              className="rounded-input bg-blue-soft px-3 py-2 text-[12.5px] font-bold text-blue-deep disabled:opacity-50"
              onClick={() => handleSave(cat.id)}
              disabled={savingCategory === cat.id}
            >
              {savingCategory === cat.id ? "Saving…" : "Save"}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
