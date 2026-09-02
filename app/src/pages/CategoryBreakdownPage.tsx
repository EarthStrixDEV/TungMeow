import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CatLogo from "../components/brand/CatLogo";
import SegmentedControl from "../components/ui/SegmentedControl";
import Spinner from "../components/ui/Spinner";
import { dataService, type DashboardStats, type Period } from "../data";
import DonutChart from "../features/category-breakdown/DonutChart";
import { formatFullDate } from "../lib/format";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

export default function CategoryBreakdownPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    dataService.getDashboardStats(period).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const categories = useMemo(() => {
    if (!stats) return [];
    return stats.categoryHistory.filter((c) => c.current > 0);
  }, [stats]);

  const handleSliceClick = (category: string) => {
    navigate(`/transactions?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Category Breakdown</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatFullDate(new Date())} · All accounts
          </p>
        </div>
        <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </header>

      {stats === null ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <CatLogo mood="neutral" size={64} />
          <p className="text-sm text-ink-soft max-w-xs">
            No spending logged this {period} yet — meow's waiting for your first entry!
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 bg-blue text-white rounded-input font-bold text-[13.5px] px-4 py-2 shadow-[0_4px_12px_-4px_rgba(58,99,196,0.5)]"
          >
            <Plus size={16} strokeWidth={2.4} />
            Add Entry
          </Link>
        </div>
      ) : (
        <DonutChart categories={categories} onSliceClick={handleSliceClick} />
      )}
    </>
  );
}
