import type { DataService } from "./DataService";
import type {
  Account,
  AccountSummary,
  ConnectionInfo,
  DashboardStats,
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

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Parse "yyyy-mm-dd" as a local Date (midnight). */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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
    const expenseByCategory = new Map<string, number>();
    for (const t of transactions) {
      const d = parseISO(t.date).getTime();
      if (d < current.start.getTime() || d >= current.end.getTime()) continue;
      if (t.type === "income") {
        incomeSources.add(t.category);
      } else {
        expenseTxCount++;
        expenseByCategory.set(t.category, (expenseByCategory.get(t.category) ?? 0) + t.amount);
      }
    }

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

    return {
      balance,
      income,
      expense,
      balanceDeltaPct,
      incomeSourceCount: incomeSources.size,
      expenseTxCount,
      chart,
      topCategories,
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
};

function connectionInfo(): ConnectionInfo {
  return {
    sheetName: "TungMeow Ledger 2026",
    status: "connected",
    lastSyncedAt: requireStore().lastSyncedAt,
    sheetUrl: "https://docs.google.com/spreadsheets/d/mock",
  };
}
