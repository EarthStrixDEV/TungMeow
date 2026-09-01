# TungMeow — Product Spec (MVP v1.0)

**ตังค์เหมียว** — "money cat"
Date: 1 September 2026
Status: MVP, derived from the approved wireframe (design context + clickable prototype) and 3 scope decisions confirmed with P'Earth on 1 Sept 2026.

> Use this document as the build contract for implementation. It resolves the open questions left in the original design-context doc and defines Core System, Modules & Features, Connectors, and UI Design in enough detail to implement directly. Where something is intentionally not designed yet, it's listed in §14 rather than left ambiguous.

---

## 1. Product summary

**What it is.** TungMeow is a UI layer over a Google Sheet workbook. Every financial account the user tracks — Cash, Bank, Credit Card, Savings, and so on — is one worksheet tab inside a single spreadsheet. The app reads and writes that spreadsheet directly; there is no separate application database.

**Who it's for.** One person (or one household) logging day-to-day income and spending across a few accounts, who wants a nicer interface than raw Sheets but doesn't want to give up owning their data — it stays open-able, exportable, and portable at all times.

**Platforms.** Responsive web app. One codebase serves a fixed left sidebar on desktop and a bottom tab bar on mobile — not two separate apps.

| Screen | Role | Entry point |
|---|---|---|
| Loading | Splash while the Sheet connection is verified | App launch |
| Dashboard | Overview — balances, trend, top categories, recent activity | After loading |
| Transactions | Full ledger, scoped per account via tabs | Nav |
| Add Entry | Log one income or expense row | Nav / FAB / Transactions |
| Settings | Sheet connection status + account (sheet-tab) management | Nav |

---

## 2. Key decisions for this spec

**Sync model: direct API, no app database.**
The app calls the Google Sheets API directly on every read and write. There is no Postgres/local store and no background sync queue — the Sheet *is* the database. Simpler system, one source of truth, at the cost of requiring a live connection to save an entry.

**Scope: MVP matches the wireframe exactly.**
Ship the 5 screens as designed. Categories are a fixed list (not user-editable), transactions are add-only (no edit/delete UI yet), single currency (THB), and onboarding assumes a Sheet is already connected. See §14 for what's deliberately deferred.

**Accounts is not a separate nav destination.**
Account management lives as a card inside Settings on both desktop and mobile. The mobile bottom nav's "Accounts" slot points to Settings, matching how the desktop sidebar already behaves in the wireframe.

---

## 3. Core System — Architecture

One rule drives every core-system decision: **the Google Sheet is the database.** The app never persists financial data anywhere else, which removes an entire sync layer at the cost of making the Sheets API a hard dependency for every write.

```
Browser (React SPA) → App server (thin API) → Google Sheets API → User's Spreadsheet
```

**Why a thin app server, not browser-to-Google directly.** The OAuth refresh token must not live in the browser. A small server (a serverless function is enough — no need for a persistent backend process) holds the token, proxies Sheets API calls, and shapes raw rows into the JSON the frontend expects. It is stateless between requests: it does not cache transaction data, it just translates.

**Layers:**

| Layer | Responsibility | Holds financial data? |
|---|---|---|
| Frontend (SPA) | Rendering, client-side routing, optimistic UI | No — in-memory only, per session |
| App server | OAuth token handling, Sheets API calls, row⇄JSON mapping, validation | No — stateless proxy |
| Google Sheets | Storage of every account and transaction | **Yes — sole source of truth** |
| Google OAuth | Identity + Sheets API authorization | No — issues tokens only |

> **Consequence of "no app database":** A read (opening Dashboard or Transactions) always costs a live Sheets API call. §5 covers the caching that keeps this from feeling slow.

---

## 4. Core System — Data model

Not a SQL schema — a row shape. Each Account is one worksheet tab; each Transaction is one row in that tab.

**Spreadsheet layout:**

```
Workbook: "TungMeow Ledger 2026"
├─ tab "Cash"           ← Account "Cash"
├─ tab "Bank_KBank"      ← Account "Bank — KBank"
├─ tab "Credit_Card"     ← Account "Credit Card"
├─ tab "Savings"         ← Account "Savings"
└─ tab "_TungMeow_Meta"  ← hidden: account list, icons, order
```

**Transaction row (columns A–F of an account tab):**

| Col | Field | Type | Notes |
|---|---|---|---|
| A | date | `DATE` | ISO stored, locale-formatted in UI |
| B | description | `TEXT` | Required, shown as row title |
| C | category | `TEXT` | One of the fixed enum, §4.1 |
| D | type | `"income" \| "expense"` | Drives sign + color |
| E | amount | `NUMBER` | Always positive; sign derived from type |
| F | note | `TEXT` | Optional, separate from description |
| — | id | *derived* | Not stored — see below |

A transaction's `id` is derived as `{sheetTabName}:{rowNumber}` at read time rather than stored as a column, since the row's position in the sheet already is its identity and a stored ID would drift the moment a user reorders rows by hand in Sheets.

### 4.1 Category enum (fixed for MVP)

| Type | Categories |
|---|---|
| Income | Salary · Gift · Investment · Other |
| Expense | Food · Transport · Bills · Shopping · Entertainment · Other |

Hardcoded client-side constant, not stored data. User-editable categories are explicitly out of scope for MVP (§14).

**Account (row in `_TungMeow_Meta` tab):**

```
id: string            // stable slug, e.g. "cash"
name: string           // display name, e.g. "Bank — KBank"
icon: string           // emoji, e.g. "🏦"
sheetTabName: string    // exact tab name, e.g. "Bank_KBank"
sortOrder: number       // controls tab/nav order in the app
createdAt: date
```

**Balance is never stored** — it's computed on read as `Σ(income) − Σ(expense)` over that account's tab, so it can never drift from the ledger rows themselves.

---

## 5. Core System — Sheets sync engine

"Sync" here means *every write goes straight to the Sheet* — there's no queue to reconcile. This section defines the read/write contract and how the app stays fast without a database.

**Write path (Add Entry):**

```
User taps Save → POST /entries → Sheets API: append row → Confirm + return row
```

Optimistic UI: the new row appears in the Recent Transactions / Transactions list immediately on Save, tagged pending; it's reconciled with the server-confirmed row (or rolled back with an inline error) once the API call settles. If the API call fails, the entry is **not** silently retried — the user sees an error and taps Save again (see error states, §6.3).

**Read path (Dashboard, Transactions):**
Every account read is `GET /accounts/:id/transactions`, which calls `spreadsheets.values.get` on that tab. To avoid re-fetching the whole workbook on every navigation:

- **Per-session cache, 60s TTL.** The app server caches each tab's rows in memory for 60 seconds. Switching between Dashboard → Transactions → back doesn't re-hit the Sheets API each time.
- **Manual "Sync now" bypasses the cache** — the Settings action (§7.4) forces a fresh read of every tab and clears the TTL.
- **No real-time listening.** If the user edits the Sheet directly in Google Sheets while the app is open, the app won't see it until the cache expires or Sync now is pressed. This is stated in the UI, not hidden (see Settings copy, §7.4).

**Conflict handling.**
Because there's no app database, there's no merge logic to write — Sheets is always right. The one conflict case that matters: an Add Entry write racing a manual edit in Sheets at the same moment. Google Sheets' own row-append API (`values.append`) is used specifically because it's additive — it can't overwrite a row the user is mid-edit on, only add a new one after the last used row.

> **Why not a local DB + background sync:** A cached copy would mean two things could disagree — the app's copy and the Sheet the user edits by hand. For a single-user ledger where "the Sheet is the real document," that disagreement is worse than the direct-API model's one real cost: writes need a live connection.

---

## 6. Core System — Auth & session

### 6.1 Authentication
Google OAuth 2.0, scoped to `drive.file` (access only to the specific spreadsheet the user picks or creates — not their whole Drive) and `spreadsheets`. Single-user app: one Google account is connected at a time, held in a server-side session cookie. No separate TungMeow account/password system.

### 6.2 First-run state (pre-MVP-screen)
The wireframe's flow starts at Loading with a Sheet already connected. Before that state exists, three steps happen once, outside the 5 designed screens:

1. Sign in with Google
2. Pick an existing "TungMeow-shaped" spreadsheet or let the app create one with the tab structure from §4
3. Land on Loading → Dashboard as normal

Full onboarding UI is deferred (§14) — MVP needs only a functional, unstyled version of these 3 steps to reach the designed screens at all.

### 6.3 Error & edge states the core system must define

| Condition | System behavior |
|---|---|
| Sheets API write fails (network, quota, permission revoked) | Entry stays in the form, un-cleared; inline error banner names the reason; Save is retryable |
| OAuth token expired mid-session | Silent refresh via refresh token; if refresh fails, redirect to re-auth, preserving the in-progress form via local memory |
| Connected Sheet was renamed/moved/deleted in Drive | Settings connection card shows a "Reconnect" state instead of "Connected" (§7.4); reads/writes blocked until resolved |
| An account's sheet tab was renamed outside the app | App detects the mismatch on next sync (tab name in `_TungMeow_Meta` not found) and flags that one account as "needs reconnect" rather than failing the whole app |

---

## 7. Modules & Features

Four feature modules, each mapped to one designed screen. Loading (splash) isn't listed separately — it's a state of the Dashboard module, not a module of its own.

### 7.1 Dashboard — `core`
**Job:** answer "how am I doing" in one glance, across all accounts combined.

- **Period switch** — Month / Quarter / Year segmented control. Changes the scope of every card below it. Defaults to Month.
- **3 stat cards** — Balance (sum of all account balances), Income, Expense, each for the selected period. Balance card shows a vs-previous-period trend pill.
- **Income vs Expense chart** — grouped bar chart, trailing 6 periods, blue = income / orange = expense.
- **Top Categories** — top 4 expense categories for the period, each a labeled progress bar scaled to the largest category's amount.
- **Recent Transactions** — latest 3 rows across all accounts, "See all" link to Transactions.

**Data need:** aggregation across every account tab for the selected period — computed server-side from the cached reads in §5, not stored.

### 7.2 Transactions — `core`
**Job:** the ledger — browse, search, and jump to Add Entry, one account at a time.

- **Account tabs** — one pill per account (from §4's Account list), horizontally scrollable on mobile. Switching tabs swaps the entire table/list — this is real state, not a page reload.
- **Search** — matches against description and category (not note, not amount) for the active account.
- **Filter** — by type (Income/Expense) and by category; date-range filter deferred (§14).
- **Table (desktop) / card list (mobile)** — Date, Description, Category tag, Type, signed Amount. Desktop uses numbered pagination (25 rows/page); mobile uses infinite scroll (append on reaching list end) since numbered pagination doesn't fit the pattern of the card list.
- **Add Entry** button, top-right on desktop; reached via bottom-nav FAB on mobile (§12).

**MVP explicitly excludes:** editing or deleting a row from this view (§14) — rows are read-only.

### 7.3 Add Entry — `core`
**Job:** log one transaction in under 15 seconds.

1. **Income/Expense toggle** — two-segment control; switching it swaps the category chip set (§4.1) and the accent color used by the submit button, live.
2. **Amount** — large centered numeric input, THB.
3. **Category** — chip picker, single-select, filtered by the toggle's current type.
4. **Account** — dropdown of every Account; determines which sheet tab the row is appended to.
5. **Date** — defaults to today.
6. **Note** — optional free text, distinct from the auto-filled description built from category + amount context.

**Validation:** Amount > 0 and Category selected are required to enable Save; Account defaults to the account the user arrived from (e.g. tapping Add Entry from the Cash tab pre-selects Cash) or the first account otherwise.

### 7.4 Settings & Accounts — `core`
**Job:** show the Sheets connection is healthy, and manage which accounts (tabs) exist.

**Connection card:** sheet name, last-synced timestamp, live status badge (Connected / Reconnect needed, per §6.3), and 3 actions:

| Action | Behavior |
|---|---|
| Open in Sheets | Opens the live Google Sheet in a new tab, at its native URL |
| Sync now | Forces a fresh read of every account tab, bypassing the 60s cache (§5) |
| Disconnect | Clears the OAuth session; returns the user to first-run (§6.2). Confirmation required — destructive. |

**Accounts list:** one row per account — icon, name, sheet-tab name, row count, computed balance. **New account** action: name + starting icon + optional starting balance (written as one seed transaction), which creates a new tab in the workbook using the layout in §4 and a collision-safe tab name (append `_2`, `_3`… if the name is taken).

---

## 8. Connectors & External Services

Three external dependencies. Only Google Sheets is load-bearing for the product to function at all.

### 8.1 Google Sheets API — `required`

| Endpoint used | Purpose |
|---|---|
| `spreadsheets.values.get` | Read an account tab's rows (Transactions, Dashboard aggregation) |
| `spreadsheets.values.append` | Add Entry — additive write, avoids overwrite conflicts (§5) |
| `spreadsheets.batchUpdate` | Create a new tab (New account) with header row + formatting |
| `spreadsheets.get` | Verify the connected file still exists and list its tabs (connection health check) |

**Failure mode:** if this API is unreachable, the app is read-only-broken by design — there's no cached fallback, since a database would contradict the "Sheet is the source of truth" decision in §2. Loading and Settings both need a clear "can't reach your Sheet right now" state (§6.3).

### 8.2 Google OAuth 2.0 — `required`
Handles sign-in and grants the scopes Sheets API calls need. Server holds the refresh token (§6.1); the browser never sees it. Revoking access from the user's Google Account settings must be handled gracefully — surfaces as the "Reconnect" state in Settings, not a crash.

### 8.3 Google Fonts — `visual only`
"Baloo 2" (headings) and "Nunito" (body), loaded via `<link>` per the wireframe. Not load-bearing — a system-font fallback stack keeps the app usable if the CDN is blocked, it just won't look like TungMeow.

> No other connectors in MVP — no analytics, no error-tracking service, no email/notification provider named yet. Adding one is a later decision, not a gap in this spec.

---

## 9. UI Design — Design tokens

Carried as-is from the approved wireframe (`shared.css`) — this spec doesn't re-decide the visual system, it documents it as the build contract.

**Color:**

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#fefcf9` | App background (warm off-white) |
| `--surface` | `#ffffff` | Cards, nav, table surfaces |
| `--ink` | `#2b2420` | Primary text |
| `--ink-soft` | `#6e645b` | Secondary/meta text |
| `--line` | `#f0ebe4` | Hairline borders/dividers |
| `--blue` | `#3a63c4` | Primary accent — income, active states, primary buttons |
| `--blue-soft` | `#eaf1fd` | Light blue backgrounds (badges, progress track) |
| `--blue-deep` | `#2f5fc4` | Blue text on light-blue background |
| `--orange` | `#b8590a` | Secondary accent — expense, warm highlights |
| `--orange-soft` | `#fdf1e6` | Light orange backgrounds |
| `--orange-deep` | `#a85a20` | Orange text on light-orange background |
| `--green` / `--green-soft` | `#2f8a4a` / soft tint | Success / positive delta / "Connected" status |
| `--red` / `--red-soft` | reserved | Destructive/error states — declared, not yet used |

> **AA contrast rule — binding, not a suggestion.** White text/icons on a solid fill must use the *deep* pair (`#3a63c4` blue, `#b8590a` orange) only. The lighter decorative tones (`#5b8def`, `#e08a3c`) are for chart bars, dots, and borders — never for text or icons on a fill. Semantic colors (green = success, planned red = destructive) are separate from the blue/orange brand accent and never double as it.

**Shape & elevation:**

| Element | Value |
|---|---|
| Card / panel radius | `20px` |
| Input / chip radius | `12px` |
| Tab / badge / toggle radius | `100px` (pill) |
| Card shadow | `0 1px 2px rgba(43,36,32,.04), 0 8px 24px -12px rgba(43,36,32,.10)` |
| Border style | 1px hairlines only (`#f0ebe4`) — no hard borders elsewhere |

---

## 10. UI Design — Typography & iconography

| Role | Typeface | Weight range | Used for |
|---|---|---|---|
| Display / headings | Baloo 2 | 600–800 | Wordmark, h1/h2 |
| Body / UI | Nunito | 400–800 | Everything else — labels, tables, buttons, forms |

**Icons:** custom inline SVG, stroke-based (~1.8px stroke), 20–24px grid. No icon font, no emoji in nav/UI chrome. Emoji are reserved for category glyphs in transaction data (🍜 Food, 🚕 Transport) — matching the sheet data itself, not the interface around it.

---

## 11. UI Design — Reusable components

**Stat card** — Label + icon row, large bold value, colored trend/context pill. Used 3× on Dashboard (Balance, Income, Expense).

**Account tab / chip** — Pill. Active = solid blue fill + white text + shadow. Inactive = surface + muted text. Used in the Transactions account switcher; reusable for Add Entry's account picker if it moves off a native select.

**Income/Expense toggle** — Two-segment pill. Selected segment: solid fill (blue=income, orange=expense) + white label. Drives category set + submit color downstream.

**Category chip** — Unselected = white + hairline border. Selected = light-blue fill + blue border + blue text. Single-select within Add Entry.

**Data row / data card** — Icon-in-rounded-square (category-tinted) + 2-line text stack + right-aligned signed amount. Table row (desktop), list card (mobile) — same data, two layouts.

**Connection status badge** — Pill, dot + label. Green-tinted for Connected; needs a defined variant for Reconnect (§6.3). Used on Settings connection card.

---

## 12. UI Design — Navigation shell

**Desktop (≥ 860px).** Fixed left sidebar, 240px wide: logo + wordmark, 4 nav items (Dashboard, Transactions, Add Entry, Settings — Accounts folds into Settings per §2), user chip pinned to bottom showing sync status.

**Mobile (< 860px).** Fixed bottom tab bar, 78px tall: Home, List (Transactions), a raised circular FAB in the center slot (Add Entry, solid orange), Accounts (routes to Settings), Settings.

> **Routing note for engineering.** The wireframe is 5 static HTML files with a shared `renderNav(activeKey)` — each "page" hardcodes its own active nav state. The real build needs actual client-side routing (one SPA shell, route-driven active state) to reproduce this correctly instead of full page reloads between sections.

---

## 13. UI Design — Responsive rules

| | Desktop | Mobile |
|---|---|---|
| Reference canvas | 1440×900 | 390×844 (iPhone 12/13/14-class) |
| Breakpoint | ≥ 861px | ≤ 860px |
| Content padding | 32/40px | 18–20px horizontal |
| Primary nav | Fixed sidebar, 240px | Fixed bottom bar, 78px + safe-area inset |
| Transactions view | Table + numbered pagination | Card list + infinite scroll |

---

## 14. Deferred / explicitly out of scope for MVP

Real gaps, intentionally not designed this round — listed so they aren't mistaken for oversights later.

| Item | Why deferred |
|---|---|
| Edit / delete a transaction | Rows are read-only in the wireframe; needs its own interaction design |
| User-editable categories (add/reorder/icons) | Fixed enum is enough to validate the core loop first |
| Multi-currency | Wireframe hardcodes ฿ (THB) throughout |
| Date-range / amount-range filters | Filter control is visual-only in the wireframe; type + category filters ship, range filters don't |
| Full onboarding UI | MVP needs the 3 steps in §6.2 functional, not polished |
| Empty states (0 accounts, 0 transactions) | Not designed in the wireframe pass |
| Skeleton / per-section loading states | Only the splash loading screen was designed |

---

*TungMeow Product Spec · derived from the approved wireframe (design context + clickable prototype) and 3 scope decisions confirmed with P'Earth on 1 Sept 2026 · v1.0 MVP*
