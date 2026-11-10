# Solo Leveling — Personal Progression PWA

Solo Leveling is a local-first, offline-capable personal tracking and progression app. It combines seven daily missions, four independent rank ladders, a 21-day challenge, fitness/study/career/nutrition/recovery modules, XP rewards, personal and report-moderated global challenges, monthly summaries, backups, and an optional opt-in leaderboard.

> **Data ownership:** mission and module details are stored in this browser/device using IndexedDB. Google sign-in identifies the player; it does not sync private logs. The opt-in leaderboard publishes a small aggregate profile. Joining a published global challenge also shares the participant UID and dated check-ins with signed-in users so standings can be compared.

## Contents

- [Current status](#current-status)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Build and preview](#build-and-preview)
- [Install the PWA on a phone](#install-the-pwa-on-a-phone)
- [Features and navigation](#features-and-navigation)
- [Data, privacy, backup and restore](#data-privacy-backup-and-restore)
- [Google sign-in and Drive backup setup](#google-sign-in-and-drive-backup-setup)
- [Enable the global leaderboard on Firebase Spark](#enable-the-global-leaderboard-on-firebase-spark)
- [Global community challenges and admin moderation](#global-community-challenges-and-admin-moderation)
- [Deploy to Netlify](#deploy-to-netlify)
- [Project structure and extension guide](#project-structure-and-extension-guide)
- [Development workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Product and implementation references](#product-and-implementation-references)

## Current status

The project contains a working React/TypeScript/Vite PWA and local IndexedDB implementation. Main areas include Home, Quests, Progress, Challenges, Inventory, Profile, the 3D journey map, and module workspaces. The global leaderboard code is opt-in and requires Firestore to be enabled and the included security rules deployed before it can read or publish entries. No backend or leaderboard feature is a substitute for user-run phone, restore, and real-account QA.

The app does not scrape government job sites. The government openings page provides official source links and locally managed notices. The nutrition catalog and recipe estimates have limited sourced coverage; unavailable micronutrients must remain unavailable rather than being fabricated.

## Requirements

- Windows 10/11, macOS, or Linux
- Git
- Node.js **20.19+** or **22.12+** (Vite 8 requirement; use a current Node 22 LTS release)
- npm (included with Node.js)
- Chrome or Edge for PWA install and File System Access API features

Check installed versions:

```powershell
node --version
npm --version
git --version
```

## Run locally

Open PowerShell or Command Prompt in the repository folder:

```powershell
cd D:\Startup\SoloLevel\solo-leveling-v1
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. The dev server binds to `0.0.0.0`, so another device on the same trusted Wi-Fi can use the computer's LAN address and port 5173. Google OAuth must separately authorize that exact development origin; localhost login works only if Firebase and OAuth settings include it.

If the port is busy, Vite prints another port such as 5174. Use the URL it actually prints.

## Build and preview

Run the TypeScript project checks and create the production PWA bundle:

```powershell
npm run build
```

Preview the generated `dist/` build locally:

```powershell
npm run preview
```

Open the URL printed by Vite Preview, usually `http://localhost:4173/`. Preview the production build rather than relying only on `npm run dev` before installing or releasing the PWA.

Available npm scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite development server |
| `npm run build` | TypeScript build checks, Vite production bundle, PWA service worker |
| `npm run preview` | Serve the production `dist/` folder locally |
| `npm test` | Run Vitest tests |

## Install the PWA on a phone

The deployed HTTPS site can be installed as a PWA. Localhost is also treated as a secure origin for development.

### Android / Chrome

1. Open the deployed site in Chrome.
2. Open Chrome's menu and choose **Install app** or **Add to Home screen**.
3. Confirm. Launch Solo Leveling from the new home-screen icon.
4. Back up data before clearing site storage, uninstalling browser data, or changing devices.

### iPhone / iPad / Safari

1. Open the deployed HTTPS site in Safari.
2. Tap **Share** → **Add to Home Screen**.
3. Open the new icon. Some browser/OS behavior, especially OAuth popups and file/folder access, differs by iOS version; validate Google sign-in and backup on the actual device.

The service worker can cache the app shell for offline startup. Google sign-in, Firestore leaderboard access, Drive backup, and external government-source websites require a network connection. PWA/browser storage can still be removed by the operating system; keep an exported backup.

## Features and navigation

### Main destinations

| Destination | What it contains |
|---|---|
| **Home** | Player status, four independent ranks, seven daily missions, and ranked/personal challenge focus |
| **Quests** | Mission module launcher and individual logging workspaces |
| **Progress** | Monthly summaries, rank ladders, challenge results, weekly chart, achievements and history |
| **Challenges** | Local personal challenge plus live-on-create global challenges with opt-in check-ins, standings and reports |
| **Inventory** | XP reward catalog, spendable XP balance, owned items and item quantities |
| **Leaderboard** | Opt-in public standings for signed-in Google players; requires Firebase Firestore setup below |
| **Profile** | Player details, avatar, themes, privacy settings, local PIN and backup/restore controls |

The top-bar archive icon opens Inventory; the profile/avatar icon opens Profile. On mobile, the five-item bottom navigation has Home, Quests, Progress, Challenges and Leaderboard.

### Seven daily missions

No FAP; Hit the Gym (Sunday is rest with meditation); Career & Openings; Sleep & Recovery; Study 3 Hours; Revision & Goal Setting; Adult Content & Reels. The mission details, XP and the four rank categories are defined in the product handoff and source, not by the visual theme.

### XP inventory

The XP shop currently has Recovery Skip, category-specific Fitness/Study/Career/Discipline boosters, and a universal mission booster. Products cost at least 1,000 XP. Boosters affect at most one newly completed mission and cannot directly alter rank or challenge results. A targeted booster is consumed before the universal booster when both apply. Recovery Skip only excuses an already-missed eligible mission during an active ranked challenge and never counts as a completion.

## Data, privacy, backup and restore

### Local data

- Dexie/IndexedDB is the primary store. Data is tied to that browser profile/device and can be cleared by the user, browser, OS, uninstall, or storage pressure.
- Google sign-in does **not** move the local profile or module logs to the cloud.
- No email, age, notes, reflections, workout details, nutrition entries, sleep entries or daily mission rows are sent to the leaderboard.
- Weekly JSON backup is available after choosing a local folder where supported. Manual JSON download/export works without folder access. An optional password-encrypted JSON export is also available.

### Before reinstalling or changing devices

1. Open Profile and export a JSON backup (or create a weekly folder snapshot).
2. Store the file somewhere outside browser storage and retain the encrypted-backup password separately, if used.
3. After reinstall, open Profile and restore/import the retained JSON file. Re-select a chosen folder if browser permissions were lost.
4. Verify the restored data before removing the old copy.

Never expect Google sign-in or installing the PWA to restore local mission history automatically. Do not store a backup only inside the app's browser storage.

### Monthly compaction

At load/save, completed past-month activity is aggregated into monthly summary totals and the detailed eligible rows are compacted. Active challenge rows are retained until safe to archive. A backup is recommended before major updates.

## Google sign-in and Drive backup setup

The app uses Firebase Authentication for Google identity. Manual Google Drive app-data backup is a separate optional flow and requires the Google Identity Services web client ID.

1. Create a local env file from the safe template:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Fill the Firebase web-app values in `.env.local` and, when enabling Drive backup, `VITE_GOOGLE_CLIENT_ID`.
3. In Firebase Authentication, enable Google and authorize the development/deployed domains.
4. In the Google OAuth client, add the deployed site and localhost origins/redirects required by its current Google console configuration.
5. Restart `npm run dev` after editing env variables. For Netlify, add the same required public web configuration as build environment variables, then redeploy.
6. Follow [GOOGLE_SYNC_SETUP.md](./GOOGLE_SYNC_SETUP.md) for the exact Drive OAuth setup already used by this project.

`VITE_*` values are bundled into browser JavaScript; treat them as public client configuration, not server secrets. Never put service-account private keys, OAuth client secrets or passwords in `.env.local`, frontend code, GitHub, or a `VITE_*` variable. `VITE_COMMUNITY_ADMIN_EMAIL` is only the public Firebase Auth account identifier; Firebase Auth handles its password.

## Enable the global leaderboard on Firebase Spark

The leaderboard uses the existing Firebase Authentication identity and a Firestore collection named `leaderboard`. It works on the Firebase **Spark free plan**; it does not require Cloud Functions, Blaze billing or an admin credential. It is a casual, self-reported board, not a cheat-proof competition.

### 1. Create the Firestore database

1. Open the Firebase Console for the same project configured by `VITE_FIREBASE_PROJECT_ID`.
2. Select **Build → Firestore Database → Create database**.
3. Choose **Production mode** and an appropriate region. Keep the app on the free Spark plan; do not enable billing for this setup.
4. Wait until the database is ready. Do not add permissive test rules.

### 2. Deploy the repository's restricted rules and indexes

From the repository folder, sign in to Firebase CLI if needed and deploy only the checked-in Firestore rules:

```powershell
npx firebase-tools login
npx firebase-tools deploy --only firestore --project YOUR_FIREBASE_PROJECT_ID
```

Replace `YOUR_FIREBASE_PROJECT_ID` with the Firebase project ID (not an API key). The project config is in your local `.env.local`; it is not committed. This deploys both [firestore.rules](./firestore.rules) and [firestore.indexes.json](./firestore.indexes.json), including the collection-group `participants.uid` index used by community challenge membership. The rules restrict leaderboard ownership, require auth for community operations, allow only server-provisioned admin UIDs, and keep private logs outside the remote collections.

### 3. Use the board

1. Sign in with Google and open Leaderboard.
2. Read the opt-in data disclosure and select the consent checkbox.
3. Choose **Join leaderboard**. This manually publishes display name, avatar, lifetime XP, trailing 7-day XP, the four rank labels, combined tier score and successful ranked challenge wins.
4. Choose **Publish score update** when you want to refresh your entry. Local changes do not upload automatically.
5. Choose **Remove my profile** to withdraw the public entry. This deletes only the leaderboard card; it does not delete local progress or the Google account.

Leaderboard sorting options are Lifetime XP, Combined tier score, Last 7 days XP and 21-day challenge wins. Tier score is a transparent sum across the four independent ladders (Bronze III = 0, Emerald I = 17 per category). The weekly view uses each player's trailing seven local calendar dates. Each view shows up to 100 signed-in opt-in players.

**Integrity limitation:** Firestore rules verify identity, ownership and field shape, but the app is local-first and client-published. A user can alter their own local score before publishing. Entries are self-reported and should not be used for prizes or high-stakes competition. Server verification would require a trusted backend and a separate cost/security review; this repository does not add one.

## Global community challenges and admin moderation

The Challenges page supports local personal goals plus Firebase-backed community challenges. Google sign-in is required for the community area. Challenge text is filtered in the browser and new challenges publish immediately. Players can join, check in once per date, compare standings (completed days, then current streak), and report a live challenge. Reports enter the allowlisted admin's review queue but do not hide or pause the challenge. The admin can keep it live or remove it for everyone. Completed/expired challenges remain visible as history. Community events award no XP and do not change the four rank ladders.

Challenge check-ins and the participant UID are shared with signed-in users on that published challenge so standings can be compared. These are self-reported check-ins, not verified evidence. The language filter is not a substitute for review; reports appear in the admin queue. Never use this feature for health claims, prizes, or sensitive personal details.

### Safe admin access

The Profile page has an Admin access section at the bottom; the header's five-tap shortcut is also available. Admin sign-in uses a separate Firebase Authentication email/password user on a second Firebase Auth instance, so the current Google player stays signed in. Enable the Email/Password provider in Firebase Authentication, set `VITE_COMMUNITY_ADMIN_LOGIN_ID` (defaults to `aaryanchaubey`) and `VITE_COMMUNITY_ADMIN_EMAIL` (the Firebase Auth email address) in `.env.local`/Netlify, then create that email/password user in Firebase Console. The password is entered only into Firebase Auth at sign-in and is never saved by the app.

**Provisioning is done in Firebase Console by the project owner**, because browser clients cannot grant themselves admin rights. After creating the Firebase Auth user, copy its UID from the Authentication user list and add a document at `communityAdmins/{admin-auth-uid}` (for example fields `role: "admin"` and `createdAt: <timestamp>`). Do not add client write access to `communityAdmins`. The password previously pasted into chat is not embedded in source or Firestore; if you want to use it for the Firebase Auth account, enter it directly in the Firebase Console password field.

The admin ID/password pair is not embedded in source or stored in Firestore. Firebase Auth stores the credential securely; the server-controlled UID allowlist authorizes moderation. “Admin logout” signs out only the separate admin session and leaves the player signed in. Admin metrics count opted-in leaderboard profiles and their published ranked-challenge completion totals; Firebase's browser SDK cannot securely enumerate every Auth account. No Cloud Functions or paid plan is added.

After provisioning the admin UID, redeploy the included restrictive Firestore rules with the command above. Sign in to the main app with Google, tap the brand five times, then use the separate admin ID/password from Firebase Auth. Confirm the player name stays signed in while admin review opens, and review a test submission. Do not use permissive test rules.

The Profile switch **Show main challenge** hides the ranked challenge and journey map from that account's UI; it preserves existing logs and rank history. Personal and community challenges remain available. Community challenges require Firestore to be enabled; this source code does not itself create the database or admin UID.

## Deploy to Netlify

The repository's [netlify.toml](./netlify.toml) builds with `npm run build` and publishes `dist/`. The app can remain on the Netlify free plan within current plan quotas.

### GitHub-connected deployment

1. Ensure the GitHub repo's production branch is `main` and Netlify is connected to that repo.
2. In Netlify Site configuration, set build command `npm run build`, publish directory `dist`, and the public Firebase/Google `VITE_*` build variables required by your setup.
3. Push a commit to `main`:

   ```powershell
   git status
   git add README.md PROJECT_ARCHITECTURE.md src
   git commit -m "Describe project architecture and extend XP rewards"
   git push origin main
   ```

4. Wait for the Netlify deploy to finish, then open the production URL and verify the deployed commit/assets. A successful Git push alone does not prove the deploy is live.

### Manual production deploy

Build and deploy using the Netlify CLI already associated with the site:

```powershell
npm run build
npx netlify-cli status
npx netlify-cli deploy --prod --dir=dist
```

The CLI reports the production URL and unique deploy URL. Check the Netlify deploy log for build status. Never commit `.env.local`, credentials, OAuth client secrets, or Firebase service-account keys.

## Project structure and extension guide

```text
src/
  App.tsx                   Root navigation and page-level state
  ModuleWorkspace.tsx       Fitness, study, career, food, sleep and discipline tools
  Leaderboard.tsx           Opt-in global-board UI and consent
  leaderboardService.ts     Firestore projection/query/write/remove functions
  CommunityChallenges.tsx   Community challenge creation, participation, reports and moderation UI
  communityChallengeService.ts Firestore lifecycle and admin allowlist access
  challengePolicy.ts        Client-side challenge-name/goal language filter
  data/
    inventoryCatalog.ts     XP products and displayed effects
    ifctFoods.ts            Sourced food reference values
  engine/
    challenge.ts            Challenge scoring and rank transitions
    inventory.ts            XP purchase and booster selection rules
    achievements.ts         Achievement criteria and synchronization
  db.ts                     Dexie schema, defaults and local state persistence
  backup.ts                 JSON, weekly, integrity and encrypted backup flows
  monthlyArchive.ts         Monthly summary/compaction
  InteractiveWorld3D.tsx    Shared Three.js objects and animation lifecycle
  StepMap.tsx               Responsive 21-day journey route
  styles.css                Theme, desktop/mobile, motion and page styles
tests/                      Vitest engine/security tests
public/                     PWA icon and journey artwork
firestore.rules             Authenticated leaderboard, community and admin allowlist rules
firestore.indexes.json      Composite and collection-group indexes for community queries
firebase.json               Firebase CLI rules file mapping
netlify.toml                Netlify SPA build and redirect configuration
```

Before extending code, read [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md). It identifies the exact files to change when adding a mission/module/item/leaderboard metric, plus migration, privacy, testing and release obligations. Product rules remain governed by [CODEX_HANDOFF.md](./CODEX_HANDOFF.md); progress lives in [DEVELOPMENT_TRACKER.md](./DEVELOPMENT_TRACKER.md).

### Safe contribution sequence

1. `git status` and inspect existing user changes. Never overwrite or clean them automatically.
2. Read the product handoff and architecture path relevant to the feature.
3. Keep domain logic in `src/engine/`, static lists in `src/data/`, and UI wiring in the appropriate component.
4. For stored shape changes, update defaults, migration/normalization, monthly compaction, backup validation, and docs together.
5. For remote data, minimize fields, make sharing opt-in, write strict rules first, and never transmit local detailed logs.
6. Run `npm test` for domain changes and `npm run build` for all code changes. Manually check desktop, phone, PWA/offline, backups, and account behavior that a build cannot verify.
7. Summarize changed files, checks and remaining limitations. Do not call the application complete while external setup/device QA remains.

## Development workflow

```powershell
git status --short
npm install
npm run dev
```

Before committing:

```powershell
npm test
npm run build
git diff --check
git status --short
```

`final-build.log` is a local build log and may be untracked; inspect status and preserve it unless the owner asks to remove it. Never print or commit secret config files.

## Troubleshooting

### `npm run dev` says the port is busy

Use the next Vite URL printed in the terminal, or stop the previous Vite process in its own terminal with Ctrl+C.

### Browser says the site cannot be reached

Ensure the Vite terminal is still running. Use the exact URL printed by Vite, not a `file://` path. For a production build use `npm run preview` and its printed URL.

### Build complains about a missing Lucide icon export

Use an icon that exists in the installed `lucide-react` package. Do not assume a common noun is exported; verify its exact named export before adding it.

### Old site or blank page after an update

The PWA service worker may still control an older asset set. First wait for the app update/reload prompt. If needed, clear this site's cached files/service worker and reload. **Do not clear site data** unless you have exported a backup, because IndexedDB player progress is stored there.

### Google sign-in fails

Verify Firebase Authentication has Google enabled, the current origin is authorized in Firebase and OAuth configuration, and the correct Firebase `VITE_*` values were present at build time. Restart Vite after editing `.env.local`; trigger a new Netlify build after changing Netlify environment values.

### Leaderboard says it could not load or publish

Confirm the Firestore database exists, the app uses the same Firebase project as Authentication, the logged-in account is Google-authenticated, and `firestore.rules` has been deployed. Keep production mode/rules strict. Do not switch to public unauthenticated read/write rules. Check the browser console and Firebase rules diagnostics for the exact permission error.

### Global challenges says an index is required

Deploy the checked-in Firestore indexes with `npx firebase-tools deploy --only firestore:indexes --project YOUR_FIREBASE_PROJECT_ID`. Firestore may need time to finish building a newly deployed index; retry the query after its index state is ready in the Firebase console.

### Drive backup is unavailable

Drive uses a separate Google OAuth client and `drive.appdata` scope. Follow [GOOGLE_SYNC_SETUP.md](./GOOGLE_SYNC_SETUP.md). Google sign-in for Firebase does not automatically grant Drive access.

### Folder backup permission was lost

Re-select the folder in Profile and grant browser permission again. If the original folder no longer exists or permission cannot be restored, import a JSON backup instead.

## Product and implementation references

- [CODEX_HANDOFF.md](./CODEX_HANDOFF.md) — product rules and acceptance criteria
- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) — code map and extension recipes
- [DEVELOPMENT_TRACKER.md](./DEVELOPMENT_TRACKER.md) — completed/open development items
- [INTERACTIVE_WORLD_ROADMAP.md](./INTERACTIVE_WORLD_ROADMAP.md) — 3D and responsive experience
- [GOOGLE_SYNC_SETUP.md](./GOOGLE_SYNC_SETUP.md) — Drive OAuth and manual backup configuration
- [COMPETITOR_RESEARCH.md](./COMPETITOR_RESEARCH.md) — prior product research notes
