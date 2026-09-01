import type { Account, Transaction, TransactionType } from "./types";

/**
 * Deterministic mock seed for the in-memory DataService.
 *
 * Generation is anchored to `new Date()` (~10 months back through today) so
 * the current month always has data, and uses a fixed-seed PRNG — same run
 * date in, same ledger out. No `Math.random`.
 */

export const SEED_ACCOUNTS: Account[] = [
  { id: "cash", name: "Cash", icon: "💵", sheetTabName: "Cash", sortOrder: 0 },
  { id: "bank-kbank", name: "Bank — KBank", icon: "🏦", sheetTabName: "Bank_KBank", sortOrder: 1 },
  { id: "credit-card", name: "Credit Card", icon: "💳", sheetTabName: "Credit_Card", sortOrder: 2 },
  { id: "savings", name: "Savings", icon: "🐷", sheetTabName: "Savings", sortOrder: 3 },
];

/** mulberry32 — tiny seeded PRNG, returns floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SeedRow {
  date: Date;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  note?: string;
}

const LUNCHES: [string, number][] = [
  ["Lunch — pad krapow", 65],
  ["Lunch — Somtum Nua", 120],
  ["Dinner — noodle stall", 80],
  ["Khao man gai", 60],
  ["Coffee and toast", 95],
];

const SHOPPING: [string, number][] = [
  ["Shopee order", 890],
  ["New shirt — Uniqlo", 790],
  ["Household stuff — Daiso", 300],
  ["Skincare restock", 650],
  ["Phone case", 250],
];

const ENTERTAINMENT: [string, number][] = [
  ["Movie night", 240],
  ["Netflix subscription", 419],
  ["Board game cafe", 350],
  ["Concert ticket", 800],
];

export function generateSeedTransactions(): Transaction[] {
  const rand = mulberry32(20260901);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rowsByAccount = new Map<string, SeedRow[]>(SEED_ACCOUNTS.map((a) => [a.id, []]));

  const jitter = (max: number) => Math.floor(rand() * max);
  const vary = (base: number, spread: number) => base + Math.round(rand() * spread);
  const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];

  const push = (accountId: string, row: SeedRow) => {
    if (row.date.getTime() <= today.getTime()) rowsByAccount.get(accountId)!.push(row);
  };

  // 10 months: offset -9 (oldest) through 0 (current month).
  for (let offset = -9; offset <= 0; offset++) {
    const y = today.getFullYear();
    const m = today.getMonth() + offset;
    const day = (d: number) => new Date(y, m, d);

    // Bank — salary on the 1st, then recurring bills.
    push("bank-kbank", { date: day(1), description: "Monthly salary", category: "Salary", type: "income", amount: 62000 });
    push("bank-kbank", { date: day(2), description: "Apartment rent", category: "Bills", type: "expense", amount: 9500 });
    push("bank-kbank", { date: day(5 + jitter(2)), description: "Electricity bill", category: "Bills", type: "expense", amount: vary(900, 500) });
    push("bank-kbank", { date: day(6 + jitter(2)), description: "Water bill", category: "Bills", type: "expense", amount: vary(120, 60) });
    push("bank-kbank", { date: day(10), description: "Internet bill", category: "Bills", type: "expense", amount: 599 });
    push("bank-kbank", { date: day(18 + jitter(3)), description: "Grocery run — supermarket", category: "Food", type: "expense", amount: vary(800, 500) });

    // Cash — a small monthly top-up, then frequent food and transport.
    // Sized to slightly outpace cash spending so the account lands at a
    // small positive balance instead of drifting negative.
    push("cash", { date: day(2), description: "Cash top-up", category: "Other", type: "income", amount: vary(600, 300) });
    const [c1, a1] = pick(LUNCHES);
    const [c2, a2] = pick(LUNCHES);
    const [c3, a3] = pick(LUNCHES);
    push("cash", { date: day(1), description: c1, category: "Food", type: "expense", amount: vary(a1, 30) });
    push("cash", { date: day(4 + jitter(3)), description: c2, category: "Food", type: "expense", amount: vary(a2, 30) });
    push("cash", { date: day(9 + jitter(3)), description: "BTS fare", category: "Transport", type: "expense", amount: vary(44, 20) });
    push("cash", { date: day(15 + jitter(4)), description: c3, category: "Food", type: "expense", amount: vary(a3, 30) });
    push("cash", { date: day(21 + jitter(4)), description: "Grab ride home", category: "Transport", type: "expense", amount: vary(120, 60) });

    // Credit card — shopping and entertainment.
    const [s, sAmt] = pick(SHOPPING);
    const [e, eAmt] = pick(ENTERTAINMENT);
    push("credit-card", { date: day(8 + jitter(4)), description: s, category: "Shopping", type: "expense", amount: vary(sAmt, 200) });
    push("credit-card", { date: day(20 + jitter(4)), description: e, category: "Entertainment", type: "expense", amount: vary(eAmt, 100) });

    // Savings — sparse: fund transfer every other month, occasional gift.
    if (offset % 2 === 0) {
      push("savings", { date: day(25), description: "Monthly fund transfer", category: "Investment", type: "income", amount: 2000, note: "Auto-transfer to savings" });
    }
    if (offset === -7 || offset === -5 || offset === -1) {
      push("savings", { date: day(12 + jitter(6)), description: "Gift from mom", category: "Gift", type: "income", amount: vary(2000, 2000) });
    }
  }

  // Assign row numbers per tab in chronological (insertion) order.
  // Row 1 is the header per the sheet model, so data rows start at 2.
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const transactions: Transaction[] = [];
  for (const account of SEED_ACCOUNTS) {
    const rows = rowsByAccount.get(account.id)!;
    rows.sort((a, b) => a.date.getTime() - b.date.getTime());
    rows.forEach((row, i) => {
      transactions.push({
        id: `${account.sheetTabName}:${i + 2}`,
        accountId: account.id,
        date: iso(row.date),
        description: row.description,
        category: row.category,
        type: row.type,
        amount: row.amount,
        ...(row.note !== undefined ? { note: row.note } : {}),
      });
    });
  }
  return transactions;
}
