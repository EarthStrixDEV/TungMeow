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

/**
 * Real Sheets-backed client — thin fetch wrapper over the Google Apps Script
 * Web App. Pure translation to/from the `DataService` contract; no business
 * logic lives here (that's all in SheetService.gs on the backend).
 *
 * Transport: GET + query string for every action, including writes
 * (`addTransaction`, `deleteTransaction`, `syncNow`). Deliberate
 * CORS-avoidance decision — see gas/Router.gs's header comment for the full
 * rationale.
 */

const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;
const TOKEN = import.meta.env.VITE_APPS_SCRIPT_TOKEN as string;

type Envelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

async function call<T>(action: string, params: Record<string, string | number | undefined>): Promise<T> {
  if (!BASE_URL || !TOKEN) {
    throw new Error("Apps Script backend is not configured: missing VITE_APPS_SCRIPT_URL/VITE_APPS_SCRIPT_TOKEN");
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("token", TOKEN);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  const text = await res.text();
  const envelope = JSON.parse(text) as Envelope<T>;

  if (!envelope.ok) {
    throw new Error(envelope.error?.message ?? "Apps Script request failed");
  }

  return envelope.data;
}

export const appsScriptDataService: DataService = {
  async init() {
    await call<ConnectionInfo>("getConnectionInfo", {});
  },

  listAccounts() {
    return call<Account[]>("listAccounts", {});
  },

  listAccountSummaries() {
    return call<AccountSummary[]>("listAccountSummaries", {});
  },

  listTransactions(accountId: string, q?: TransactionQuery) {
    return call<TransactionPage>("listTransactions", {
      accountId,
      page: q?.page,
      pageSize: q?.pageSize,
      search: q?.search,
      type: q?.type,
      category: q?.category,
    });
  },

  listRecentTransactions(limit: number) {
    return call<(Transaction & { accountName: string })[]>("listRecentTransactions", { limit });
  },

  addTransaction(input: Omit<Transaction, "id" | "pending">) {
    return call<Transaction>("addTransaction", {
      accountId: input.accountId,
      date: input.date,
      description: input.description,
      category: input.category,
      type: input.type,
      amount: input.amount,
      note: input.note,
    });
  },

  deleteTransaction(id: string) {
    return call<void>("deleteTransaction", { id });
  },

  getDashboardStats(period: Period) {
    return call<DashboardStats>("getDashboardStats", { period });
  },

  getConnectionInfo() {
    return call<ConnectionInfo>("getConnectionInfo", {});
  },

  syncNow() {
    return call<ConnectionInfo>("syncNow", {});
  },
};
