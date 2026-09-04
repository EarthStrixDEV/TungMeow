const STORAGE_KEY = "tungmeow.unlockedBadges.v1";

export interface UnlockedBadge {
  unlockedAt: string;
}

type BadgeStore = Record<string, UnlockedBadge>;

function readAll(): BadgeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: BadgeStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable or over quota — badge state is non-critical, fail silently.
  }
}

export function isUnlocked(badgeId: string): boolean {
  return badgeId in readAll();
}

/** Unlocks a badge if not already unlocked. Returns true only when this call newly unlocked it — the signal callers use to decide whether to show a celebration. */
export function unlock(badgeId: string): boolean {
  const all = readAll();
  if (all[badgeId]) return false;
  all[badgeId] = { unlockedAt: new Date().toISOString() };
  writeAll(all);
  return true;
}

export function listUnlocked(): BadgeStore {
  return readAll();
}
