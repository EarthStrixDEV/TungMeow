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
 * Data-layer contract for TungMeow.
 *
 * The UI depends only on this interface. Today it is fulfilled by the
 * in-memory mock (`mockDataService`); the future real client — a thin app
 * server proxying the Google Sheets API (spec §3/§5, the Sheet is the sole
 * source of truth) — must satisfy exactly this same contract so the swap is
 * a one-line change in `data/index.ts`.
 */
export interface DataService {
  init(): Promise<void>;
  listAccounts(): Promise<Account[]>;
  listAccountSummaries(): Promise<AccountSummary[]>;
  listTransactions(accountId: string, q?: TransactionQuery): Promise<TransactionPage>;
  listRecentTransactions(limit: number): Promise<(Transaction & { accountName: string })[]>;
  addTransaction(input: Omit<Transaction, "id" | "pending">): Promise<Transaction>;
  /**
   * Deletes a real Sheet row (not a soft-delete) — every other transaction's
   * id in that account may have shifted afterward. Callers MUST refetch the
   * transaction list; do not patch state locally by filtering out just this id.
   */
  deleteTransaction(id: string): Promise<void>;
  getDashboardStats(period: Period): Promise<DashboardStats>;
  getConnectionInfo(): Promise<ConnectionInfo>;
  syncNow(): Promise<ConnectionInfo>;
}
