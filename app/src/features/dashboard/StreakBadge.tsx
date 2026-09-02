import Pill from "../../components/ui/Pill";
import type { DashboardStats } from "../../data";

interface StreakBadgeProps {
  streak: DashboardStats["streak"];
}

/** Today's local date as `yyyy-mm-dd` (avoids UTC shift from `toISOString`). */
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak.lastLoggedDate === null) return null;

  const isToday = streak.lastLoggedDate === todayISO();
  const copy = isToday
    ? `🔥 ${streak.count}-day streak — keep it up!`
    : `🔥 ${streak.count}-day streak — log today to keep it going!`;

  return <Pill tone="orange">{copy}</Pill>;
}
