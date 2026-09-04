import { BADGE_DEFS } from "./badges";
import type { BadgeCheckContext, BadgeDef } from "./badges";
import { unlock } from "./localBadges";

/**
 * Checks every badge condition against `ctx` and unlocks any that newly
 * qualify. Runs as a single synchronous loop, so badges that qualify in
 * the same call can't race each other over the shared localStorage blob —
 * no lock/mutex needed here.
 */
export function evaluateBadges(ctx: BadgeCheckContext): BadgeDef[] {
  const newlyUnlocked: BadgeDef[] = [];
  for (const badge of BADGE_DEFS) {
    if (badge.check(ctx) && unlock(badge.id)) {
      newlyUnlocked.push(badge);
    }
  }
  return newlyUnlocked;
}
