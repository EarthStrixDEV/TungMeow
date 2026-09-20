import { useEffect, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import CatLogo from "../../components/brand/CatLogo";
import { deriveMascotMood } from "../../lib/mascotMood";
import type { MascotMood } from "../../lib/mascotMood";
import type { Period } from "../../data";

interface MascotCardProps {
  balanceDeltaPct: number | null;
  period: Period;
}

const MOOD_LABEL: Record<MascotMood, string> = {
  happy: "Meow's happy!",
  worried: "Meow's a little worried…",
  neutral: "Meow's watching and waiting.",
};

function explanationCopy(mood: MascotMood, balanceDeltaPct: number | null, period: Period): string {
  if (mood === "neutral" || balanceDeltaPct === null) {
    return "Not enough history yet to compare — keep logging and I'll start tracking your trend!";
  }
  const pct = Math.abs(balanceDeltaPct).toFixed(1);
  if (mood === "worried") {
    return `Your balance dropped ${pct}% vs last ${period} — let's keep an eye on spending.`;
  }
  return `Your balance is up ${pct}% vs last ${period}, meow's happy!`;
}

export default function MascotCard({ balanceDeltaPct, period }: MascotCardProps) {
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

  const mood = deriveMascotMood(balanceDeltaPct);

  return (
    <Card className="flex-1 min-w-0 p-[14px_16px] desktop:p-[20px_22px]">
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 text-left"
        >
          <CatLogo size={48} mood={mood} />
          <span className="text-[15px] font-extrabold">{MOOD_LABEL[mood]}</span>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 z-20 w-[260px] bg-surface border border-line rounded-input shadow-card p-3">
            <p className="text-[13px] text-ink-soft">{explanationCopy(mood, balanceDeltaPct, period)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
