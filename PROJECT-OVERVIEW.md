# TungMeow (ตังค์เหมียว) — Project Overview

_Last updated: 2026-09-02_

A cat-themed personal finance / expense tracker. React SPA frontend, Google Sheets as the database via a Google Apps Script backend. Built in a single intensive session (spec dated 2026-09-01) via an AI-agent-orchestrated workflow supervised by one human owner (P'Earth), who handled the manual Google/Vercel steps agents can't perform directly.

**Live:** https://tungmeow.vercel.app
**Repo:** https://github.com/EarthStrixDEV/TungMeow

## Repo layout

| Path | Purpose |
|---|---|
| `app/` | Production React SPA (Vite + TypeScript + Tailwind v4) |
| `gas/` | Google Apps Script backend — 8 `.gs` files, deployed manually to a Google Sheet |
| `tungmeow-html/` | Earlier static HTML/CSS/JS prototype (splash + 4 pages), superseded by `app/` |
| `qa-screens/` | Playwright-based manual screenshot/smoke-check runner, gitignored |
| `TungMeow-Spec.md` | MVP product spec ("build contract") |
| `TungMeow-design-context.md` | Earlier design/wireframe notes the spec was derived from |
| `tasks.json` | Multi-agent task tracker from the original build session |

No CI/CD config exists — Vercel's native GitHub integration auto-builds/deploys on push to `main`.

## Frontend (`app/`)

**Stack:** React 19, React Router 7, Vite 8 (rolldown-based), TypeScript ~6.0, Tailwind CSS v4, `lucide-react` for icons, `oxlint` (Rust-based) instead of ESLint.

**Scripts:** `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`.
> Gotcha: bare `npx tsc --noEmit` silently checks nothing (root `tsconfig.json` is references-only) — use `npx tsc --noEmit -p tsconfig.app.json` or `npm run build`.

**Routing** (`src/App.tsx`): `/` → `LoadingPage` (splash, no shell). Everything else nests under `AppShell` (`Sidebar` desktop / `BottomNav` mobile): `/dashboard`, `/transactions`, `/add`, `/settings`. Wildcard redirects to `/dashboard`.

**State:** No global store — plain `useState`/`useEffect` per page, fetching from a swappable `dataService`.

**Data layer** (`src/data/`):
- `DataService.ts` — interface: `init`, `listAccounts`, `listAccountSummaries`, `listTransactions`, `listRecentTransactions`, `addTransaction`, `deleteTransaction`, `getDashboardStats`, `getConnectionInfo`, `syncNow`.
- `mockDataService.ts` — in-memory + seeded data, simulated latency, used by default.
- `appsScriptDataService.ts` — calls the deployed Apps Script Web App **entirely over GET** (even writes) to avoid CORS preflight, which GAS Web Apps can't satisfy.
- Switch: `VITE_USE_MOCK !== "false"` → mock (default). Set `VITE_USE_MOCK=false` + `VITE_APPS_SCRIPT_URL` + `VITE_APPS_SCRIPT_TOKEN` in `.env.local` to hit the real backend.

**Pages:** `LoadingPage`, `DashboardPage`, `TransactionsPage`, `AddEntryPage`, `SettingsPage`.

**Features:** `dashboard/` (StatCard, IncomeExpenseChart, TopCategories, RecentTransactions), `transactions/` (AccountTabs, FilterBar, Pagination, TransactionTable, TransactionCardList), `add-entry/` (TypeToggle, CategoryChips, AmountInput), `settings/` (ConnectionCard, AccountsList).

**Brand:** `components/brand/CatLogo.tsx` — hand-coded inline SVG cat face, no external asset. Also used to generate the [favicon.svg](app/public/favicon.svg).

**Theme** (`src/index.css`, Tailwind v4 `@theme`): warm cream background `#fefcf9`, ink `#2b2420`, blue accent `#3a63c4` (income), orange accent `#b8590a` (expense). Fonts: `Baloo 2` (display) + `Nunito` (body). Custom `--breakpoint-desktop: 861px` used as the `desktop:` variant throughout.

## Backend (`gas/` — Google Apps Script)

Google Sheets **is** the database — no separate DB. Each account is a spreadsheet tab; the script is bound to one Sheet ("TungMeow Ledger 2026") via a `SHEET_ID` Script Property.

| File | Role |
|---|---|
| `Code.gs` | `setupSheet()` bootstrap + `doGet`/`doPost` entry points (all 8 actions go through `doGet`; `doPost` is an unused CORS-avoidance fallback) |
| `Router.gs` | Single dispatch point, validates token, `switch`es on `action`, returns `{ok, data}` / `{ok:false, error}` |
| `Auth.gs` | `isValidToken` — a basic access gate, explicitly not real auth (no OAuth/sessions) |
| `SheetService.gs` | All business logic (~590 lines), ported near-verbatim from `mockDataService.ts`. Sanitizes cells against Sheets formula injection. `deleteTransaction` is a real `sheet.deleteRow()` — not soft delete |
| `Cache.gs` | `CacheService`-backed cache-through layer, 60s TTL, invalidated on writes |
| `Periods.gs` | Calendar window math, 1:1 port of `src/lib/periods.ts` |
| `Categories.gs` | Fixed category→emoji lookup, port of `categories.ts` |
| `Utils.gs` | JSON envelope + transaction-id codec (`"{sheetTabName}:{rowNumber}"`) |

**Row model** per tab: `[Date, Description, Category, Type, Amount, Note]`, header row 1, data from row 2. No id column — id is derived as `sheetTabName:rowNumber`.

**Deployment:** entirely manual (`gas/DEPLOYMENT.md`, Thai step-by-step guide) — paste into the Apps Script web editor, then Deploy → Manage deployments → New version, every time backend logic changes.

**Accepted risk** (documented): no rate limiting, `API_TOKEN` lives in the client bundle, access is `Anyone`. Fine at single-user scale; a `CacheService`-based request counter is a suggested future fast-follow.

## Data model

```ts
type TransactionType = "income" | "expense";
type Period = "month" | "quarter" | "year";

interface Account { id, name, icon, sheetTabName, sortOrder }
interface Transaction {
  id;                // "{sheetTabName}:{rowNumber}"
  accountId; date;    // ISO yyyy-mm-dd
  description; category; type: TransactionType;
  amount: number;     // always positive; sign derived from type
  note?; pending?;
}
interface AccountSummary extends Account { balance; rowCount }
interface DashboardStats {
  balance; income; expense; balanceDeltaPct: number | null;
  incomeSourceCount; expenseTxCount;
  chart: { label; income; expense }[];        // trailing 6 periods
  topCategories: { category; emoji; amount; pctOfMax }[]; // top 4
}
interface ConnectionInfo { sheetName; status: "connected" | "reconnect"; lastSyncedAt; sheetUrl }
```

**Categories** are a fixed, hardcoded client-side enum, not stored data:
- Income: Salary 💼, Gift 🎁, Investment 📈, Other ✨
- Expense: Food 🍜, Transport 🚕, Bills 🏠, Shopping 🛍️, Entertainment 🎬, Other ✨

**Seed accounts:** Cash 💵, Bank — KBank 🏦, Credit Card 💳, Savings 🐷.

## Deployment

`app/vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
SPA-routing fix (commit `c0b4273`) — without it, direct navigation to routes like `/transactions` 404s on Vercel's static hosting.

Push to `main` → Vercel auto-builds (`tsc -b && vite build`) → auto-deploys. GAS backend deploys are separate and manual (see above) — frontend and backend can drift out of sync if the manual Apps Script redeploy step is skipped.

## QA (`qa-screens/`)

Not a CI-wired test suite — a manual/on-demand Playwright screenshot + smoke-check runner (`qa-screens/runner/`, single dep `playwright`). Scripts: `desktop.mjs`, `mobile.mjs`, `filter.mjs`, `regression.mjs`, each walking through app flows and asserting simple text/URL conditions inline. Screenshots are gitignored, local-only artifacts.

## Git history

```
04e78b2 Add favicon using existing cat logo design
c0b4273 Round 2: Refresh + Delete transaction, fix SPA routing 404 on Vercel
6d26157 Trigger Vercel deploy after Environment Variables setup
090b9e3 Initial commit: TungMeow MVP — React SPA frontend + Google Apps Script backend
```

4 commits total, all from 2026-09-01 to 2026-09-02. "Round 2" (refresh + delete transaction) was an approved post-MVP expansion — the original spec explicitly excluded edit/delete.
