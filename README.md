# sololevel — Solo Leveling V1

Local-first, offline-capable progression PWA built with React, TypeScript, Vite 8 and Dexie/IndexedDB.

**Status:** Phase 1 foundation is complete. V1 is still under development; module workflows, security, richer analytics, official-notice aggregation, and release hardening remain.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`).

## Production PWA preview

```powershell
npm run build
npm run preview
```

Open the preview URL (normally `http://localhost:4173/`) in Chrome or Edge and choose **Install app** from the browser menu. Production PWA installation requires HTTPS except on localhost.

## Data and privacy

Player records are stored locally in IndexedDB. There is no cloud sync or global leaderboard in V1. Back up JSON exports somewhere safe; after reinstall, restore by importing a retained backup. Folder access can require permission again.

## Current implementation

The app includes the seven daily missions, four rank records and challenge evaluator, local logging workspaces for fitness, study/revision, career, nutrition, hydration, sleep, No FAP and digital discipline, plus an official government recruitment source page with a local notice tracker, an in-app reminder setting, a seven-day mission chart, permanent achievement milestones, and an optional local PIN access gate. The government page opens official sites directly; it does not automatically scrape or aggregate their notices.

## Product handoff

Read [CODEX_HANDOFF.md](./CODEX_HANDOFF.md) for the approved product rules, existing implementation status, phased plan, acceptance criteria and Codex continuation prompt. Visible UI foundations and a successful build do not mean all product modules are complete.

## Checks

- `npm test` — focused challenge-engine tests.
- `npm run build` — TypeScript project checks, production bundle, and PWA service worker.


