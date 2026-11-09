# sololevel — Solo Leveling V1

Local-first, offline-capable progression PWA built with React, TypeScript, Vite and Dexie/IndexedDB.

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

## Product handoff

Read [CODEX_HANDOFF.md](./CODEX_HANDOFF.md) for the approved product rules, existing implementation status, phased plan, acceptance criteria and Codex continuation prompt. Visible UI foundations and a successful build do not mean all product modules are complete.

## Build

`npm run build` performs TypeScript project checks and creates the production bundle/PWA service worker. A dedicated test script has not yet been added.
