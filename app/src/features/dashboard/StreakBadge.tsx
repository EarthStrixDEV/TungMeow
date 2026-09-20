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

  return (
    <Pill tone="orange">
      <span className="whitespace-nowrap">
        🔥 {streak.count}-day streak
      </span>
      <span className="hidden desktop:inline whitespace-nowrap">
        {isToday ? " — keep it up!" : " — log today to keep it going!"}
      </span>
    </Pill>
  );
}
