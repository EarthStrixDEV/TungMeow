import { useEffect, useRef, useState } from "react";
import { dataService, type DashboardStats } from "../data";
import ExportButton from "../features/wrapup/ExportButton";
import WrapupCard from "../features/wrapup/WrapupCard";
import { getGoal } from "../lib/localGoals";
import { listUnlocked } from "../lib/localBadges";
import { buildWrapupData } from "../lib/wrapupData";
import Spinner from "../components/ui/Spinner";

const SAVINGS_ACCOUNT_ID = "savings";

export default function WrapupPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [savingsBalance, setSavingsBalance] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    dataService.getDashboardStats("month").then((s) => {
      if (!cancelled) setStats(s);
    });
    dataService.listAccountSummaries().then((accounts) => {
      if (cancelled) return;
      const savings = accounts.find((a) => a.id === SAVINGS_ACCOUNT_ID);
      setSavingsBalance(savings?.balance ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (stats === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const savingsGoal = getGoal(SAVINGS_ACCOUNT_ID);
  const unlockedBadges = listUnlocked();
  const data = buildWrapupData(stats, "month", savingsGoal, savingsBalance, unlockedBadges);

  return (
    <div className="flex max-w-[560px] flex-col gap-4 desktop:gap-5">
      <header>
        <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Monthly Wrap-up</h1>
        <p className="mt-1 text-sm text-ink-soft">A shareable snapshot of your month so far</p>
      </header>

      <WrapupCard ref={cardRef} data={data} />

      {data.hasTransactions && <ExportButton targetRef={cardRef} />}
    </div>
  );
}
