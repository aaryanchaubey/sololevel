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

## Phase 2 — Interactive Realms (complete)

Turn existing modules into destinations with consistent motion, visual depth, and meaningful entry feedback. Start with the current quest-module launcher; extend the same patterns to Home and Progress.

- Training Grounds: enter fitness logging, browse the day’s exercises, and see the saved workout grouped by day.
- Study Hall: open focused study and revision tools with clear session progress.
- Guild Board: open career actions and government openings, with saved notices and source links.
- Recovery Sanctuary: make sleep, hydration, and nutrition actions feel like one calm, supportive area.
- Discipline Gate: keep No FAP and Adult Content & Reels tracking private and free of shame-based scoring copy.
- Use fast transform/opacity transitions, distinct realm accents, and touch feedback. Every destination remains a normal accessible button.

**Delivered so far:** module portal cards have distinct accent glows, hover depth, touch feedback, and keyboard focus support. Module workspaces get an animated 3D artifact, realm accent, entry transition, and ambient lighting. Home, Quests, Challenges, Progress, and Inventory have 3D realm banners. Existing module actions and storage remain unchanged.

**Acceptance:** each destination still opens its existing module; all existing save/log actions behave as before; motion is brief and disabled or reduced when requested by the device; effects do not block taps or reduce text contrast.

## Phase 3 — Full 3D Adventure Layer (complete)

Create a consistent real-time 3D world across all primary destinations while preserving readable, accessible controls and existing product behavior.

- Use a compact procedural 3D character and stylized stone path with the camera framing the current step.
- Let the player tap unlocked steps to inspect progress; animate the character to the actual current day only.
- Add subtle depth, lighting, particles, and environmental reactions. Avoid long unskippable sequences.
- Keep one low-detail animated environment behind all main destinations; use tailored 3D scene objects for Training Grounds, Study Hall, Guild Board, Recovery Sanctuary, Home, Progress, Challenges, Inventory, and Profile.
- Limit mobile rendering to 30 fps and pause off-screen/hidden scenes; honor reduced motion and retain CSS/background fallbacks if WebGL fails.
- Extend 3D depth and touch feedback to mission rows, rank tiles, progress cards, shop objects, profile controls, challenge tiles, and module portals without replacing semantic HTML inputs/buttons.

**Delivered:** a shared Three.js environment under every main page; bespoke 3D models for Home, Profile, Quests, Challenges, Progress, Inventory, and each quest module; touch-responsive 3D card depth across data-heavy screens; portrait and landscape journey scenes; desktop and phone rendering caps; hidden/off-screen pause; reduced-motion support; existing controls and product data behavior preserved. Production build passes.

**Acceptance:** verify a device-level performance pass and Google sign-in on physical iOS/Android devices before treating hardware-specific results as verified. Layout and production-build checks passed in the current implementation.

## Implementation notes

- Use the existing React components, CSS motion, and Framer Motion for accessible UI; Three.js provides the scene layer. It remains a separate chunk of about 590 KB raw / 150 KB gzip, with a 468 KB raw main entry.
- Keep scene artwork and character files in `public/` with descriptive versioned names. Do not overwrite the original reference image or backup folder.
- Use original generated or clearly licensed art. Never put text labels inside scene backgrounds; render interface text in HTML.
- Check phone layouts, tap targets, reduced-motion behavior, loading states, and offline/PWA behavior before marking a phase complete.
