# Solo Leveling V1 — Project Architecture and Extension Guide

This document is the practical map for changing this repository. Read it together with `CODEX_HANDOFF.md` (approved product behavior), `DEVELOPMENT_TRACKER.md` (current implementation status), and `README.md` (setup and release operations).

## Architecture at a glance

```text
React UI (src/App.tsx, page/module components)
        │
        ├── Domain rules (src/engine/)
        ├── Static catalogs (src/data/)
        ├── Local persistence (src/db.ts → Dexie/IndexedDB)
        ├── Backup/restore (src/backup.ts → JSON files/folder handle)
        ├── Optional identity (Firebase Auth; no data sync by itself)
        ├── Explicit public leaderboard snapshot (Firestore; opt-in only)
        └── Community challenges/reports/moderation (Firestore; Google-authenticated)
```

The app is a Vite single-page PWA. `App.tsx` owns top-level navigation and the hydrated `AppData` state. Local changes are persisted through Dexie. Cloud leaderboard publication is a separate, manual action and sends only a deliberately small public profile snapshot. Google sign-in alone never uploads player records.

## Source map

| Path | Responsibility | Change here when… |
|---|---|---|
| `src/App.tsx` | Root navigation, shared app state, dashboard, profile, progress, inventory and challenge views | Adding a primary page, wiring a state transition, or connecting a page to saved app data |
| `src/ModuleWorkspace.tsx` | Forms and histories for fitness, study, career, nutrition, hydration, sleep and discipline modules | Extending an existing module workflow |
| `src/PersonalChallenges.tsx` | Personal challenge UI and optional main-challenge switcher | Changing local personal challenge entry/display behavior |
| `src/CommunityChallenges.tsx` | Public challenge submissions, joining, day check-ins, standings, reports and admin review | Changing global challenge UX or lifecycle |
| `src/communityChallengeService.ts` | Firestore repository for global challenges, participants, check-ins, reports, admin authorization and aggregate counts | Changing remote community data flow or access checks |
| `src/challengePolicy.ts` | Client-side challenge-name and goal language filter | Updating local prohibited-word/normalization checks; pre-publication admin review remains required |
| `src/GovernmentJobs.tsx` | Official links and user-managed government notices | Improving the notices page; do not imply that it scrapes sites |
| `src/Leaderboard.tsx` | Opt-in, signed-in public leaderboard UI and metric selector | Changing leaderboard display, consent, sorting controls or empty/error states |
| `src/leaderboardService.ts` | Public projection of local stats; Firestore read/write/delete | Adding a leaderboard metric or changing its published field set |
| `firestore.rules` | Authenticated leaderboard/community access, owner-scoped check-ins, admin allowlist and field validation | Any Firestore collection/field or read/write policy change |
| `src/data/inventoryCatalog.ts` | XP shop product catalog and product presentation metadata | Adding or changing an XP purchase; keep every price at least 1,000 XP |
| `src/engine/inventory.ts` | Purchase validation, XP debit, item merge, and targeted-booster selection | Changing inventory economy behavior |
| `src/engine/challenge.ts` | Pure challenge score and rank progression rules | Any challenge threshold, mission eligibility, rank transition, or skip award change |
| `src/engine/achievements.ts` | Achievement synchronization and labels | Changing achievement criteria or names |
| `src/db.ts` | Dexie schema, defaults, hydrate/normalize/save | Persisted schema changes or startup data migration |
| `src/types.ts` | Persisted and domain TypeScript contracts | Changing a stored record shape or a domain contract |
| `src/backup.ts` | JSON validation, checksums, weekly/manual/encrypted backup and restore | Changing backup payloads or restore compatibility |
| `src/monthlyArchive.ts` | Monthly roll-up of completed historical records | Changing monthly compaction or summary fields |
| `src/InteractiveWorld3D.tsx`, `src/RealmBanner.tsx`, `src/StepMap.tsx` | Three.js world objects and page scene composition | Adding a 3D scene/object or changing responsive journey-map behavior |
| `src/styles.css` | Shared layout, responsive styling, reduced-motion and theme tokens | Visual or breakpoint changes |
| `vite.config.ts`, `netlify.toml`, `firebase.json` | PWA build, hosting and Firebase rules deployment configuration | Changing build, deployment or PWA behavior |

## Existing data flow

### Local state

1. `App.tsx` calls `loadAppData()` after mount.
2. `src/db.ts` loads the `main` record from the Dexie database named `solo-leveling-v1`, merges defaults for older app data, and runs month archival.
3. UI events create a new `AppData` state object. `App.tsx` persists changes with `saveAppData()`.
4. Backups serialize a portable snapshot. `backupFolderHandle`, local PIN hash and salt are excluded from portable JSON.

Do not persist new transient UI state in `AppData` unless it must survive reloads. Do not write personal records to Firestore, analytics or a remote API.

### Mission logging and XP

Daily missions are declared in `App.tsx` (title, description, category, icon and base XP). The mission ID type is in `src/types.ts`; the per-category challenge mission lists live in `src/engine/challenge.ts`. `logMission()` handles correction deltas and booster consumption. Keep duplicate completion idempotent and update every dependent view if a mission is added.

### Inventory purchase and use

`SHOP_PRODUCTS` is the only XP-store catalog. `purchaseInventoryProduct()` validates the minimum price and available XP, debits spendable XP, and merges matching stackable items. `findMissionBooster()` uses a category-specific booster before the universal booster; logging consumes at most one booster on a newly completed mission. Recovery skips are separately constrained by the challenge engine/UI and must never count as a completion.

The four category boosters all use the existing +50% single-mission XP effect. They do not modify rank, challenge score, lifetime XP twice, or challenge success. The universal booster can target any category. Do not introduce extra XP effects, stack rules, tier effects or free grants without updating the approved product spec and handling existing data safely.

### Global leaderboard privacy and trust boundary

- A Google-authenticated player must explicitly join before a public document is written.
- Publishing is manual: local edits do not silently upload. Players republish when they choose.
- The public document contains only display name, avatar, lifetime XP, trailing-seven-day XP, combined tier score, four rank labels, and successful ranked challenge count.
- Email, age, notes, daily mission history, workouts, study sessions, food, sleep, hydration, reflections, and the full local profile are not published.
- Signed-in users can read opted-in public cards. A user can only create/update/delete the document whose ID is their Firebase UID. The Firestore rules validate field names and ranges.
- Values are self-reported from a local-first client. Firebase rules prevent one account from editing another account's card, but cannot prove a player's local XP/ranks are legitimate. The interface says this plainly. Do not market it as cheat-proof competition or use it for prizes without a trusted server-side verifier.
- To turn on the cloud service, create the Firestore database on the Firebase free Spark plan and deploy the included rules. Until this is done, leaderboard errors remain visible; never relax rules to make the UI appear to work.

## Community challenge lifecycle and security

1. A Google-authenticated user submits a 1–90 day challenge with a daily goal and start date. The local language filter catches common abusive text. Client filtering is bypassable, so every submission starts as `pending_review` and is not visible in the public list.
2. A separate Firebase Auth email/password session is used for the admin. Its UID is checked against `communityAdmins/{uid}`. Only Firebase Console/Admin SDK provisioning can create that allowlist record; Firestore rules deny browser writes to the collection. A named secondary Firebase app keeps the Google player session active.
3. An allowlisted administrator publishes or rejects a submission. Published challenges can be joined once per UID. Participants log per-date check-ins; the challenge standings compare completed-day count, then current streak. Each row stores only UID/date/completed flag, not notes or personal module data.
4. Users can report published challenges. Reports are private to moderators and the reporter. A moderator can keep or remove a challenge from public discovery. Removal is a soft status change so the record/audit context remains in Firestore.
5. All scores/check-ins are client-reported. Do not use for prizes or claim cheat prevention. Participant IDs/check-in dates are visible to signed-in users on a published challenge to support competition. Age, email, daily mission records, and module logs are not copied into community challenge documents.
6. Admin dashboard counts opted-in leaderboard profiles, published main-challenge completion aggregates, community challenge documents, pending reports and participants. It cannot securely count all Firebase Auth users through this browser client.

**Admin credential rule:** Never embed or write a plaintext admin password in the client bundle, repo, logs or a client-writable Firestore document. The current implementation uses a separate Firebase Auth email/password account plus a server-controlled UID allowlist. “Admin logout” signs out that secondary account only. The header shortcut is five taps. Do not store passwords in `.env` or Firestore.

## Extension recipes

### Add a new XP reward

1. Add a typed product to `src/data/inventoryCatalog.ts`; give it a unique stable `id`, user-facing description, effect, section, `kind`, `target`, and price (minimum 1,000 XP).
2. If the product uses an existing effect, ensure its selection/consumption behavior already matches `src/engine/inventory.ts` and the relevant caller in `src/App.tsx`.
3. If it needs a new persistent item kind, update `InventoryItem` in `src/types.ts`, the schema/default normalization as needed, `src/backup.ts` validation, inventory UI, use/consume flow, and architecture/product docs. Add a backward-compatible migration and round-trip coverage before shipping a new stored shape.
4. Preserve the minimum-cost rule and show the complete effect before purchase. Insufficient XP must disable/block purchase without a negative balance.

### Add a new leaderboard chart/sort

1. Define the metric and exact tie-break rule in product docs first.
2. Extend `LeaderboardMetric`, metric labels and comparator/query field mapping in `src/leaderboardService.ts` and `src/Leaderboard.tsx`.
3. Add only the necessary aggregate to the opt-in public snapshot. Never add email, dates of birth, notes, individual logs or module records.
4. Update `firestore.rules` with a strict type/range check for any new field; keep owners restricted to their own UID document and reads restricted to authenticated users.
5. Update privacy text, README, architecture guide and setup instructions. If the metric cannot be truthfully derived from current local data, do not present it as verified.

### Add a primary navigation page

1. Add a unique label, icon and `setTab` path in the navigation in `src/App.tsx`.
2. Add a matching `tab === ...` render branch with page title, loading/empty/error state, and responsive controls.
3. Add a `RealmBanner` or appropriate page scene, and check mobile bottom navigation and reduced motion.
4. Update this guide and README's feature/navigation tables.

### Add a daily mission

1. Add the typed ID in `src/types.ts` and the mission metadata in the `missions` catalog in `src/App.tsx`.
2. Choose its category and ensure exactly one category eligibility mapping in `src/engine/challenge.ts`.
3. Add/extend its module workflow and `missionReady()` mapping if the mission depends on module evidence.
4. Check daily summary counts, XP correction behavior, booster category targeting, skip behavior, challenge denominator and monthly archive logic.
5. Add focused engine/UI coverage before changing the challenge contract. Update `CODEX_HANDOFF.md` first if it changes an approved rule.

### Add a module/log record

1. Add interfaces to `src/types.ts` and an array/property to `AppModules`.
2. Add an empty default in `DEFAULT_MODULES` in `src/db.ts`; `loadAppData()` must continue merging defaults to support old devices.
3. Implement form, validation, history and correction/empty/error states in `src/ModuleWorkspace.tsx`.
4. If old data needs a new stored shape, add a new Dexie version in `src/db.ts`, migrate the main record, bump backup/schema validation in `src/backup.ts`, and update monthly archiving in `src/monthlyArchive.ts`.
5. Confirm export/restore preserves the new data without uploading it remotely.

### Change a challenge/rank rule

Do not edit UI text alone. Change the pure implementation in `src/engine/challenge.ts`, add boundary cases in `tests/`, update `CODEX_HANDOFF.md`, tracker and README, then run `npm test` and `npm run build`. Never apply a rank change outside the engine's idempotent evaluation flow.

## Data migration and compatibility checklist

Before adding a persisted field or enum:

- Is the field optional/defaulted for existing IndexedDB rows?
- Does `loadAppData()` normalize it safely?
- Does `saveAppData()` persist it without rewriting unrelated state?
- Can older backup JSON still be validated/restored, or is a versioned migration needed?
- Does monthly archive retain the right aggregate before source rows are removed?
- Is the Firestore public document affected? If yes, is publication still opt-in and minimal?
- Can the user correct/export the data before any destructive migration?

## Required checks before release

From the project root:

```powershell
npm test
npm run build
```

Also manually verify desktop and a 390px phone viewport, all five navigation destinations, guest and Google login, XP purchase/insufficient XP/category booster behavior, opt-in/update/withdraw leaderboard flow with two test accounts, offline startup, PWA update/install, backup/restore, and strict Firestore rules. Never use real personal logs as disposable leaderboard test content.
