# PRD: Insight Analytics + Cat Companion (v1)

**Product:** TungMeow (ตังค์เหมียว)
**Author:** Minju (product thinking partner) with P'Earth
**Date:** 2026-09-02
**Status:** Draft — ready for engineering review

---

## Problem Statement

TungMeow currently *records data well* but *tells the user nothing back*. The Dashboard only shows static summary numbers (balance, income, expense) and a static top-4-categories list. Users have to interpret these numbers themselves, and there's no reason to reopen the app other than to log a new transaction.

This is the classic failure mode of personal finance apps worldwide: churn rates spike hard in the first 2–4 weeks, because users feel "I logged it, so what?" Logging that never turns into insight or a satisfying feedback loop causes users to gradually stop logging, and the app quietly dies.

TungMeow has two underused strengths: (1) a cat theme with an existing mascot (`CatLogo`) that's currently just a static logo with no life to it, and (2) 6-period historical chart data already stored in `getDashboardStats()` that has never been used for trend comparison or analysis.

## Goals

1. **Give users a reason to open the app without a new transaction to log** — measured by an increase in sessions with no add-transaction event
2. **Reduce time-to-insight** — users should see whether this month is "better or worse" within the first 3 seconds of opening the Dashboard, without interpreting numbers themselves
3. **Increase logging frequency** through behavioral motivation (streaks) — measured by unique logging days per week
4. **Answer "where did my money go?" in one click**, beyond the current static Top Categories view
5. **Create an emotional touchpoint with the cat theme** that differentiates TungMeow from generic finance apps, without needing a full gamification system

## Non-Goals

- **No Budget Cap / per-category spending limits** in this version — requires extending the data model (new schema on both the Sheet and Apps Script side), a separate scope that belongs in v2
- **No full Achievement/Badge system** — requires designing multiple badge conditions and new unlock-state tracking; not worth the effort at this phase
- **No AI/LLM integration** — a separate topic P'Earth has asked to set aside for now
- **No real push notifications** — Streaks and Anomaly Alerts in this version are in-app only (shown when the app is opened), not sent outside the app, since TungMeow is an SPA with no backend push service
- **No changes to the existing Google Sheet schema** (`[Date, Description, Category, Type, Amount, Note]`) — every feature in this version must be derivable from existing data only, so `SheetService.gs` and existing data stay untouched

## User Stories

### Spending Anomaly Alert
- As a user who logs expenses regularly, I want to immediately see when a category is spending abnormally compared to its historical average, so that I can notice and adjust my behavior before the month ends
- As a new user with less than 3 months of data, I want to not see anomaly alerts that are inaccurate due to insufficient data, so that I don't get misled
- As a user, I want the alert to show both the amount and the % change clearly (not just "spending is high"), so that I can gauge severity myself

### Category Drilldown
- As a user, I want to tap a category in Top Categories and see the full list of transactions in that category, so that I know exactly where that category's money went without manually filtering the Transactions page
- As a user, I want to see the spending proportion of every category (not just the top 4) as a pie/donut chart, so that I get a full picture of my spending in one view
- As a user with no transactions in a given category, I want to see a clear empty state instead of a blank page, so that I'm not confused about whether the app is broken

### Cat Mood Mascot
- As a user, I want to see the mascot cat's mood change based on my current financial health, so that I feel connected to my financial status without reading numbers
- As a user who just started using the app (not enough data yet), I want to see a neutral/welcoming mascot state instead of an error-like state, so that the first experience doesn't feel bad
- As a user, I want to tap the mascot and see a short explanation of why it's in that mood, so that the feature has a clear reason behind it, not just decoration

### Logging Streak
- As a user, I want to see how many consecutive days I've logged a transaction, so that I'm motivated to keep coming back and logging every day
- As a user whose streak breaks, I want to see an encouraging message instead of a scolding one, so that I don't feel bad enough to quit using the app
- As a user, I want the streak to count "at least 1 entry per day" regardless of how many entries, so that counting doesn't create unnecessary pressure

## Requirements

### P0 — Must-Have

**1. Spending Anomaly Alert**
- Calculate the average spend per category from historical data (use the existing `chart` array in `DashboardStats`, extended with category-level breakdown logic)
- Anomaly threshold: a category in the current period exceeds the 3-period historical average beyond a defined threshold (recommended starting point: 30%)
- Display as a card/banner on the Dashboard, e.g. "🍜 Food is up 40% this month (2,400 vs average 1,700)"
- **Acceptance criteria:**
  - [ ] Given the user has at least 3 historical periods of data, When they open the Dashboard, Then the system calculates and shows an anomaly card if any category exceeds the threshold
  - [ ] Given the user has less than 3 historical periods, When they open the Dashboard, Then no anomaly card is shown (no error, no crash)
  - [ ] Given no category exceeds the threshold, When shown, Then no card is displayed (don't force an empty-state message)
  - [ ] Given multiple categories exceed the threshold at once, When displayed, Then sort by % over threshold descending, showing at most 3 categories

**2. Category Drilldown**
- Add a new page or modal, "Category Breakdown," accessible from the Dashboard
- Show a donut/pie chart of spending proportion across all categories (not limited to 4) for the selected period
- Tapping a category filters into the Transactions page, already scoped to that category (reuse the existing `AccountTabs`/`FilterBar` pattern)
- **Acceptance criteria:**
  - [ ] Given the user opens the Category Breakdown page, When there are transactions in that period, Then the chart shows every category with data, with emoji + % for each
  - [ ] Given the user taps a category on the chart, When clicked, Then they're taken to the Transactions page filtered to that category immediately
  - [ ] Given the selected period has no transactions at all, When this page is opened, Then a friendly, cat-themed empty state is shown, not a blank page

**3. Cat Mood Mascot**
- Extend the `CatLogo.tsx` component to accept a mood prop (e.g. `mood: "happy" | "neutral" | "worried"`)
- Mood logic derives from the income/expense ratio of the current period vs. the previous period (use existing `DashboardStats` fields: `balance`, `income`, `expense`, `balanceDeltaPct`)
- Display the mascot prominently on the Dashboard, with a tap/tooltip for a short explanation
- **Acceptance criteria:**
  - [ ] Given `balanceDeltaPct` is positive or flat, When the mascot is shown, Then mood = happy
  - [ ] Given `balanceDeltaPct` is negative beyond a defined threshold, When the mascot is shown, Then mood = worried
  - [ ] Given `balanceDeltaPct` is null (no prior period to compare), When the mascot is shown, Then mood = neutral/welcoming, not worried
  - [ ] Given the user taps the mascot, When tapped, Then a short explanation is shown for why it's in that mood (e.g. "Expenses this month are 12% lower than last month, meow's happy!")

**4. Logging Streak**
- Calculate from unique transaction `date` values (no new field needed on the Sheet)
- Show the consecutive-day count on the Dashboard (e.g. "🔥 7-day logging streak")
- Definition of "consecutive" = at least 1 transaction on each calendar day, counting back from the most recent day with data
- **Acceptance criteria:**
  - [ ] Given the user has transactions on N consecutive days, When they open the Dashboard, Then streak = N is shown
  - [ ] Given the user missed logging for 1+ days, When they open the Dashboard, Then the streak resets to 0 or 1 (based on the most recent logged day) with an encouraging message, not a scolding one
  - [ ] Given the user logs multiple entries on the same day, When calculating streak, Then it counts as 1 day only, not inflated by entry count

### P1 — Nice-to-Have

- **Dismissible Anomaly Alert** — users can dismiss an alert they don't want to see again for that period (client-side state, e.g. localStorage, is sufficient — no backend storage needed)
- **Category Drilldown date range selector** — compare by month/quarter/year, not just the current period (builds on the existing `Period` type: `"month" | "quarter" | "year"`)
- **Streak milestone celebration** — at 7/30/100 days, show a micro-animation or special message from the cat (not a full badge system, just a momentary celebration)
- **Mascot with more expressive animation** beyond a static image — e.g. tail swish, happy eye-close — if design/effort allows

### P2 — Future Considerations

- Per-category Budget Cap (requires data model expansion)
- Full Achievement/Badge system
- Push notifications for streak reminders or real-time anomaly alerts
- AI-powered insights (topic set aside for now)
- Design the mascot state and streak logic so they can support badges later (plan the structure ahead of time, even if not built now)

## Success Metrics

### Leading Indicators (measurable within 2–4 weeks post-launch)
- **Increase in sessions that open Dashboard/Category Breakdown without an add-transaction action** — target: a meaningful increase from pre-launch baseline (since this is a single-user app, behavioral observation of app-opening patterns is used rather than a multi-user adoption %)
- **Increase in weekly logging frequency** — measured by unique logging days before/after this feature launches
- **Category Drilldown usage** — accessed at least once per week

### Lagging Indicators (measurable after 1–3 months)
- **Longer average streaks** — compare average streak length before/after the feature
- **Continued app usage past 30 days** — a simple behavioral retention measure (since this is single-user, measured from P'Earth's actual usage log)

> Note: Since TungMeow is currently a single-user app, multi-user adoption/retention metrics (e.g. % of all users) aren't meaningful yet. Use behavioral metrics from the actual user (P'Earth) for this phase, and shift to multi-user metrics once the app expands to more users.

## Open Questions

- **[Engineering]** Should the anomaly threshold (30% recommended) be hardcoded or configurable in the future? — Not blocking, fine to hardcode for now
- **[Design]** How many mood states should the mascot have (is happy/neutral/worried enough, or is a finer-grained range needed)? — Should be decided before implementation starts, as it affects both assets and logic
- **[Engineering]** Should Category Drilldown be a new page (separate route) or a modal over the Dashboard? — Affects the routing structure in `App.tsx`, should be decided before starting
- **[Product]** When a streak "breaks," should it reset to 0 immediately, or have a grace period (e.g. one missed day without resetting)? — Not blocking, but significantly affects the feature's tone

## Timeline Considerations

- No hard deadline or external dependency — this is an internal feature for a solo project
- **Recommended implementation order** (not required to ship all 4 together):
  1. Logging Streak (lowest effort — no backend changes, minimal new UI)
  2. Cat Mood Mascot (low effort — extends an existing component)
  3. Spending Anomaly Alert (requires extending the dashboard stats calculation logic)
  4. Category Drilldown (highest effort of the 4 — new full page/modal UI)
- None of these touch Apps Script/Google Sheets — they can be deployed via the normal Vercel auto-deploy as soon as merged to `main`, with no manual GAS redeploy step required, per the project overview.

---

*This document was prepared by Minju for P'Earth — ready to hand off to the Dev team for sprint planning.*
