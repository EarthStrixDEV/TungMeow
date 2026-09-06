import type { DataService } from "./DataService";
import type {
  Account,
  AccountSummary,
  BudgetCap,
  ConnectionInfo,
  DashboardStats,
  OcrSlipInput,
  OcrSlipResult,
  Period,
  Transaction,
  TransactionPage,
  TransactionQuery,
} from "./types";
import { categoryEmoji } from "./categories";
import { SEED_ACCOUNTS, generateSeedTransactions } from "./seed";
import { periodLabel, periodRange } from "../lib/periods";

const READ_DELAY_MS = 250;
const WRITE_DELAY_MS = 500;
const INIT_DELAY_MS = 1200;
const DEFAULT_PAGE_SIZE = 25;
const OCR_DELAY_MS = 1800; // gives the staged-progress UI time to show both captions

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Parse "yyyy-mm-dd" as a local Date (midnight). */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local-timezone today as yyyy-mm-dd (toISOString would shift across UTC). */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function rowNumber(id: string): number {
  return Number(id.slice(id.lastIndexOf(":") + 1));
}

/** date desc, tie-break row number desc (later rows first). */
function byDateDesc(a: Transaction, b: Transaction): number {
  return b.date.localeCompare(a.date) || rowNumber(b.id) - rowNumber(a.id);
}

interface Store {
  accounts: Account[];
  transactions: Transaction[];
  /** Next free row per sheet tab (row 1 = header). */
  nextRowByTab: Map<string, number>;
  lastSyncedAt: string;
  budgetCaps: BudgetCap[];
}

let store: Store | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Builds the seed store exactly once; concurrent callers share the same
 * promise. Every public method awaits this, so deep-linking straight to any
 * route works — the first data call just pays the init latency.
 */
function ensureInit(): Promise<void> {
  initPromise ??= (async () => {
    await delay(INIT_DELAY_MS);
    const transactions = generateSeedTransactions();
    const nextRowByTab = new Map<string, number>();
    for (const account of SEED_ACCOUNTS) {
      const count = transactions.filter((t) => t.accountId === account.id).length;
      nextRowByTab.set(account.sheetTabName, count + 2);
    }
    store = {
      accounts: SEED_ACCOUNTS,
      transactions,
      nextRowByTab,
      lastSyncedAt: new Date().toISOString(),
      budgetCaps: [],
    };
  })();
  return initPromise;
}

function requireStore(): Store {
  if (!store) throw new Error("mockDataService: store not initialized");
  return store;
}

function sumWindow(transactions: Transaction[], start: Date, end: Date) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const d = parseISO(t.date).getTime();
    if (d < start.getTime() || d >= end.getTime()) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense };
}

/** Sums expense amounts per category for transactions whose date falls within [start, end). */
function expenseByCategoryInWindow(transactions: Transaction[], start: Date, end: Date): Map<string, number> {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = parseISO(t.date).getTime();
    if (d < start.getTime() || d >= end.getTime()) continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  return byCategory;
}

/**
 * Consecutive-day logging streak ending at the most recent logged date.
 * Note: seed data (seed.ts) doesn't place transactions on consecutive days, so this will typically compute to 1-2 in dev — expected, not a bug.
 */
function computeStreak(transactions: Transaction[]): { count: number; lastLoggedDate: string | null } {
  const dates = new Set<string>();
  for (const t of transactions) dates.add(t.date);
  if (dates.size === 0) return { count: 0, lastLoggedDate: null };

  // ISO "yyyy-mm-dd" strings sort lexicographically, so max() is just a string compare.
  let lastLoggedDate = "";
  for (const d of dates) {
    if (d > lastLoggedDate) lastLoggedDate = d;
  }

  let count = 0;
  let cursor = parseISO(lastLoggedDate);
  for (;;) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    if (!dates.has(iso)) break;
    count++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }

  return { count, lastLoggedDate };
}

export const mockDataService: DataService = {
  async init() {
    await ensureInit();
  },

  async listAccounts() {
    await ensureInit();
    await delay(READ_DELAY_MS);
    return requireStore().accounts.map((a) => ({ ...a }));
  },

  async listAccountSummaries() {
    await ensureInit();
    await delay(READ_DELAY_MS);
    const { accounts, transactions } = requireStore();
    return accounts.map((account) => {
      let balance = 0;
      let rowCount = 0;
      for (const t of transactions) {
        if (t.accountId !== account.id) continue;
        rowCount++;
        balance += t.type === "income" ? t.amount : -t.amount;
      }
      return { ...account, balance, rowCount } satisfies AccountSummary;
    });
  },

  async listTransactions(accountId: string, q: TransactionQuery = {}): Promise<TransactionPage> {
    await ensureInit();
    await delay(READ_DELAY_MS);
    const { transactions } = requireStore();
    const search = q.search?.trim().toLowerCase();

    const filtered = transactions
      .filter((t) => {
        if (t.accountId !== accountId) return false;
        // Spec §7.2: search matches description and category only (not note, not amount).
        if (search && !t.description.toLowerCase().includes(search) && !t.category.toLowerCase().includes(search)) return false;
        if (q.type && q.type !== "all" && t.type !== q.type) return false;
        if (q.category && q.category !== "all" && t.category !== q.category) return false;
        return true;
      })
      .sort(byDateDesc);

    const pageSize = q.pageSize ?? DEFAULT_PAGE_SIZE;
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(Math.max(q.page ?? 1, 1), pageCount);
    const items = filtered.slice((page - 1) * pageSize, page * pageSize).map((t) => ({ ...t }));
    return { items, total: filtered.length, page, pageCount };
  },

  async listRecentTransactions(limit: number) {
    await ensureInit();
    await delay(READ_DELAY_MS);
    const { accounts, transactions } = requireStore();
    const nameById = new Map(accounts.map((a) => [a.id, a.name]));
    return [...transactions]
      .sort(byDateDesc)
      .slice(0, limit)
      .map((t) => ({ ...t, accountName: nameById.get(t.accountId) ?? t.accountId }));
  },

  async addTransaction(input) {
    await ensureInit();
    await delay(WRITE_DELAY_MS);
    const s = requireStore();
    const account = s.accounts.find((a) => a.id === input.accountId);
    if (!account) throw new Error(`Unknown account: ${input.accountId}`);
    const row = s.nextRowByTab.get(account.sheetTabName)!;
    s.nextRowByTab.set(account.sheetTabName, row + 1);
    const transaction: Transaction = { ...input, id: `${account.sheetTabName}:${row}` };
    s.transactions.push(transaction);
    return { ...transaction };
  },

  async deleteTransaction(id: string) {
    await ensureInit();
    await delay(WRITE_DELAY_MS);
    const s = requireStore();
    const index = s.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction not found: ${id}`);

    const deleted = s.transactions[index];
    const deletedRow = rowNumber(deleted.id);
    const account = s.accounts.find((a) => a.id === deleted.accountId);
    if (!account) throw new Error(`Unknown account: ${deleted.accountId}`);

    // Real Sheets deleteRow() shifts every row below the deleted one up by
    // one — mirror that here so every other transaction's id in this account
    // stays consistent with what a real backend would report on refetch.
    s.transactions = s.transactions
      .filter((t) => t.id !== id)
      .map((t) => {
        if (t.accountId !== deleted.accountId) return t;
        const r = rowNumber(t.id);
        return r > deletedRow ? { ...t, id: `${account.sheetTabName}:${r - 1}` } : t;
      });

    // The tab's next-free-row counter must also shrink by one to match.
    const nextRow = s.nextRowByTab.get(account.sheetTabName);
    if (nextRow !== undefined) s.nextRowByTab.set(account.sheetTabName, nextRow - 1);
  },

  async getDashboardStats(period: Period): Promise<DashboardStats> {
    await ensureInit();
    await delay(READ_DELAY_MS);
    const { transactions } = requireStore();

    // Balance is total money: all-time Σ income − Σ expense across all accounts.
    let balance = 0;
    for (const t of transactions) balance += t.type === "income" ? t.amount : -t.amount;

    const current = periodRange(period, 0);
    const previous = periodRange(period, -1);
    const { income, expense } = sumWindow(transactions, current.start, current.end);
    const prev = sumWindow(transactions, previous.start, previous.end);

    const currentNet = income - expense;
    const prevNet = prev.income - prev.expense;
    const balanceDeltaPct = prevNet === 0 ? null : ((currentNet - prevNet) / Math.abs(prevNet)) * 100;

    const incomeSources = new Set<string>();
    let expenseTxCount = 0;
    for (const t of transactions) {
      const d = parseISO(t.date).getTime();
      if (d < current.start.getTime() || d >= current.end.getTime()) continue;
      if (t.type === "income") {
        incomeSources.add(t.category);
      } else {
        expenseTxCount++;
      }
    }
    const expenseByCategory = expenseByCategoryInWindow(transactions, current.start, current.end);

    const chart = [-5, -4, -3, -2, -1, 0].map((offset) => {
      const window = periodRange(period, offset);
      const sums = sumWindow(transactions, window.start, window.end);
      return { label: periodLabel(period, offset), income: sums.income, expense: sums.expense };
    });

    const ranked = [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxAmount = ranked[0]?.[1] ?? 0;
    const topCategories = ranked.map(([category, amount]) => ({
      category,
      emoji: categoryEmoji(category),
      amount,
      pctOfMax: maxAmount === 0 ? 0 : Math.round((amount / maxAmount) * 100),
    }));

    const streak = computeStreak(transactions);

    // categoryHistory: union of categories seen in the current period + 3 prior periods,
    // each with current-period expense vs. the average of the 3 prior periods (always /3).
    const priorWindows = [-1, -2, -3].map((offset) => {
      const range = periodRange(period, offset);
      return expenseByCategoryInWindow(transactions, range.start, range.end);
    });
    const categoryKeys = new Set<string>(expenseByCategory.keys());
    for (const prior of priorWindows) {
      for (const category of prior.keys()) categoryKeys.add(category);
    }
    const categoryHistory = [...categoryKeys].map((category) => {
      const currentAmount = expenseByCategory.get(category) ?? 0;
      const avgPrior3 = priorWindows.reduce((sum, prior) => sum + (prior.get(category) ?? 0), 0) / 3;
      return { category, emoji: categoryEmoji(category), current: currentAmount, avgPrior3 };
    });

    let earliestTransactionDate: string | null = null;
    for (const t of transactions) {
      if (earliestTransactionDate === null || t.date < earliestTransactionDate) earliestTransactionDate = t.date;
    }

    return {
      balance,
      income,
      expense,
      balanceDeltaPct,
      incomeSourceCount: incomeSources.size,
      expenseTxCount,
      chart,
      topCategories,
      streak,
      categoryHistory,
      earliestTransactionDate,
    };
  },

  async getConnectionInfo() {
    await ensureInit();
    await delay(READ_DELAY_MS);
    return connectionInfo();
  },

  async syncNow() {
    await ensureInit();
    await delay(WRITE_DELAY_MS);
    requireStore().lastSyncedAt = new Date().toISOString();
    return connectionInfo();
  },

  async getBudgetCaps() {
    await ensureInit();
    await delay(READ_DELAY_MS);
    return requireStore().budgetCaps.map((c) => ({ ...c }));
  },

  async setBudgetCap(category: string, monthlyLimit: number) {
    await ensureInit();
    await delay(WRITE_DELAY_MS);
    const s = requireStore();
    const index = s.budgetCaps.findIndex((c) => c.category === category);
    const shouldDelete = !Number.isFinite(monthlyLimit) || monthlyLimit <= 0;

    if (shouldDelete) {
      if (index !== -1) s.budgetCaps.splice(index, 1);
      return null;
    }

    if (index !== -1) {
      s.budgetCaps[index] = { ...s.budgetCaps[index], monthlyLimit };
      return { ...s.budgetCaps[index] };
    }

    const cap: BudgetCap = { category, monthlyLimit, createdAt: new Date().toISOString() };
    s.budgetCaps.push(cap);
    return { ...cap };
  },

  async ocrSlip(input: OcrSlipInput): Promise<OcrSlipResult> {
    await ensureInit();
    await delay(OCR_DELAY_MS);

    // Dev-only toggles: prefix the base64 payload with a marker to exercise
    // ocrSlip's other branches without a live backend (no real base64 starts
    // with these strings, so this never collides with actual image bytes).
    if (input.imageBase64.startsWith("MOCK_OCR_FAILED")) {
      return {
        amount: { value: null, confidence: "guessed" },
        date: { value: null, confidence: "guessed" },
        category: { value: "Other", confidence: "guessed" },
        merchant: { value: null, confidence: "guessed" },
        refNumber: null,
        type: "expense",
        isLikelyDuplicate: false,
        duplicateOf: null,
        ocrFailed: true,
        failureReason: "อ่านสลิปไม่สำเร็จ ลองถ่ายรูปใหม่ให้ชัดขึ้นนะคะ",
      };
    }

    const isDuplicate = input.imageBase64.startsWith("MOCK_OCR_DUPLICATE");

    return {
      amount: { value: 350, confidence: "high" },
      date: { value: todayLocal(), confidence: "high" },
      category: { value: "Food", confidence: "guessed" },
      merchant: { value: "Uncle Moo's Noodle Shop", confidence: "high" },
      refNumber: "20260905ABC12345",
      type: "expense",
      isLikelyDuplicate: isDuplicate,
      duplicateOf: isDuplicate
        ? { id: "Cash:2", date: "2026-09-04", amount: 350, note: "[Ref: 20260905ABC12345] paid to Uncle Moo's Noodle Shop" }
        : null,
      ocrFailed: false,
    };
  },
};

function connectionInfo(): ConnectionInfo {
  return {
    sheetName: "TungMeow Ledger 2026",
    status: "connected",
    lastSyncedAt: requireStore().lastSyncedAt,
    sheetUrl: "https://docs.google.com/spreadsheets/d/mock",
  };
}
