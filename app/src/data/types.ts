export type TransactionType = "income" | "expense";
export type Period = "month" | "quarter" | "year";

export interface Account {
  id: string;
  name: string;
  icon: string;
  sheetTabName: string;
  sortOrder: number;
}

export interface Transaction {
  id: string; // derived "{sheetTabName}:{rowNumber}" per spec §4
  accountId: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  category: string;
  type: TransactionType;
  amount: number; // always positive; sign derived from type
  note?: string;
  pending?: boolean;
}

export interface AccountSummary extends Account {
  balance: number;
  rowCount: number;
}

export interface DashboardStats {
  balance: number;
  income: number;
  expense: number;
  balanceDeltaPct: number | null;
  incomeSourceCount: number;
  expenseTxCount: number;
  /** Trailing 6 periods, oldest first. */
  chart: { label: string; income: number; expense: number }[];
  /** Top 4 expense categories in the current window. */
  topCategories: { category: string; emoji: string; amount: number; pctOfMax: number }[];
  /** Consecutive-day logging streak ending at the most recent logged date. */
  streak: { count: number; lastLoggedDate: string | null };
  /** Per-category current vs. 3-prior-period average expense, current + 3 offsets union. */
  categoryHistory: { category: string; emoji: string; current: number; avgPrior3: number }[];
  /** Min transaction date across all accounts, or null if no transactions exist. */
  earliestTransactionDate: string | null;
}

export interface TransactionQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: TransactionType | "all";
  category?: string | "all";
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  pageCount: number;
}

export interface ConnectionInfo {
  sheetName: string;
  status: "connected" | "reconnect";
  lastSyncedAt: string;
  sheetUrl: string;
}

export interface BudgetCap {
  category: string;
  monthlyLimit: number;
  createdAt: string;
}

/** One OCR-extracted field, tagged with how much to trust it. */
export interface OcrFieldConfidence {
  value: string | number | null;
  confidence: "high" | "low" | "guessed";
}

export interface OcrSlipInput {
  /** Base64-encoded image/PDF bytes, no "data:" URI prefix. */
  imageBase64: string;
  mimeType: string;
}

export interface OcrSlipResult {
  amount: OcrFieldConfidence; // value: number | null
  date: OcrFieldConfidence; // value: yyyy-mm-dd | null
  /** value is always one of the 9 category enum strings, or "Other" if unmatched/guessed. */
  category: OcrFieldConfidence;
  merchant: OcrFieldConfidence; // value: payee/merchant name | null
  /** Raw transaction reference, no "[Ref: ]" wrapper — caller composes the note prefix. */
  refNumber: string | null;
  type: TransactionType;
  isLikelyDuplicate: boolean;
  duplicateOf: { id: string; date: string; amount: number; note: string } | null;
  /** true = OCR could not read the slip at all; caller must fall back to an empty manual form. */
  ocrFailed: boolean;
  /** User-facing message when ocrFailed is true. */
  failureReason?: string;
}
