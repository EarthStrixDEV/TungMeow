import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../data";
import type { TransactionType } from "../../data";

export type TypeFilter = TransactionType | "all";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
  category: string; // "all" or a category id
  onCategoryChange: (value: string) => void;
}

/** Combined income + expense categories, deduped by id (e.g. "Other"). */
const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].filter(
  (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
);

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export default function FilterBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const filterActive = type !== "all" || category !== "all";

  return (
    <div className="flex items-center gap-2">
      <label className="flex flex-1 desktop:flex-none desktop:w-[240px] items-center gap-2 bg-hover border border-line rounded-input px-3 py-2">
        <Search size={14} className="text-ink-faint shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search description or category…"
          className="w-full min-w-0 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
        />
      </label>

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 bg-hover border border-line rounded-input px-[14px] py-2 text-[13px] font-bold ${
            filterActive ? "text-blue-deep" : "text-ink"
          }`}
        >
          Filter
          <ChevronDown size={14} className={open ? "rotate-180" : ""} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 z-20 w-[220px] bg-surface border border-line rounded-input shadow-card p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.03em] text-ink-soft mb-1.5">
              Type
            </p>
            <div className="flex flex-col gap-1 mb-3">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="tx-type-filter"
                    checked={type === opt.value}
                    onChange={() => onTypeChange(opt.value)}
                    className="accent-[var(--color-blue)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.03em] text-ink-soft mb-1.5">
              Category
            </p>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-hover border border-line rounded-[8px] px-2 py-1.5 text-[13px] outline-none"
            >
              <option value="all">All</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
