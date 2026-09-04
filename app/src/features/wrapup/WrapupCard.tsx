import { forwardRef } from "react";
import { Link } from "react-router-dom";
import CatLogo from "../../components/brand/CatLogo";
import { formatTHB } from "../../lib/format";
import type { WrapupData } from "../../lib/wrapupData";

interface WrapupCardProps {
  data: WrapupData;
}

const PERIOD_LABEL: Record<WrapupData["period"], string> = {
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
};

const WrapupCard = forwardRef<HTMLDivElement, WrapupCardProps>(({ data }, ref) => {
  if (!data.hasTransactions) {
    return (
      <div
        ref={ref}
        className="bg-surface rounded-card shadow-card p-8 flex flex-col items-center text-center gap-3"
      >
        <CatLogo size={56} mood="neutral" />
        <h2 className="text-[18px] font-extrabold">No transactions yet this period</h2>
        <p className="text-sm text-ink-soft">
          Log a few transactions and check back — meow's waiting to celebrate with you! 🐾
        </p>
        <Link
          to="/add"
          className="rounded-input bg-blue-soft px-4 py-2 text-[12.5px] font-bold text-blue-deep"
        >
          Add a transaction
        </Link>
      </div>
    );
  }

  const net = data.income - data.expense;

  return (
    <div
      ref={ref}
      className="bg-surface rounded-card shadow-card p-6 desktop:p-8 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <CatLogo size={48} mood={net >= 0 ? "happy" : "worried"} />
        <div>
          <div className="text-[11px] font-bold text-ink-soft">TungMeow Wrap-up</div>
          <h2 className="text-[20px] font-extrabold font-display">{PERIOD_LABEL[data.period]}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-input bg-blue-soft p-3">
          <div className="text-[11px] font-bold text-blue-deep">Income</div>
          <div className="text-[17px] font-extrabold text-blue-deep">{formatTHB(data.income)}</div>
        </div>
        <div className="rounded-input bg-orange-soft p-3">
          <div className="text-[11px] font-bold text-orange-deep">Expense</div>
          <div className="text-[17px] font-extrabold text-orange-deep">{formatTHB(data.expense)}</div>
        </div>
      </div>

      {data.topCategory && (
        <p className="text-sm text-ink-soft">
          Top category: <span className="font-bold text-ink">{data.topCategory.emoji} {data.topCategory.category}</span> ({formatTHB(data.topCategory.amount)})
        </p>
      )}

      {data.balanceChange !== null && (
        <p className="text-sm text-ink-soft">
          Balance is {data.balanceChange >= 0 ? "up" : "down"}{" "}
          <span className="font-bold text-ink">{Math.abs(data.balanceChange).toFixed(1)}%</span> vs last period.
        </p>
      )}

      {data.savedBowls > 0 && (
        <p className="text-sm font-bold text-ink">
          You saved enough for {data.savedBowls} bowls of wet cat food 🐟
        </p>
      )}

      {data.savingsGoalProgressPct !== null && (
        <p className="text-sm text-ink-soft">
          Savings goal progress: <span className="font-bold text-ink">{Math.min(100, Math.round(data.savingsGoalProgressPct))}%</span> 🐷
        </p>
      )}

      {data.badgesEarnedThisMonth.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-ink-soft mb-1.5">Badges earned this period</div>
          <div className="flex gap-2 flex-wrap">
            {data.badgesEarnedThisMonth.map((badge) => (
              <span key={badge.id} className="rounded-input bg-hover px-2.5 py-1.5 text-[12px] font-bold">
                {badge.emoji} {badge.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

WrapupCard.displayName = "WrapupCard";

export default WrapupCard;
