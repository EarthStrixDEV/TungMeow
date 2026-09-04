import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import PiggyBank from "../../components/brand/PiggyBank";
import { dataService } from "../../data";
import { clearGoal, getGoal, setGoal } from "../../lib/localGoals";
import { formatTHB } from "../../lib/format";
import { highestMilestoneReached, progressPct } from "../../lib/savingsProgress";

const SAVINGS_ACCOUNT_ID = "savings";

const MILESTONE_COPY: Record<25 | 50 | 75 | 100, string> = {
  25: "25% there — the piggy bank is filling up! 🐷",
  50: "Halfway to your goal! 🎉",
  75: "75% there — almost at the finish line! 🚀",
  100: "Goal reached! Meow's so proud of you! 🏆",
};

export default function SavingsGoalCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let cancelled = false;
    dataService.listAccountSummaries().then((accounts) => {
      if (cancelled) return;
      const savings = accounts.find((a) => a.id === SAVINGS_ACCOUNT_ID);
      setBalance(savings?.balance ?? 0);
    });
    const goal = getGoal(SAVINGS_ACCOUNT_ID);
    setTargetAmount(goal?.targetAmount ?? null);
    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    setInputValue(targetAmount !== null ? String(targetAmount) : "");
    setEditing(true);
  };

  const handleSave = () => {
    const amount = Number(inputValue);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setGoal(SAVINGS_ACCOUNT_ID, amount);
    setTargetAmount(amount);
    setEditing(false);
  };

  const handleRemove = () => {
    clearGoal(SAVINGS_ACCOUNT_ID);
    setTargetAmount(null);
    setEditing(false);
  };

  if (balance === null) return null;

  const pct = targetAmount !== null ? progressPct(balance, targetAmount) : 0;
  const milestone = targetAmount !== null ? highestMilestoneReached(pct) : null;

  return (
    <Card className="p-4 desktop:px-6 desktop:py-[22px]">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15.5px] font-extrabold">Savings Goal</h3>
        {targetAmount !== null && !editing && (
          <button
            type="button"
            className="rounded-input bg-blue-soft px-3 py-2 text-[12.5px] font-bold text-blue-deep"
            onClick={startEditing}
          >
            Edit goal
          </button>
        )}
      </div>

      {targetAmount === null && !editing && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <PiggyBank size={64} fillPct={0} />
          <p className="text-sm text-ink-soft">
            Set a savings goal to start filling the piggy bank 🐷
          </p>
          <button
            type="button"
            className="rounded-input bg-blue-soft px-4 py-2 text-[12.5px] font-bold text-blue-deep"
            onClick={startEditing}
          >
            Set a goal
          </button>
        </div>
      )}

      {editing && (
        <div className="flex flex-col gap-2.5 py-2">
          <label className="text-xs font-bold text-ink-soft" htmlFor="savings-goal-input">
            Target amount (฿)
          </label>
          <input
            id="savings-goal-input"
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded-input border border-line px-3 py-2 text-sm"
            placeholder="10000"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-input bg-blue-soft px-4 py-2 text-[12.5px] font-bold text-blue-deep"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-input border border-line px-4 py-2 text-[12.5px] font-bold text-ink-soft"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            {targetAmount !== null && (
              <button
                type="button"
                className="ml-auto rounded-input px-4 py-2 text-[12.5px] font-bold text-red"
                onClick={handleRemove}
              >
                Remove goal
              </button>
            )}
          </div>
        </div>
      )}

      {targetAmount !== null && !editing && (
        <div className="flex items-center gap-4 py-2">
          <PiggyBank size={64} fillPct={pct} />
          <div className="flex-1">
            <div className="text-sm font-bold">
              {formatTHB(balance)} / {formatTHB(targetAmount)} — {Math.min(100, Math.round(pct))}%
            </div>
            {milestone !== null && (
              <p className="mt-1 text-[12.5px] font-bold text-orange-deep">{MILESTONE_COPY[milestone]}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
