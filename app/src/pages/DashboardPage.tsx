import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Pill from "../components/ui/Pill";
import SegmentedControl from "../components/ui/SegmentedControl";
import Spinner from "../components/ui/Spinner";
import { dataService, type DashboardStats, type Period, type Transaction } from "../data";
import AnomalyAlert from "../features/dashboard/AnomalyAlert";
import IncomeExpenseChart from "../features/dashboard/IncomeExpenseChart";
import MascotCard from "../features/dashboard/MascotCard";
import RecentTransactions from "../features/dashboard/RecentTransactions";
import StatCard from "../features/dashboard/StatCard";
import StreakBadge from "../features/dashboard/StreakBadge";
import TopCategories from "../features/dashboard/TopCategories";
import { detectAnomalies } from "../lib/anomaly";
import { formatFullDate, formatTHB } from "../lib/format";
import { periodRange } from "../lib/periods";

/** Parse "yyyy-mm-dd" as a local Date (midnight) — avoids UTC shift from `new Date(isoString)`. */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<(Transaction & { accountName: string })[]>([]);

  useEffect(() => {
    let cancelled = false;
    dataService.getDashboardStats(period).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    let cancelled = false;
    dataService.listRecentTransactions(3).then((items) => {
      if (!cancelled) setRecent(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasEnoughHistory = useMemo(() => {
    if (!stats || stats.earliestTransactionDate === null) return false;
    return parseISO(stats.earliestTransactionDate) <= periodRange(period, -3).start;
  }, [stats, period]);

  const anomalies = useMemo(() => {
    if (!stats) return [];
    return detectAnomalies(stats.categoryHistory, hasEnoughHistory);
  }, [stats, hasEnoughHistory]);

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Overview</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatFullDate(new Date())} · All accounts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {stats !== null && <StreakBadge streak={stats.streak} />}
          <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
          <div className="hidden desktop:flex w-[34px] h-[34px] rounded-full bg-blue-soft text-blue-deep text-[13px] font-extrabold items-center justify-center">
            P
          </div>
        </div>
      </header>

      {stats === null ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <MascotCard balanceDeltaPct={stats.balanceDeltaPct} period={period} />

          <AnomalyAlert anomalies={anomalies} />

          <div className="flex flex-col desktop:flex-row gap-3 desktop:gap-[18px]">
            <StatCard
              label="Balance"
              value={formatTHB(stats.balance)}
              icon={<Wallet size={18} className="text-ink-faint" />}
              pill={
                stats.balanceDeltaPct !== null && (
                  <Pill tone="green">
                    {stats.balanceDeltaPct >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(stats.balanceDeltaPct).toFixed(1)}% vs last {period}
                  </Pill>
                )
              }
            />
            <StatCard
              label="Income"
              value={formatTHB(stats.income)}
              icon={<ArrowUpRight size={18} className="text-blue-decor" />}
              pill={
                <Pill tone="blue">
                  {stats.incomeSourceCount} {stats.incomeSourceCount === 1 ? "source" : "sources"}
                </Pill>
              }
            />
            <StatCard
              label="Expense"
              value={formatTHB(stats.expense)}
              icon={<ArrowDownRight size={18} className="text-orange-decor" />}
              pill={
                <Pill tone="orange">
                  {stats.expenseTxCount} {stats.expenseTxCount === 1 ? "transaction" : "transactions"}
                </Pill>
              }
            />
          </div>

          <div className="flex flex-col desktop:flex-row gap-4 desktop:gap-[18px]">
            <IncomeExpenseChart chart={stats.chart} period={period} />
            <TopCategories categories={stats.topCategories} />
          </div>

          <RecentTransactions items={recent} />
        </>
      )}
    </>
  );
}
