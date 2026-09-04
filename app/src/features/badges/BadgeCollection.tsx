import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import Card from "../../components/ui/Card";
import { BADGE_DEFS } from "../../lib/badges";
import { listUnlocked } from "../../lib/localBadges";
import type { UnlockedBadge } from "../../lib/localBadges";
import { formatDate } from "../../lib/format";

export default function BadgeCollection() {
  const [unlocked, setUnlocked] = useState<Record<string, UnlockedBadge>>({});

  useEffect(() => {
    setUnlocked(listUnlocked());
  }, []);

  return (
    <div className="grid grid-cols-2 desktop:grid-cols-3 gap-3">
      {BADGE_DEFS.map((badge) => {
        const unlock = unlocked[badge.id];
        const isUnlocked = unlock !== undefined;

        return (
          <Card
            key={badge.id}
            className={`p-4 flex flex-col items-center text-center gap-1.5 ${
              isUnlocked ? "" : "opacity-60"
            }`}
          >
            <span className={`text-[32px] leading-none ${isUnlocked ? "" : "grayscale"}`}>
              {isUnlocked ? badge.emoji : <Lock size={28} className="text-ink-faint" />}
            </span>
            <div className="text-[13px] font-extrabold">{badge.label}</div>
            <p className="text-[11.5px] text-ink-soft">{badge.description}</p>
            {isUnlocked && (
              <span className="text-[10.5px] font-bold text-orange-deep">
                Unlocked {formatDate(unlock.unlockedAt.slice(0, 10))}
              </span>
            )}
          </Card>
        );
      })}
    </div>
  );
}
