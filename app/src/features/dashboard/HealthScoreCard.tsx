import { useEffect, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import { deriveHealthStatus } from "../../lib/healthScore";
import type { HealthStatus } from "../../lib/healthScore";

interface HealthScoreCardProps {
  income: number;
  expense: number;
}

const STATUS_EMOJI: Record<HealthStatus, string> = {
  healthy: "🟢",
  watch: "🟡",
  overspending: "🔴",
  neutral: "⚪",
};

const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: "Healthy",
  watch: "Watch",
  overspending: "Overspending",
  neutral: "No data yet",
};

function explanationCopy(status: HealthStatus, income: number, expense: number): string {
  if (status === "neutral") {
    return "No income logged yet this period — log some income to see your health status.";
  }
  const pct = ((expense / income) * 100).toFixed(0);
  if (status === "healthy") {
    return `You've spent ${pct}% of your income this period — comfortably under 80%.`;
  }
  if (status === "watch") {
    return `You've spent ${pct}% of your income this period — getting close to breaking even.`;
  }
  return `You've spent ${pct}% of your income this period — over 100%, you're dipping into savings.`;
}

export default function HealthScoreCard({ income, expense }: HealthScoreCardProps) {
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

  const status = deriveHealthStatus(income, expense);

  return (
    <Card className="p-[14px_16px] desktop:p-[20px_22px]">
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 text-left"
        >
          <span className="text-[32px] leading-none">{STATUS_EMOJI[status]}</span>
          <div>
            <div className="text-[11px] font-bold text-ink-soft">Health Score</div>
            <div className="text-[15px] font-extrabold">{STATUS_LABEL[status]}</div>
          </div>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 z-20 w-[260px] bg-surface border border-line rounded-input shadow-card p-3">
            <p className="text-[13px] text-ink-soft">{explanationCopy(status, income, expense)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
