# Solo Leveling Interactive World Roadmap

This roadmap tracks the visual and interaction upgrade in three phases. Existing mission, challenge, XP, rank, and storage rules remain authoritative; visual work must not silently change them.

## Phase 1 — 21-Day Journey Map (complete)

- Replace the background illustration that had baked-in lettering with clean, original environment art.
- Place an original climbing character on the player's current challenge day. Before a challenge starts, the character waits on Day 1.
- Let players tap a day to inspect its date and mission count without changing challenge progress.
- Keep the journey legible on phone widths with a separate portrait composition, add clear completed/current/locked states, and respect reduced-motion preferences.
- Keep added art light enough for PWA delivery (generated backgrounds are approximately 400 KB combined; Three.js is loaded as a separate lazy chunk).

**Acceptance:** all 21 steps render; the character follows the actual challenge day; tapping a step updates its detail strip; the map has no duplicate/baked-in text; small screens remain readable; no mission or challenge data is changed by viewing the map.

**Delivered in the current checkpoint:** responsive 21-step map with separate landscape/portrait artwork and point layouts; only day numbers are overlaid on the scene; a procedural Three.js character, 3D stone route, lighting, and subtle motes follow the actual challenge day; selectable day details; reduced-motion and WebGL fallback support. The compressed character sprite remains only as the fallback. Build is passing.

## Phase 2 — Interactive Realms (in progress)

Turn existing modules into destinations with consistent motion, visual depth, and meaningful entry feedback. Start with the current quest-module launcher; extend the same patterns to Home and Progress.

- Training Grounds: enter fitness logging, browse the day’s exercises, and see the saved workout grouped by day.
- Study Hall: open focused study and revision tools with clear session progress.
- Guild Board: open career actions and government openings, with saved notices and source links.
- Recovery Sanctuary: make sleep, hydration, and nutrition actions feel like one calm, supportive area.
- Discipline Gate: keep No FAP and Adult Content & Reels tracking private and free of shame-based scoring copy.
- Use fast transform/opacity transitions, distinct realm accents, and touch feedback. Every destination remains a normal accessible button.

**Delivered so far:** module portal cards have distinct accent glows, hover depth, touch feedback, and keyboard focus support. Module workspaces get an animated 3D artifact, realm accent, entry transition, and ambient lighting. Home, Quests, Challenges, Progress, and Inventory have 3D realm banners. Existing module actions and storage remain unchanged.

**Acceptance:** each destination still opens its existing module; all existing save/log actions behave as before; motion is brief and disabled or reduced when requested by the device; effects do not block taps or reduce text contrast.

## Phase 3 — Selective 3D Adventure Layer (in progress)

Add real-time 3D only where it adds value, beginning with the journey path and character. Keep the rest of the app fast and readable.

- Use a compact procedural 3D character and stylized stone path with the camera framing the current step.
- Let the player tap unlocked steps to inspect progress; animate the character to the actual current day only.
- Add subtle depth, lighting, particles, and environmental reactions. Avoid long unskippable sequences.
- Lazy-load the 3D scene after the profile/map or realm is opened; limit mobile rendering to 30 fps and pause off-screen/hidden scenes; keep a 2.5D fallback for reduced motion and WebGL failure.
- Reuse the Phase 2 visual system for distinct scenes, including Training Grounds, Study Hall, Guild Board, Recovery Sanctuary, Home, Progress, Challenges, and Inventory, without duplicating the underlying module features.

**Acceptance:** all existing app flows work with WebGL enabled and disabled; scene assets load on demand; text and controls remain accessible; no challenge rules or local data are changed; both desktop and portrait layouts stay usable; mobile rendering stays lightweight.

## Implementation notes

- Use the existing React components, CSS motion, and Framer Motion first. Three.js is now a separate lazy chunk; current build output is about 589 KB raw / 149 KB gzip for that chunk, with a 468 KB raw main entry.
- Keep scene artwork and character files in `public/` with descriptive versioned names. Do not overwrite the original reference image or backup folder.
- Use original generated or clearly licensed art. Never put text labels inside scene backgrounds; render interface text in HTML.
- Check phone layouts, tap targets, reduced-motion behavior, loading states, and offline/PWA behavior before marking a phase complete.
