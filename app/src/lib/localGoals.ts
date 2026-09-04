const STORAGE_KEY = "tungmeow.savingsGoals.v1";

export interface SavingsGoal {
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
}

type GoalStore = Record<string, SavingsGoal>;

function readAll(): GoalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: GoalStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable or over quota — goal-setting is non-critical, fail silently.
  }
}

export function getGoal(accountId: string): SavingsGoal | null {
  return readAll()[accountId] ?? null;
}

export function setGoal(accountId: string, targetAmount: number): void {
  const all = readAll();
  const now = new Date().toISOString();
  const existing = all[accountId];
  all[accountId] = {
    targetAmount,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  writeAll(all);
}

export function clearGoal(accountId: string): void {
  const all = readAll();
  delete all[accountId];
  writeAll(all);
}
