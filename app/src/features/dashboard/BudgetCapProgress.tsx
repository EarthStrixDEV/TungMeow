import Card from "../../components/ui/Card";
import { categoryEmoji } from "../../data/categories";
import type { BudgetCap, DashboardStats } from "../../data/types";
import { budgetCapPct, deriveBudgetCapStatus } from "../../lib/budgetCap";
import { formatTHB } from "../../lib/format";

interface BudgetCapProgressProps {
  budgetCaps: BudgetCap[];
  categoryHistory: DashboardStats["categoryHistory"];
}

const BAR_BG: Record<"under" | "watch" | "over", string> = {
  under: "bg-green-soft",
  watch: "bg-orange-soft",
  over: "bg-red-soft",
};

const BAR_FILL: Record<"under" | "watch" | "over", string> = {
  under: "bg-green",
  watch: "bg-orange-decor",
  over: "bg-red",
};

const LABEL_TEXT: Record<"under" | "watch" | "over", string> = {
  under: "text-ink",
  watch: "text-orange-deep",
  over: "text-red",
};

export default function BudgetCapProgress({ budgetCaps, categoryHistory }: BudgetCapProgressProps) {
  if (budgetCaps.length === 0) return null;

  return (
    <Card className="flex-1 min-w-0 flex flex-col p-[16px_16px_8px] desktop:p-[22px_24px]">
      <h3 className="text-[15.5px] font-extrabold mb-3.5">Budget Caps</h3>
      <div className="flex flex-col gap-3.5">
        {budgetCaps.map((cap) => {
          const spent = categoryHistory.find((c) => c.category === cap.category)?.current ?? 0;
          const pct = budgetCapPct(spent, cap.monthlyLimit);
          const status = deriveBudgetCapStatus(spent, cap.monthlyLimit);

          return (
            <div key={cap.category}>
              <div className="flex justify-between text-[13px] font-bold mb-1.5">
                <span className={LABEL_TEXT[status]}>
                  {categoryEmoji(cap.category)} {cap.category}
                </span>
                <span className={LABEL_TEXT[status]}>
                  {formatTHB(spent)} / {formatTHB(cap.monthlyLimit)}
                </span>
              </div>
              <div className={`h-1.5 rounded-full ${BAR_BG[status]}`}>
                <div
                  className={`h-full rounded-full ${BAR_FILL[status]}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              {status === "over" && (
                <p className="mt-1 text-[12px] font-bold text-red">
                  Over by {formatTHB(spent - cap.monthlyLimit)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
