# Solo Leveling V1 — Development Tracker

**Purpose:** Working checklist for the approved V1 product. Update this file in the same commit as each completed feature. A visible screen or a passing build does not count as a finished feature unless its acceptance checks pass.

**Project:** `D:\Startup\SoloLevel\solo-leveling-v1`  
**Last reviewed:** 9 November 2026  
**Current state:** Phase 1 foundation exists; V1 implementation is in progress.  
**Source of product rules:** `CODEX_HANDOFF.md`

## Progress summary

| Phase | Scope | State |
|---|---|---|
| 0 | Repository baseline, React/Vite PWA, IndexedDB, navigation, visual foundation | Foundation complete |
| 1 | Daily mission logging, rank engine, challenge rules and persistence | Core controls implemented; browser interaction and edge-case QA remain |
| 2 | Fitness and recovery workflows | Basic workout/sleep records exist; needs single-session semantics and richer history |
| 3 | Study, revision and planning | Timer and revision interval foundation exist; needs reliable elapsed-time/session completion and review scheduling QA |
| 4 | Career and private-sector applications | Basic saved-opportunity tracker exists; needs complete application workflow |
| 5 | Nutrition and hydration | Estimate presets and water logging exist; needs food-data coverage and target/history polish |
| 6 | Government recruitment discovery (last) | Official links and local notice tracker exist; automatic verified aggregation is not implemented |
| 7 | Backup/security, analytics, accessibility and release verification | In progress |

## Completed foundations

- [x] React + TypeScript + Vite PWA with install manifest and generated service worker.
- [x] Local Dexie/IndexedDB player state; no cloud sync or live leaderboard.
- [x] Five primary destinations: Home, Quests, Progress, Inventory and Profile.
- [x] Seven mission definitions and four independent rank records.
- [x] Challenge engine scores expected missions, counts unlogged eligible missions against the result, excludes skips from the denominator, advances category ranks independently, and protects against duplicate evaluation.
- [x] Five challenge-engine tests and two local-PIN tests currently pass.
- [x] Local mission reflections, mission evidence records, weekly progress chart and milestone badges.
- [x] Theme cycling, tier-based automatic theme default, local anime-inspired SVG backdrop and reduced-motion support.
- [x] Basic local workspaces for Fitness, Study/Revision, Career, Nutrition, Hydration, Sleep, No FAP and Digital Discipline.
- [x] Government page links to official UPSC, SSC, IBPS and RRB portals and can save user-entered notices locally.
- [x] Optional local PIN gate using salted PBKDF2; PIN credentials are omitted from portable backups. This is an access gate, not database or file encryption.
- [x] Weekly timestamped JSON backup attempt, manual export/import and reinstall caveat.
- [x] Latest verified commands: `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`.

## Phase 1 — Daily missions, logging and challenge loop

### Approved seven goals

1. No FAP.
2. Hit the Gym; Sunday is the rest day and the mission becomes meditation.
3. Career action: look for company openings, apply, and check government vacancies.
4. Sleep & Recovery: one goal, at least 6 hours. Do not create a second sleep mission.
5. Study 3 focused hours daily.
6. Revision plus setting tomorrow’s goal.
7. No intentional pornography, Instagram Reels or YouTube Shorts. Accidental exposure is allowed.

### Implemented in current working tree

- [x] Home mission actions respond without requiring an unrelated module log first; changes persist through the Dexie save effect and show a saved/missed notice.
- [x] Completed missions show a struck-through title, logged XP, and one cross action. The cross opens the existing correction/reflection dialog; changing complete to missed reverses the XP delta once.
- [x] Missed state can be corrected by re-logging completion; replacing the same day+mission row applies only the XP difference.
- [x] Keep exactly one Sleep & Recovery mission with the six-hour goal; the Sleep module is its detail page, not another mission.
- [x] Keep one daily Fitness mission. Sunday changes the card and eligible activity to meditation/rest.
- [ ] No FAP and Digital Discipline must distinguish intentional actions, urges, involuntary events and accidental exposure without shaming language.
- [ ] Mission history must allow correction without duplicate rows or duplicate XP.
- [ ] Show explicit in-progress saving, saved, failed-to-save and offline states; the current notice is immediate and persistence errors are reported separately.
- [ ] Browser QA: test every card from Home and Quests, including Complete, Missed, correction/cross, refresh and restored backup.

## Phase 2 — Fitness and sleep/recovery

- [ ] One coherent daily gym/rest/meditation log path; decide and enforce one daily session while supporting multiple exercises inside that session.
- [ ] Exercise library and custom exercise metadata: muscle group, sets, reps, kg, duration, RPE/RIR, warm-up/working sets and notes.
- [ ] Rest timer, session summary, training volume, personal records and weekly muscle-group view.
- [ ] Body-weight history and supported activity types (gym, running, badminton, football, mobility, Muay Thai/MMA, meditation/recovery).
- [ ] Sunday must not require gym. The Sunday meditation record satisfies the daily Fitness mission.
- [ ] Sleep record handles bedtime/wake time across midnight, hours, quality, naps, and weekly average/consistency.
- [ ] Sleep goal defaults to 6 hours and remains the same single mission as Sleep & Recovery.
- [ ] Do not present workout advice as medical advice or encourage training through injury.

## Phase 3 — Study, revision and next-day planning

- [ ] Focus timer reliably supports start, pause, resume, reset and accurate elapsed-time capture; do not trust a manually entered duration as timer evidence.
- [ ] Sessions attach subject/topic, duration and notes; show today/week totals and the 180-minute daily target.
- [ ] Completing the 3-hour mission reflects saved focused sessions and remains correct after reload.
- [ ] Revision queue supports due topics, notes, mock results and accuracy.
- [ ] Spaced review intervals: 1, 3, 7, 14 and 30 days. Completing a review schedules the next review and retains its history.
- [ ] Revision mission requires a review plus a saved goal for tomorrow.
- [ ] Test date arithmetic across month/year boundaries and local timezone.

## Phase 4 — Career and private-sector applications

- [ ] Saved opportunity fields: company, role, source URL, discovery date, deadline, resume version, recruiter, interview/follow-up dates, notes and feedback.
- [ ] Editable status path: Saved → To Apply → Applied → Assessment → Interview → Offer/Rejected.
- [ ] Add preparation trackers for DSA, system design, technical skills, resume versions and mock interviews.
- [ ] Career mission records a meaningful action rather than repeated site visits.
- [ ] Local data export/import covers all career records.

## Phase 5 — Nutrition, hydration, No FAP and digital discipline

- [ ] Nutrition: Indian food library based on documented sources, cooked/raw distinction, gram portions, recipe ingredients, oil/ghee and servings.
- [ ] Estimate calories, protein, carbohydrates, fat, fibre and available micronutrients; label estimate quality and source. Do not imply recipe estimates are exact.
- [ ] Support custom meals and preserve recipe/food provenance. The current small preset list is only a starter, not a complete food database.
- [ ] Hydration: configurable personal target, 150/250/500 ml quick-add, custom amounts, daily history and trends. Do not force one universal target.
- [ ] No FAP log is private and records the user’s goal/outcome neutrally; involuntary events are not intentional behavior.
- [ ] Digital log distinguishes intentional consumption from accidental exposure; accidental exposure is allowed for the mission.
- [ ] PWA must not claim it can monitor or block other Android apps.

## Phase 6 — Government job discovery (must remain last)

- [x] Provide direct links to official UPSC, SSC, IBPS and RRB source pages.
- [x] Allow a player to save a notice locally with authority, status, deadline, qualification and official links.
- [ ] Add a reliable way to retrieve/aggregate active and upcoming notices, including checked-at date and source attribution, without fabricating vacancies.
- [ ] Confirm technical deployment choice for aggregation. Browser-only scraping is unreliable because sites may block cross-origin requests, change markup, or publish notices in PDFs. Any backend/API must be explicit, privacy-preserving and never transmit player logs.
- [ ] Distinguish official announcements, upcoming calendar entries and unverified claims.
- [ ] Add saved notices, eligibility notes, deadline reminders and official application links.
- [ ] Verify each listing against its source before showing it as confirmed.

## Phase 7 — Progress, economy, backup/security and release

- [ ] Full challenge UI shows day/date range, eligible counts, category percentages, 80% threshold, result, rank/streak change and history.
- [ ] Test all tier transitions, two consecutive boundary passes, reset on failure, one-tier demotion, floor/ceiling, 80% boundary, missing missions, skips and duplicate evaluation.
- [ ] Recovery skip: two qualifying successful 21-day challenges award one; use consumes one and excuses a task without counting it completed.
- [ ] Task boosters remain earned and task-scoped; no coin/shop/tier booster. Confirm balancing rules before inventing award rates or stacking behavior.
- [ ] Achievements/medals remain permanent and have auditable criteria; add category/rank history and richer analytics.
- [ ] Weekly full JSON snapshots use unique timestamps; manual export/import works without folder access; no daily JSON generation.
- [ ] Validate backup app/version/schema/payload before replacing state; add schema migrations and malformed/tampered-file tests.
- [ ] Optional encrypted JSON backup with password confirmation and recovery warning; PIN gate alone is not encryption.
- [ ] Reinstall restore: choose the retained backup folder again if browser permission was lost, or import JSON manually.
- [ ] Notifications require opt-in, honor quiet hours and disclose that current reminders run only while the app is open.
- [ ] Test offline startup, PWA install/update, keyboard access, reduced motion, mobile/desktop layouts, empty/loading/error states and browser storage failures.
- [ ] Global leaderboard remains locked. No cloud sync, account sign-in or user-log transmission in V1.

## Definition of done

- [ ] All seven goals map to exactly one daily card each, with Sleep & Recovery unified and the Sunday substitution verified.
- [ ] Every module has an end-to-end flow, persisted records, edit/correction behavior, useful history and empty/error states.
- [ ] Challenge and inventory rules pass automated boundary tests.
- [ ] Backup restore and migrations pass tests and manual PWA reinstall simulation.
- [ ] `npm test`, `npm run build`, production dependency audit and browser/PWA checks pass.
- [ ] No placeholder control is presented as completed behavior; no fabricated job notice; no product rule changes without explicit approval.
- [ ] Update this tracker and `CODEX_HANDOFF.md` in the same commit as each completed phase, then push the commit to GitHub.
