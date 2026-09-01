# TungMeow (ตังค์เหมียว) — Design Context

Use this document as background when writing a product spec, PRD, or engineering plan for this app. It captures the design decisions already made in a wireframe/clickable-prototype pass, so a spec built from this stays consistent with what was designed rather than re-deciding things from scratch.

Wireframe reference (clickable prototype, view-only unless the target session owns it): `https://claude.ai/code/artifact/9be65083-0f50-45bf-9da6-13638bc0cdd6`

---

## 1. Product summary

**Name:** TungMeow — ตังค์เหมียว ("money cat")
**What it is:** A personal income & expense tracker web/mobile app that uses a Google Sheet as its database. Each financial account (Cash, Bank, Credit Card, Savings, etc.) is stored as its own tab/sheet within one Google Sheet workbook, so the app is really a friendly UI layer over a spreadsheet the user already trusts and can open directly.

**Core user:** A single person (or household) tracking day-to-day income and spending across multiple accounts, who wants a nicer interface than raw Sheets but still wants their data to live in Sheets (portable, exportable, no vendor lock-in).

**Platforms:** Responsive web app — desktop and mobile, no native app implied by the wireframe (though it could become a PWA).

---

## 2. Information architecture / screens

1. **Loading (splash)** — app entry point. Brand mark + spinner + "Syncing with Google Sheets…" status text. Mobile-shaped screen (assume it also covers desktop on wide viewports, just centered).
2. **Dashboard (Overview)** — landing screen after loading. Period switch (Month/Quarter/Year), 3 summary stat cards (Balance, Income, Expense), an Income-vs-Expense bar chart (6-month trend), a Top Categories list with progress bars, and a Recent Transactions preview (3–6 rows) linking to the full list.
3. **Transactions** — a data table of all entries, **scoped per account via tabs** (Cash / Bank / Credit Card / Savings / …). Each account tab shows only that account's rows (mirroring its own sheet tab). Columns: Date, Description, Category, Type (Income/Expense), Amount. Includes search, a filter control, and pagination. Add Entry is reachable from here too.
4. **Add Entry (form)** — Income/Expense toggle (changes accent color + available category set), Amount input, Category chip picker (chips differ by Income vs Expense), Account selector (dropdown — which account/sheet tab this entry posts to), Date, Note, Save button.
5. **Settings** — Google Sheet connection status card (connected/disconnected, sheet name, last synced time, actions: Open in Sheets, Sync now, Disconnect) and an Accounts management list (one row per account = one sheet tab, showing row count and running balance, with a "New account" action that would create a new sheet tab).

**Navigation:** 5 destinations — Dashboard, Transactions, Add Entry, Accounts (currently folded into Settings in the wireframe — see Open Questions), Settings.
- **Desktop (≥ some breakpoint, wireframed at 1440px):** fixed left sidebar, 240px wide, with logo, 5 nav items (icon + label), user chip pinned to bottom.
- **Mobile (wireframed at 390×844, iPhone-ish):** fixed bottom tab bar, 5 destinations (Dashboard/Transactions/Accounts/Settings as icon+label tabs) plus a raised circular FAB in the center slot for Add Entry.

---

## 3. Visual design system

**Brand:** White as the primary/dominant surface color; blue and orange as a paired secondary accent (blue = income/positive/primary actions, orange = expense/warm accent). A friendly cat mascot mark (simple geometric cat face, ears + whiskers-optional, in a soft orange circle) is the logo, used at multiple sizes (34px nav, 30–34px mobile header, 96px splash/cover).

**Palette (as hex, already adjusted to pass WCAG AA contrast for text/icons-on-fill):**
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#fefcf9` | App background (warm off-white, not pure white) |
| `--surface` | `#ffffff` | Cards, nav, table surfaces |
| `--ink` | `#2b2420` | Primary text |
| `--ink-soft` | `#6e645b` | Secondary/meta text (timestamps, captions) — darkened from an earlier `#8a8078` after an AA contrast fail |
| `--line` | `#f0ebe4` | Hairline borders/dividers |
| `--blue` | `#3a63c4` (solid-fill/white-text contexts) / `oklch(62% 0.14 240)` ≈ `#5b8def` (decorative: dots, chart bars, borders) | Primary accent — income, active states, primary buttons |
| `--blue-soft` | `oklch(94% 0.03 240)` ≈ `#eaf1fd` | Light blue backgrounds (badges, progress track) |
| `--blue-deep` | `oklch(46% 0.14 240)` ≈ `#2f5fc4` | Blue text on light-blue background |
| `--orange` | `#b8590a` (solid-fill/white-text contexts) / `oklch(72% 0.16 55)` ≈ `#e08a3c` (decorative) | Secondary accent — expense, warm highlights |
| `--orange-soft` | `oklch(94% 0.04 55)` ≈ `#fdf1e6` | Light orange backgrounds |
| `--orange-deep` | `oklch(55% 0.17 45)` ≈ `#a85a20` | Orange text on light-orange background |
| `--green` / `--green-soft` | `oklch(68% 0.15 150)` / soft tint (`#2f8a4a` used as literal for the "Connected" success state) | Success / positive delta / "Connected" status |
| `--red` / `--red-soft` | `oklch(62% 0.18 25)` / soft tint | Reserved for destructive/error states (declared, not yet used in the wireframe) |

**Important AA note:** white text/icons on a *solid* blue or orange fill must use the darker pair (`#3a63c4` blue, `#b8590a` orange) — the lighter decorative blue/orange (`#5b8def` / `#e08a3c`) fails 4.5:1 contrast for text and even the 3:1 minimum for icons, and was only kept for non-text decorative uses (chart bars/dots, borders, gradients). Any real implementation should re-run a contrast check rather than copying `#5b8def`/`#e08a3c` into button or label styles.

**Typography:** Two-font pairing via Google Fonts —
- **Display / headings:** "Baloo 2" (600–800 weight) — rounded, friendly, used for the wordmark and h1/h2-level headings.
- **Body / UI:** "Nunito" (400–800 weight) — used for everything else (labels, table text, buttons, form fields).

**Shape & elevation:** Large corner radii throughout — 20px on cards/panels (`--radius`), 12px on inputs/chips (`--radius-sm`), pill/100px radius on tabs, badges, and toggle buttons. Soft layered shadow for cards: `0 1px 2px rgba(43,36,32,0.04), 0 8px 24px -12px rgba(43,36,32,0.10)`. No hard borders except 1px hairlines (`--line`) on dividers.

**Iconography:** Custom inline SVG line icons (stroke-based, ~1.8px stroke, 20–24px grid) — no icon font, no emoji for nav/UI icons (emoji are used only for category glyphs in seed/sample data, e.g. 🍜 Food, 🚕 Transport, which a real build should probably replace with the same inline-SVG icon style for consistency).

**Responsive breakpoints implied:** Desktop canvas wireframed at 1440×900 (with 240px fixed sidebar + fluid content area, content area padded 32/40px). Mobile wireframed at 390×844 (iPhone 12/13/14-class viewport) with 18–20px horizontal padding and a fixed 78px-tall bottom nav (safe-area consideration needed for real devices).

---

## 4. Reusable components (as designed)

- **Sidebar Nav (desktop):** logo + wordmark, 5 nav items with active-state pill (solid blue fill, white label, subtle shadow) vs inactive (transparent, muted ink-soft label), user avatar chip pinned bottom with sync status.
- **Bottom Nav (mobile):** 5 slots — Home, List (Transactions), center raised FAB (Add Entry, solid orange circle, elevated with shadow), Accounts, Settings. Active tab tinted blue, inactive muted.
- **Stat card:** label + icon top row, large bold value, small colored trend/context pill below.
- **Account tab / chip:** pill-shaped, active = solid blue + white text + shadow; inactive = white/surface + muted text + soft shadow border. Used identically in both the Transactions account-switcher and (conceptually) anywhere else accounts need selecting (e.g. the Add Entry form's account dropdown could reuse this visual language as a picker instead of a native `<select>`).
- **Income/Expense toggle:** two-segment pill control inside a light track; selected segment gets a solid fill (blue for Income, orange for Expense) + white label + soft shadow; unselected is transparent/muted. Drives category-chip set and submit-button color downstream.
- **Category chip:** pill, unselected = white with hairline border; selected = light-blue fill + blue border + blue text (currently only the *first* chip in the list is shown selected by default — no real "tap to select" wiring beyond the Income/Expense toggle in the wireframe; see Open Questions).
- **Data row (table, desktop) / Data card (list, mobile):** icon-in-rounded-square (category-tinted background) + description/meta two-line stack + right-aligned bold signed amount (blue for income/+, orange-deep for expense/−).
- **Connection status badge:** pill, green-tinted, dot + label, used for "Connected" state on the Google Sheet integration.

---

## 5. Implied data model

Not a real schema yet, but the UI strongly implies this shape:

**Account**
- `id`, `name` (e.g. "Cash", "Bank — KBank", "Credit Card", "Savings")
- `emoji`/`icon` (currently emoji per account in sample data)
- `sheetTabName` (maps 1:1 to a tab in the connected Google Sheet, e.g. `"Cash"`, `"Bank_KBank"`)
- derived: `balance` (running total), `rowCount`/`transactionCount`

**Transaction**
- `id`, `accountId` (which account/sheet tab it belongs to)
- `date`
- `description`
- `category` (string/enum — differs by type, see below)
- `type`: `"income" | "expense"`
- `amount` (positive number; sign/direction derived from `type`)
- `note` (optional, free text — form has a separate Note field distinct from Description)

**Category sets (from the Add Entry form, currently hardcoded, not user-editable in the wireframe):**
- Income: Salary, Gift, Investment, Other
- Expense: Food, Transport, Bills, Shopping, Entertainment, Other

**Google Sheet connection**
- `sheetId`/`sheetName` (e.g. "TungMeow Ledger 2026")
- `connectionStatus`: connected / disconnected
- `lastSyncedAt`
- one worksheet tab per Account

---

## 6. Interaction notes from the prototype

- Account tabs (Transactions screen, both desktop and mobile) are **stateful and switch the entire table/list content** — this is real click-to-switch behavior in the prototype, not just a visual mock.
- Income/Expense toggle (Add Entry, both desktop and mobile) **actually swaps** accent color, category chip set, and submit-button color on click.
- Nav active-state is prop-driven per screen (not a true SPA route in the wireframe — each screen is a separate artboard with the correct nav item pre-set to active), so a real build needs actual client-side routing/state to reproduce this across one shell.
- Loading screen has a looping spinner (CSS animation) and a bobbing mascot — intended as a brief splash before the sheet sync completes, not a full loading-state design system (no skeleton screens, no per-section loading states designed yet).

---

## 7. Explicit user decisions made this session

- Fidelity: **clickable prototype**, not static mockup.
- Tone: **cute-friendly**, matching the "TungMeow / ตังค์เหมียว" name.
- Multi-account UI: **tabs to switch between accounts** on the transactions/data-table view (not a flat combined list, not a drill-down list-of-accounts page).
- Loading screen style: **splash + spinner** (not a progress bar, not a cat mini-animation).
- Loading placement: inserted **before Main/Dashboard as the start of the flow** (not mobile-only).

---

## 8. Open questions / gaps a spec should resolve

- **Accounts as a standalone nav destination:** the bottom nav (mobile) has a dedicated "Accounts" tab, but the desktop sidebar's "Accounts" item currently routes to the same screen as Settings (account management is a card *within* Settings on desktop). Decide whether Accounts should be a first-class screen/route on both platforms or intentionally nested under Settings.
- **Category management:** categories are hardcoded per type in the wireframe. Decide if users can add/edit/reorder/delete custom categories, and whether categories carry icons/colors as data or stay a fixed enum.
- **Google Sheets sync model:** the wireframe only shows connection status and a manual "Sync now" — real spec needs to define read/write model (does the app write directly to Sheets on every entry via API, poll periodically, or batch-sync?), auth flow (OAuth to Google), conflict handling if the sheet is edited directly by the user outside the app, and what happens to historic data if an account's sheet tab is renamed/deleted.
- **New account / new sheet tab creation:** Settings has a "+ New account" affordance but the creation flow (name, starting balance, sheet-tab naming/collision handling) isn't designed.
- **Currency/locale:** wireframe hardcodes ฿ (THB) formatting; decide if multi-currency is in scope.
- **Filters/search on Transactions:** search box and "Filter ▾" are visual only in the wireframe — define what's filterable (date range, category, type, amount range) and search scope (description only, or category/note too).
- **Pagination vs infinite scroll:** desktop table shows numbered pagination; mobile list doesn't show pagination — decide the real pattern for large transaction counts (42–58 rows shown in samples, real usage will be larger over time).
- **Editing/deleting a transaction:** not designed — table/list rows are currently display-only.
- **Empty states:** no empty-state designs yet (new account with 0 transactions, no accounts at all before first Sheet connection, etc.).
- **Auth/onboarding:** the wireframe starts at Loading → Dashboard with a Sheet already connected; first-run onboarding (connect Google account, pick/create a Sheet, create first account) isn't designed.
