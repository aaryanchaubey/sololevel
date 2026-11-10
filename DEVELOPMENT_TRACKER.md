# Solo Leveling V1 — Development Tracker

**Purpose:** Working checklist for the approved V1 product. Update this file in the same commit as each completed feature. A visible screen or a passing build does not count as a finished feature unless its acceptance checks pass.

**Project:** `D:\Startup\SoloLevel\solo-leveling-v1`  
**Last reviewed:** 10 November 2026

**Current state:** XP inventory, architecture documentation, opt-in leaderboard, and global challenge/moderation client code are in the working tree. The production build passed during this session. Firestore creation/rules deployment, admin UID provisioning, multi-account lifecycle QA, and mobile/desktop QA remain external checks. No production deployment is claimed here.
**Source of product rules:** `CODEX_HANDOFF.md`

## Progress summary

| Phase | Scope | State |
|---|---|---|
| 0 | Repository baseline, React/Vite PWA, IndexedDB, navigation, visual foundation | Foundation complete |
| 1 | Daily mission logging, rank engine, challenge rules and persistence | Implementation complete; manual browser/restore QA remains |
| 2 | Fitness and recovery workflows | Implementation complete; manual browser QA remains |
| 3 | Study, revision and planning | Implementation complete; date-boundary/manual browser QA remains |
| 4 | Career and private-sector applications | Implementation complete; manual browser QA remains |
| 5 | Nutrition and hydration | 20-food IFCT reference, ingredient-weight recipe calculator, and sourced calcium/iron coverage; broader coverage remains |
| 6 | Government recruitment discovery (last) | Manual official-source workflow implemented; verified automatic feed requires external source/service work |
| 7 | Backup/security, analytics, accessibility and release verification | Core challenge/backup/security implementation; build, device QA and policy-dependent items remain |

## Completed foundations

- [x] React + TypeScript + Vite PWA with install manifest and generated service worker.
- [x] Local Dexie/IndexedDB player state; private module logs remain local. Separate opt-in public aggregate leaderboard/community features use Firestore.
- [x] Five bottom navigation destinations plus header Inventory and Profile; Challenges includes personal and global challenge flows.
- [x] Seven mission definitions and four independent rank records.
- [x] Challenge engine scores expected missions, counts unlogged eligible missions against the result, excludes skips from the denominator, advances category ranks independently, and protects against duplicate evaluation.
- [x] Nine challenge-engine tests and two local-PIN tests pass in the latest `npm test` run (10 November 2026).
- [x] Local mission reflections, mission evidence records, weekly progress chart and milestone badges.
- [x] Theme cycling, tier-based automatic theme default, local anime-inspired SVG backdrop and reduced-motion support.
- [x] Basic local workspaces for Fitness, Study/Revision, Career, Nutrition, Hydration, Sleep, No FAP and Digital Discipline.
- [x] Government page links to Employment News, NCS, UPSC, SSC, IBPS and RRB official listings and can save user-entered notices locally.
- [x] Optional local PIN gate using salted PBKDF2; PIN credentials are omitted from portable backups. This is an access gate, not database or file encryption.
- [x] Weekly timestamped JSON backup attempt, manual export/import and reinstall caveat.
- [x] Latest current check: `npm test` (11 tests pass, 10 November 2026). Previous build/audit results are historical; this handoff session has not rerun the build/audit.

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
- [x] No FAP distinguishes stayed-on-track, slip, involuntary event and urge; Digital Discipline distinguishes intentional use, avoidance and accidental exposure.
- [x] Recent mission history supports marking a completed entry missed and re-logging a missed entry; one row per date+mission and XP delta adjustment are preserved.
- [x] Show saving, saved and failed-to-save states; a local-mode indicator discloses offline/local storage.
- [ ] Browser QA: test every card from Home and Quests, including Complete, Missed, correction/cross, refresh and restored backup (requires user-run browser session).

## Phase 2 — Fitness and sleep/recovery

- [x] One daily fitness session id groups multiple exercise entries; daily mission XP remains one row per date. Sunday meditation qualifies.
- [x] Explain one-per-day Fitness mission XP and summarize training days distinctly from exercise records.
- [x] Exercise suggestions plus custom exercise entry; record muscle group, warm-up/working set type, sets, reps, kg, duration, RPE, RIR and notes.
- [x] Rest timer, session summary, weekly lifting volume, best logged load and weekly muscle-group set counts.
- [x] Body-weight history (one saved record per day) and supported activity types (gym, running, badminton, football, mobility, Muay Thai/MMA, meditation/recovery).
- [x] Sunday can be logged as meditation and qualifies for the single daily Fitness mission.
- [x] Sleep record handles bedtime/wake time across midnight, hours, quality and naps. One record per night updates on resave and recent 7-day average is displayed.
- [x] Sleep goal defaults to 6 hours and remains the same single mission as Sleep & Recovery.
- [x] Fitness workspace records activities without prescribing medical advice or telling the player to train through injury.

## Phase 3 — Study, revision and next-day planning

- [x] Require the focus timer to finish before saving a study session; reset clears completion state.
- [x] Timer uses a wall-clock deadline, supports pause/resume/reset, and gates saves on completion; it remains accurate when background tabs throttle interval callbacks.
- [x] Sessions attach subject/topic, actual configured duration and notes; study view shows today's and 7-day totals against the 180-minute target.
- [x] Saved study sessions persist in the local module store and drive the focused-study totals; mission taps remain honest self-report and do not require a module entry to respond.
- [x] Revision queue tracks due topics, tomorrow-goal date/note, mock accuracy and review notes.
- [x] Spaced review sequence advances through 1, 3, 7, 14 and 30 days. Reviews append timestamps, accuracy and notes.
- [x] Revision workspace pairs the review plan with a saved goal for tomorrow.
- [x] Automated date arithmetic coverage across leap day, month/year boundaries; [ ] manual timezone/browser QA.

## Phase 4 — Career and private-sector applications

- [x] Saved opportunity fields: company, role, source URL, discovery date, deadline, resume version, recruiter, interview/follow-up dates, feedback and notes.
- [x] Editable status path: Saved → To Apply → Applied → Assessment → Interview → Offer/Rejected.
- [x] Preparation tracking captures DSA/system design/technical/resume/mock-interview area, notes and mock score.
- [x] Career records are part of full local backup/export and restore.
- [x] Career mission remains an honest self-report and does not reward repeated browsing by itself.

## Phase 5 — Nutrition, hydration, No FAP and digital discipline

- [x] Replace unsourced presets with 20 cited IFCT 2017 Table 1 entries. The app displays code, sampled-region count, provenance and scales per-100 g macro values to serving grams.
- [x] Calculate recipes from measured IFCT ingredient weights and servings; save per-serving macro estimates and ingredient/code provenance in the food log.
- [x] Add sourced calcium and iron where IFCT Table 5 contains values. Missing cells remain unavailable; recipe totals show only when every ingredient has that nutrient.
- [ ] Expand the partial IFCT catalog; custom ingredients and other micronutrients beyond calcium and iron are not yet included in automatic recipe calculations.
- [x] Support custom meals and preserve recipe/food provenance. The preset list remains a starter, not a complete food database.
- [x] Hydration: configurable personal target, 150/250/500 ml quick-add, custom amounts, daily history and 7-day total. Do not force one universal target.
- [x] No FAP log is private and records outcomes neutrally; involuntary events and urges have distinct outcomes.
- [x] Digital log distinguishes intentional consumption from accidental exposure; accidental exposure is allowed for the mission.
- [x] PWA does not claim to monitor or block other Android apps; digital discipline is user-reported only.

## Phase 6 — Government job discovery (must remain last)

- [x] Provide direct links to Employment News, NCS, UPSC, SSC, IBPS and RRB official source pages; notices are still manually saved and verified by the player.
- [x] Allow a player to save a notice locally with authority, status, deadline, qualification and official links.
- [x] Edit saved notice status, refresh its checked-at date and show deadline timing.
- [ ] Add a reliable way to retrieve/aggregate active and upcoming notices, including checked-at date and source attribution, without fabricating vacancies.
- [ ] Confirm technical deployment choice for aggregation. Browser-only scraping is unreliable because sites may block cross-origin requests, change markup, or publish notices in PDFs. Any backend/API must be explicit, privacy-preserving and never transmit player logs.
- [ ] Distinguish official announcements, upcoming calendar entries and unverified claims.
- [ ] Add saved notices, eligibility notes, deadline reminders and official application links.
- [ ] Verify each listing against its source before showing it as confirmed.

## Phase 7 — Progress, economy, backup/security and release

- [x] Challenge UI shows active date range/day and completed category counts, percentages and history; [ ] final user/browser QA.
- [x] Automated tests cover category independence, consecutive boundary pass/reset, one-tier demotion, floor/ceiling, 80% threshold math, unlogged missions, skip denominator and duplicate evaluation; expand as needed.
- [x] Recovery skip awards one per two qualifying successful 21-day challenge completions; can only be used on a missed mission inside the active challenge and preserves its missed origin.
- [x] XP shop catalog, minimum 1,000 XP floor, targeted/universal one-use boosters and Recovery Skip use rules are implemented; [ ] verify purchase/use/history flow manually.
- [ ] Achievements/medals remain permanent and have auditable criteria; add category/rank history and richer analytics.
- [x] Weekly full JSON snapshots use timestamped filenames; manual export/import works without folder access; no daily JSON generation.
- [x] Validate backup app/version/schema/payload and SHA-256 integrity before replacing state; module defaults are merged for older payloads. [ ] Add schema migration tests and restore round-trip browser QA.
- [x] Optional AES-GCM encrypted JSON backup with password confirmation and recovery warning; PIN gate alone is not encryption. [ ] Browser round-trip QA.
- [ ] Reinstall restore: choose the retained backup folder again if browser permission was lost, or import JSON manually.
- [ ] Notifications require opt-in, honor quiet hours and disclose that current reminders run only while the app is open.
- [ ] Test offline startup, PWA install/update, keyboard access, reduced motion, mobile/desktop layouts, empty/loading/error states and browser storage failures (manual device/browser QA).
- [x] Opt-in leaderboard supports lifetime XP, combined tier score, last-7-day XP, and ranked challenge wins; aggregate documents omit private logs.
- [x] XP-only inventory includes recovery support, four category boosters and a universal booster; each purchase costs at least 1,000 XP.
- [x] Global challenge lifecycle client: authenticated submission, pending moderation, publish/reject, join, daily check-ins, standings, reports, keep/remove and admin dashboard.
- [x] Profile switch hides the ranked challenge/journey UI while retaining local records; personal/global challenges remain available.
- [ ] Create Firebase Firestore database on Spark and deploy restrictive rules; verify real account permissions.
- [ ] Add admin Google UID to `communityAdmins/{uid}` from Firebase Console; test five-tap entry, review, reports, removal and admin-panel exit.
- [ ] Test challenge creation/filtering, join/leave, date-bound check-ins, multi-account standings and completion history on mobile and desktop.
- [ ] Confirm private logs/emails/age are absent from Firestore. Participant UID and dated check-ins are shared within published challenges by design.
- [ ] Admin counts cover opted-in leaderboard profiles and their client-published completion totals, not all Firebase Auth accounts.

## Definition of done

- [x] All seven goals map to exactly one daily card each, with Sleep & Recovery unified and Sunday substitution in place; [ ] browser verification.
- [ ] Every module has an end-to-end flow, persisted records, complete edit/correction behavior, useful history and empty/error states (some records are append/status-only).
- [x] Current challenge scoring and rank progression rules pass 9 automated engine tests; [ ] inventory use/audit UI acceptance QA.
- [ ] Backup restore and migrations pass round-trip tests and manual PWA reinstall simulation.
- [x] `npm test` passed historically (11 tests). [x] `npm run build` passed after current implementation; bundle-size warning remains. [ ] Browser/PWA/account QA and dependency audit.
- [ ] No placeholder control is presented as completed behavior; no fabricated job notice; no product rule changes without explicit approval.
- [x] Update this tracker and `CODEX_HANDOFF.md` with the current implementation state before committing/pushing.

## Explicit external/manual completion items

- Automatic government notice aggregation is not safe to mark complete without verified official data feeds, source attribution/refresh checks, and an explicitly hosted aggregation service. V1 remains local-first and currently has no backend deployment; the existing module truthfully supports official links and user-entered notices.
- The app now attributes a partial IFCT 2017 catalog and its derived recipe estimates. Broader food coverage, additional IFCT micronutrients, custom recipe ingredients, and future packaged-food data remain open.
- User must run the production build and install/offline/restore checks in their browser/device. This coding session does not claim those results.
- Global leaderboard/community values are client-reported, not server-verified. No Cloud Functions, paid services, all-account analytics endpoint or cheat prevention is added.
- Admin passwords are not stored in source or Firestore. Firebase Auth handles the secondary admin credential; the matching Auth UID is allowlisted from Firebase Console. The supplied plaintext password was intentionally not copied into the app.
