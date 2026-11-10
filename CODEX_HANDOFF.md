# Solo Leveling V1 — Codex Handoff and Implementation Brief

**Status:** Core local features are implemented through Phases 1–5, with security/challenge work in Phase 7. Final build and browser/device QA remain. Verified automatic government notices and authoritative nutrition data are not yet available. This document is the product source of truth for continuing work in this repository; it does not claim the app is finished.

**Project:** `D:\Startup\SoloLevel\solo-leveling-v1`  
**Reviewed:** 10 November 2026

**Existing foundation:** React 18, TypeScript, Vite, Dexie/IndexedDB, Vite PWA plugin. See `package.json`, `README.md`, `src/`, and `vite.config.ts` before making changes.

## 1. Instructions to Codex before editing

1. Read this file, `README.md`, `package.json`, and the relevant implementation files before editing. Inspect the repository status and existing changes first.
2. Preserve existing working features and user data. Do not replace or re-scaffold the app wholesale. Make focused, reviewable changes that fit its existing React + TypeScript + Vite + Dexie architecture unless a concrete issue requires otherwise.
3. Implement in the phases below. At the start of each phase, report what already exists, what is incomplete, and the intended files/approach. Do not treat placeholder cards or UI labels as completed modules.
4. Run the relevant checks after implementation. Package scripts currently include `npm test` (Vitest) and `npm run build`. Add focused tests for critical rules as needed, then run them and the production build. Do not claim a check passed unless it ran successfully. Report environment/tooling blockers and their exact effect.
5. Keep product rules below fixed. Never silently change scoring, rank progression, skip eligibility, backup frequency, or privacy behavior. If a necessary product decision is absent or contradictory, explain the conflict and ask before choosing a new rule; continue independent work meanwhile.
6. Do not introduce cloud storage, account sign-in, analytics transmission, purchases, coins, or a live leaderboard in V1. Do not transmit personal logs.
7. Maintain schema and backup versioning. Any persisted shape change needs a safe migration and backward-compatible backup import where possible. Do not overwrite the only backup or silently discard existing data.
8. At each phase end, summarize changed files, behavior, checks run and outcomes, unresolved blockers, and remaining phases. Do not state the app is complete until all acceptance criteria are implemented and verified.

## 2. Product vision and release boundary

Solo Leveling is a local-first, offline-capable, mobile-first personal progression PWA with desktop support. Real-world effort is represented through daily missions, personal modules, four separate category ranks, lifetime XP, history, medals and analytics. The interface should feel like a polished dark fantasy/RPG system while keeping tracking practical, respectful and truthful.

V1 is for one local player. Global multiplayer/leaderboard remains disabled and under development. Google sign-in is only a possible future authentication option; it does not itself provide multiplayer and must not be added to V1. Future Windows packaging is a later release consideration.

## 3. Navigation and experience

Five primary destinations:

| Destination | Responsibility |
|---|---|
| Home | Player dashboard, today's missions, motivation, active challenge and next targets |
| Quests | Seven core missions and links into their dedicated modules |
| Progress | Four ranks, lifetime XP, challenge results, achievements, medals, analytics and history |
| Inventory | Earned recovery skips and task boosters, usage history |
| Profile | Preferences, privacy, local data, backup/restore, theme, notifications and locked leaderboard status |

Provide clear navigation and page titles on every screen; do not rely on the Android back button alone. Design mobile-first and responsive through desktop widths. Provide accessible labels, keyboard/focus behavior, readable contrast, empty/loading/error states, and clear success/failure feedback.

## 4. Welcome, local data ownership, privacy and storage

### Local-first privacy

- No automatic cloud storage or cloud account dependency in V1.
- IndexedDB managed by Dexie is the primary live database.
- Keep all personal logs on-device unless the user explicitly exports a file. No telemetry containing personal records.
- Welcome/initialization must clearly warn that progress is stored locally, not automatically in the cloud; clearing app/browser data or uninstalling can remove it; create and retain backups; after reinstall choose the same backup folder again where supported or import a JSON file.
- Provide explicit confirmation before deleting local data. Local PIN/security and optional encrypted backups belong to a security phase. Do not imply encryption/PIN exists until it is implemented and verified.

### Weekly JSON backup policy

- Create **one full JSON snapshot per week**, not one per day. About 26 weekly files over six months. Each file should be timestamped so weekly backups never silently overwrite the sole prior backup.
- Keep IndexedDB as the live store; backups are independent user-controlled copies.
- Offer a manual backup/export at any time. Important-milestone snapshots may be additional, clearly identified backups. The weekly cadence remains the baseline; avoid daily JSON generation.
- Ask for a user-selected backup folder where File System Access API support permits. Automatic weekly saving may happen when the app is opened and folder permission is already available. Show last-successful time and actionable errors; do not report success before the file is safely written.
- Maintain a manual downloadable JSON export/import fallback. Validate app identity, backup format, schema, required fields and integrity before restore. Migrate supported older versions. Explain if a backup is unsupported or invalid.
- Never silently overwrite the only available backup. Prefer unique timestamped filenames and retain prior snapshots; do not implement automatic retention deletion unless a future explicit rule is approved.
- Reinstall caveat: browser permissions and stored directory handles may be lost after uninstall, browser-data clearing, or on unsupported browsers. The user may have to select the same external folder and grant permission again. Do not promise folder permission or local IndexedDB survives reinstall. Restore requires a retained backup file.
- Keep backups independent of app installation. A future optional password-encryption feature must be opt-in, explain lost-password consequences, and never claim encryption while storing plaintext.

### Backup payload

Include backup timestamp, app/version identifier, backup format version, database schema version, data and integrity/checksum metadata. Preserve all user-owned records and settings that the app claims to back up. If a checksum is used, verify it before import. A manifest may summarize snapshots but must not be required for manual import.

## 5. Seven permanent daily missions

These exact core missions remain in V1:

1. **No FAP:** track the user's personal commitment honestly and privately; distinguish urges, intentional choices and involuntary events. Do not medicalize or shame normal physiology.
2. **Fitness:** one daily gym/training mission; on Sunday it becomes mandatory rest and meditation. Detailed records may contain multiple exercises, but must never award duplicate daily mission XP.
3. **Career:** one meaningful job search, application, preparation or career-development action; repeated browsing alone is not meaningful progress.
4. **Sleep & Recovery:** this is one mission, not separate recovery and sleep missions. Record sleep and meet the user's six-hour daily goal. Keep the Sleep workspace as the detail/logging module for this mission; do not add a duplicate daily card. Handle sleep crossing midnight.
5. **Focused Study:** 3 hours of focused study for the daily mission; provide timer/session records and meaningful focus tracking.
6. **Revision & Planning:** revise due material and plan the next day.
7. **Digital Discipline:** avoid intentional pornography, Reels and Shorts consumption. Accidental exposure does not automatically count as a failure.

Every mission needs one daily status row, history, XP allocation, mission medal history, contextual reflection when missed, and a dedicated module or workflow. The user explicitly wants daily Complete/Missed controls to accept honest self-report without requiring a different module record first. Detailed modules remain available for richer tracking. A completed row is struck through and exposes one cross control to reopen/correct it; changing status updates XP by the difference once, without duplicate same-day mission rows. A missed mission reflection should let the player record what happened, trigger/context, actual outcome and a corrective action for tomorrow. Language should be direct and motivating without insults or humiliation. Do not allow editing an outcome to create duplicate XP or erase audit history.

The existing XP figures in `src/App.tsx` are foundation values; preserve them while auditing implementation unless a separate approved spec value exists. Do not infer that XP alone determines rank.

## 6. Four independent rank ladders and 21-day challenges

### Ladders

Fitness, Study, Career and Discipline each progress independently. Each has six ordered ranks with three tiers, 18 tiers per ladder:

`Bronze III → Bronze II → Bronze I → Silver III → Silver II → Silver I → Gold III → Gold II → Gold I → Platinum III → Platinum II → Platinum I → Diamond III → Diamond II → Diamond I → Emerald III → Emerald II → Emerald I`.

A player's four categories may be at different ranks. Bronze III is the floor and Emerald I the ceiling. Lifetime XP and earned historical medals/achievements never disappear due to a tier failure.

### Challenge duration and scoring

- A challenge spans 21 consecutive calendar days (start date through start + 20 days).
- The category result is evaluated independently for all four ladders.
- A category succeeds when its eligible mission completion rate is at least **80%**. Exactly 80% passes. Do not substitute a single combined/global score for category eligibility.
- Eligible missed missions remain in the denominator and are not earned/completed. They therefore can lower the category percentage. Existing foundation `scoreCategory` omits dates with no mission row; implement a reliable expected/eligible-day model so simply not recording a mission cannot make the denominator disappear.
- Pending/future dates are not scored before the challenge closes. Establish the eligible set from scheduled missions/days in the completed challenge, including the Sunday fitness→meditation substitution. Prevent duplicate attempts/logs from inflating earned or possible counts.
- A skip used on an eligible task excuses that task from the challenge denominator, but does not record a successful completion or inflate the completion numerator. Keep the original event/outcome in history. If exact edge cases (e.g. multiple tasks on one category-day) require a policy not specified here, surface that for approval rather than silently inventing it.
- Rank evaluation must occur once, at the completed challenge boundary, and be idempotent. Persist category breakdowns, eligible count, completed count, rate and outcome for history.

### Promotion, consecutive wins and demotion

- A successful challenge advances one tier within the same rank after one success at tiers III and II.
- Crossing from tier I to the next rank's tier III requires **two consecutive successful challenges** at that boundary. The first is recorded as 1/2. The second consecutive pass promotes to the next rank. Any failed challenge breaks the streak.
- A failed category challenge causes exactly one-tier demotion for that category and resets its boundary-win streak. Bronze III cannot demote lower. Emerald I cannot promote beyond its ceiling.
- Examples: Gold II pass → Gold I; Gold I pass 1 → remains Gold I at 1/2; next pass → Platinum III; Gold I followed by failure → demote to Gold II and reset; failure at Silver III → Bronze I; failure at Bronze III → remains Bronze III.
- Apply results to each ladder independently. A pass in Study must not advance Fitness, for example.
- Historical challenges, lifetime XP, records and previously earned achievements remain permanent after demotion.

### Challenge UX

Show challenge start/end, current day, eligible progress, category percentages, the 80% threshold, pending evaluation, final category result, promotion/streak or demotion effect, and a compassionate actionable recap. Do not change rank before evaluation. Prevent overlapping active challenges and duplicate completion processing.

## 7. Recovery skips, boosters and inventory

- No coins, currency, gems, shop or paid reward economy.
- **Two successfully completed 21-day challenges earn one recovery skip.** Keep the earning count tied to completed successful challenges and make the award auditable. The referenced reviewed rules say “two completed challenges” in one summary, while the final locked summary and subsequent handoff say “two successful challenges”; use the later explicit “two completed 21-day challenges” wording as successful completed challenges, not failed attempts. If product owner later clarifies otherwise, ask before changing.
- Recovery skips may be used only on an eligible missed task/category outcome; no tier booster exists. A skip does not falsify a successful mission, and usage is visible in history and excluded from challenge denominator as above. Retain the neutral name “Recovery Skip,” including for the self-control mission.
- Task boosters are earned, never purchased. They may affect the applicable task/XP only. They must never directly promote a tier, bypass a 21-day challenge, reverse demotion, or be tier boosters. Prevent unlimited stacking and record activation/expiry/use.
- Exact task-booster earn rates, inventory cap, effects, expiry and whether a skip is category-specific are not completely defined in the visible approval record. Preserve any existing approved data model where safe, but do not invent an economy. Implement inventory/history structure and ask before finalizing unspecified balancing behavior.

## 8. Modules

### Fitness and exercise

Workout/session logging, exercise library and custom exercises, muscle group, sets/reps/weight in kg, warm-up/working sets, rest timer, duration, RPE/RIR, notes, personal records, training volume, weekly muscle-group statistics, body-weight history, strength trends, frequency and fitness history. Support gym, badminton, football, running/conditioning, mobility, Muay Thai/MMA, meditation and recovery. Sunday meditation replaces the mandatory gym mission; optional activity logging remains available. Never encourage unsafe weight increases or training through injury.

### Study and revision

Focused study timer (Pomodoro/custom), pause/resume, subject/topic, session history and hours, revision queue, notes, mock results, accuracy/performance trends, and spaced repetition. The prior proposal listed suggested review intervals of Day 1, 3, 7, 14 and 30; implement as configurable or documented defaults, not as an immutable progression rule. Revision should surface due topics. Do not reward an idle timer as focus.

### Career and private-sector job tracker

Track company, role, source URL, discovery date, deadline, status, resume version, recruiter details, interview/follow-up dates, notes and feedback. Status path: Saved → To Apply → Applied → Assessment → Interview → Offer/Rejected. Include DSA, system design, skills, interview prep, resume versions, mock scores and learning milestones. Reward meaningful actions.

### Government recruitment discovery — build last

After the other core modules. Search/organize official recruitment sources; capture authority, qualifications, age limits, opening/closing dates, official notification PDF/link, application link, saved status, eligibility notes and deadline reminders. Clearly distinguish announced/confirmed items from unverified speculation; include source and checked date; never invent a vacancy or date. Do not rely on unsupported scraping claims.

### Nutrition — Indian portions first

Search/log common Indian food, meals and user-defined recipes with portion sizes, cooked/raw distinction, grams, roti flour quantity, oil/ghee, ingredients and servings. Estimate calories, protein, carbohydrate, fat, fibre, sugar, saturated fat, sodium and reliable micronutrients. Display uncertainty; do not imply generic estimates are laboratory accurate. Preserve food data source/provenance. Packaged food after the Indian library; barcode scanning is later.

### Hydration

Quick-add 150 ml, 250 ml and 500 ml, custom volume, configurable target, history/graphs and optional reminders. Do not enforce one universal target.

### Self-control and digital discipline

Private user-entered records for urges/events, trigger, intensity, resisted/not, context and reflection; distinguish intentional behavior from involuntary events and accidental exposure. Track pornography, Reels, Shorts, other distractions, manual screen time and detox sessions. A PWA cannot reliably monitor/block other Android apps on its own; do not claim that it does.

### Sleep and recovery

Bed/wake time, duration, quality, naps, weekly averages, consistency and recovery trends. Correctly attribute overnight sleep. Configurable target/minimum (reviewed defaults 7h target, 6h minimum).

### Motivation, reflection, medals and analytics

Daily motivation/directive, reflection and performance-aware feedback. Mission medals and permanent history; daily, 7/14/21-day, challenge, tier and lifetime achievements. Analytics and progress history across missions, challenges and personal modules. Demotion never deletes earned historical awards.

### Notifications

Configurable reminders and quiet hours (foundation defaults quiet hours 22:00–07:00). Ask browser permission only in context, respect disabled state and quiet hours, and explain browser/PWA limits. Notifications are not a substitute for persisted records.

## 9. Themes and visual system

Themes: Shadow, Silver, Gold, red-black, Monarch, Inferno, Frost, Emerald and Solar. The palette button cycles themes directly without opening a chooser. The automatic default follows the highest rank among the four independent ladders (Bronze=Shadow, Silver=Silver, Gold=Gold, Platinum=red-black, Diamond=Frost, Emerald=Emerald); manually cycled themes persist, and cycling past the last manual theme returns to automatic mode. Theme switching should not reload and must persist locally. Maintain the current dark fantasy/RPG visual direction, high contrast, responsive cards and clear hierarchy. Theme choice must not compromise readability or accessible controls. Do not fetch remote fonts/assets at runtime if they undermine offline use; self-host or use robust local/system fallbacks.

## 10. Leaderboard and account boundary

Profile may show `Global Leaderboard — Locked / Under Development` with a concise explanation. No network leaderboard, account, Google Sign-In or cloud sync in V1. Future multiplayer requires separate opt-in, backend, server-side score validation, anti-cheat, privacy controls and explicit product approval. A settings toggle must not imply multiplayer is operational or transmit data.

## 11. Existing repository snapshot and inspection notes

Reviewed files include `package.json`, `README.md`, `src/App.tsx`, `src/types.ts`, `src/db.ts`, `src/backup.ts`, `src/engine/challenge.ts`, `src/styles.css`, and `vite.config.ts`.

- Scripts: `npm run dev`, `npm run build`, `npm run preview`, and `npm test` (Vitest). The project currently uses Vite 8 and the PWA plugin.
- Dependencies include React 18, TypeScript ~5.6, Vite 8, Dexie 4, Framer Motion, Lucide, Vitest 5 and `vite-plugin-pwa` 2.
- The application has five tabs, seven mission cards, four rank records, Dexie persistence, JSON download/import, folder picker/weekly backup attempts, a cycling theme button, PWA configuration and a disabled leaderboard. Home Complete/Missed controls are self-reported; do not reintroduce module-record gating without explicit approval.
- README tracks remaining release work; individual workflows have partial local forms, and their visible presence does not mean the full approved modules are complete.
- `App.tsx` currently uses `DEFAULT_DATA` and simplified inline state. Verify persistence, restore and side effects before extending. In particular inspect when saving an imported backup, stale closure risks, File System Access API availability and whether backup timestamps/filenames can overwrite same-day files.
- `src/engine/challenge.ts` now scores expected eligible missions (including unlogged misses and Sunday fitness/meditation), excludes used skips from the denominator without counting them as completions, applies ranks independently, resets boundary streaks on failure, limits rank movement, and blocks duplicate/early evaluation. Five focused engine tests currently pass. Continue expanding coverage and check the remaining edge cases.
- `src/types.ts` and backup validation are currently minimal; design versioned, testable domain models and migration paths without losing existing data.
- Current welcome warning says local data is not cloud-synced. Retain that clarity and accurately describe restore limits.

This snapshot includes a successful production build and focused unit-test run, but not full browser QA. Do not call existing foundations complete merely because a control/card is visible.


### Current implementation status (10 November 2026)

- `npm test` passes 11 tests across challenge progression and local PIN behavior. The user requested to run the final production build manually; do not claim a current build result until they provide it.
- Local IndexedDB, weekly timestamped folder backups, manual JSON export/import, payload validation, SHA-256 integrity checks, and optional password-encrypted AES-GCM backups are implemented. Encrypted backups use PBKDF2-SHA-256 and require the user to retain the password. The local PIN remains only an access gate. Browser round-trip, folder-permission and reinstall restore QA remain.
- Seven approved missions, status correction and XP delta handling, four independent rank ladders, 21-day challenge history/progress, category counters and 80% threshold display are implemented. Scoring compares the exact ratio, not its rounded display. Recovery skips are limited to already-missed tasks within the active challenge and preserve the missed origin. Automated tests cover calendar boundaries, category independence, threshold math, rank-boundary streaks, duplicate rows and skip scoring. Manual UI QA remains.
- Fitness, sleep, study/revision, career, hydration, food estimate and private No FAP/digital discipline workspaces are implemented locally. The nutrition module now has 20 IFCT 2017 Table 1 macro reference foods with source code, regional sample count and per-serving scaling. This is a partial reference set, not a complete database; mixed-recipe calculator and sourced micronutrients remain. Some module records offer status changes while full edit/delete workflows and browser QA remain incomplete.
- Government jobs is still last in the user workflow. Official Employment News, NCS, UPSC, SSC, IBPS and RRB links, locally saved notices, checked-at dates, status, deadlines and eligibility notes are available. There is no automatic official feed or verified aggregator. The repository has no deployed backend; do not scrape cross-origin pages or fabricate notices. A trusted official feed and hosting choice are required before this item can be marked complete.
- Browser notifications honor configured quiet hours but run only while the app is open; background reminders require later platform/service-worker work. Theme cycling, automatic highest-rank theme, dark fantasy visuals and reduced-motion styling are present. Global leaderboard/cloud sync remain intentionally deferred.
- Unspecified task-booster award rates, cap, effect and expiry remain intentionally unimplemented, per the fixed product rules above. Database schema is still version 1; module defaults support older local payloads, but formal Dexie schema migrations and round-trip migration tests remain.
- Production build, accessibility/mobile/install/offline testing, folder restore simulation, development/production audit, and user browser/device QA are still outstanding. Keep the tracker current and do not label the application complete until those checks and the external feed/data requirements are resolved.
## 12. Development phases

**Phase 0 — Baseline and safety.** Inspect git/worktree status, files, current build/type errors, data model and routes/components. Record existing behavior. Add test tooling appropriate to the codebase without removing current dependencies. Preserve uncommitted work and existing user records.

**Phase 1 — Domain model and core engine.** Define typed mission/category/challenge/rank/inventory/achievement records; pure, deterministic scoring and rank-transition logic; date/timezone-safe challenge windows; expected mission eligibility including missed days and Sunday substitution; idempotent challenge finalization; migrations. Add unit tests for boundary cases before connecting UI.

**Phase 2 — Persistence and backups.** Harden Dexie repositories, transactions and schema migrations; prevent duplicate XP; weekly timestamped full JSON snapshots, manual export/import, validation/integrity, safe restore, status/errors and recovery instructions. Test unsupported browser/folder permission cases and reinstall/manual-restore workflow. Verify no automatic daily file creation.

**Phase 3 — Daily loop and navigation.** Complete welcome, dashboard, seven missions, reflections, challenge progress/result, responsive navigation, themes, inventory and profile. Wire all controls to persistent behavior; no dead placeholder controls represented as finished functionality.

**Phase 4 — Personal modules.** Deliver Fitness; Study/Revision; Career; Nutrition; Hydration; Self-control/Digital Discipline; Sleep/Recovery. Each should have usable flows, data persistence, history and appropriate analytics. Keep government recruitment out of this phase.

**Phase 5 — Progress and release features.** Achievements/medals, analytics, notifications/quiet hours, optional local PIN and optional encrypted backups with honest security language. Audit privacy, offline behavior, keyboard/accessibility, mobile/desktop and PWA install/restore paths.

**Phase 6 — Government recruitment module.** Build last, based on verified official-source requirements and clear source timestamps. Do not add global leaderboard or cloud sync as part of this phase.

## 13. Acceptance criteria / test plan

Automated tests should cover pure engine and persistence/import logic; UI flows should be verified with suitable component/e2e checks where practical. Run typecheck/build and report results. At minimum verify:

1. Four ranks initialize independently at Bronze III; advancing one category never mutates another.
2. Every same-rank tier III/II requires one qualifying challenge; tier I boundary requires two consecutive qualifying challenges; 1/2 persists after first pass; failure resets streak and demotes one tier; ceiling/floor behavior is correct.
3. Threshold exactly 80% passes; below 80% fails. Each of four category percentages is independent.
4. Challenge dates span exactly 21 calendar days and handle month/year boundaries and local date semantics.
5. Eligible missed missions count against the rate; missing a log cannot erase eligibility; future/pending days do not count early; Sunday fitness mission is meditation.
6. Skip removes only the eligible task from denominator, adds no earned completion, consumes once, preserves original history, and cannot be reused or create success by itself.
7. Challenge finalization is idempotent; repeated evaluation cannot duplicate rank changes, XP, awards or inventory.
8. Two qualifying successful challenge completions award one recovery skip exactly once; failed challenges do not accidentally satisfy the rule.
9. Boosters are earned/task-scoped and cannot advance rank, bypass challenges, reverse demotion, stack without limits, or create XP on duplicate completion.
10. XP/status edits do not duplicate lifetime XP; historical XP, records and medals survive demotion.
11. Dexie saves and reloads the full state; schema migration preserves prior valid records.
12. Weekly backups create at most the intended weekly snapshot under the configured schedule, use distinct timestamped names, and keep older snapshots. Manual export works independently of folder API.
13. Invalid, corrupt, wrong-app, unsupported-version and tampered backups are rejected before state replacement. Valid backups restore all supported records/settings. Restore after reinstall works via manual JSON even when directory permission is gone.
14. Backup failure/permission denial is visible and never marked successful; no false promise that browser permission survives reinstall.
15. Six themes persist and switch without reload; layout remains usable on small mobile and desktop.
16. Privacy boundary: no cloud requests/account/leaderboard transmission; local warning and destructive-data confirmation are clear.
17. Modules persist user-entered records and show useful empty/error states; government jobs is last in implementation order; leaderboard remains disabled.
18. Notifications respect opt-in permission, settings and quiet hours; app remains usable offline for local functionality.

## 14. How to continue in Codex from VS Code

1. In VS Code, open the folder `D:\Startup\SoloLevel\solo-leveling-v1` (File → Open Folder).
2. Open the Codex extension/panel and start a coding task with this folder as the workspace. If Codex is not available, install/enable the Codex extension for VS Code and sign in as prompted.
3. Point Codex to this file as the governing spec. Paste this starter prompt:

> Read `CODEX_HANDOFF.md` and `README.md` first. Inspect the existing repository and its current changes before editing. Treat the handoff as the V1 product source of truth. Do not rewrite the app or change product rules. Start with Phase 0 and report the baseline, what is already implemented, gaps, and a small Phase 1 plan. Then implement in phases, preserving existing work and data, adding/running focused tests and `npm run build`. Report results and blockers honestly. Do not claim completion until the acceptance criteria are met.

4. Review the phase plan and diffs in VS Code. Continue with one phase at a time. Keep `CODEX_HANDOFF.md` in the project so every future coding session can reload the source of truth.

---

**Scope note:** This document consolidates the user's reviewed Solo Leveling V1 decisions and the explicit weekly-backup correction from the referenced conversation, with the observed repository state. Where a balancing detail was not actually specified, this brief marks it unresolved rather than inventing a rule. The project remains a foundation requiring phased implementation and verification.





