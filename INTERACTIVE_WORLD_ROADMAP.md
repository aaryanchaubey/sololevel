# Solo Leveling Interactive World Roadmap

This roadmap tracks the visual and interaction upgrade in three phases. Existing mission, challenge, XP, rank, and storage rules remain authoritative; visual work must not silently change them.

## Phase 1 — 21-Day Journey Map (complete)

- Replace the background illustration that had baked-in lettering with clean, original environment art.
- Place an original climbing character on the player's current challenge day. Before a challenge starts, the character waits on Day 1.
- Let players tap a day to inspect its date and mission count without changing challenge progress.
- Keep the journey legible on phone widths, add clear completed/current/locked states, and respect reduced-motion preferences.
- Keep added art light enough for PWA delivery (current generated assets are approximately 470 KB combined).

**Acceptance:** all 21 steps render; the character follows the actual challenge day; tapping a step updates its detail strip; the map has no duplicate/baked-in text; small screens remain readable; no mission or challenge data is changed by viewing the map.

**Delivered in the current checkpoint:** responsive 21-step map, clean text-free background, compressed character sprite bound to the actual day, selectable day details, reduced-motion support, and depth styling. The production build is passing.

## Phase 2 — Interactive Realms (in progress)

Turn existing modules into destinations with consistent motion, visual depth, and meaningful entry feedback. Start with the current quest-module launcher; extend the same patterns to Home and Progress.

- Training Grounds: enter fitness logging, browse the day’s exercises, and see the saved workout grouped by day.
- Study Hall: open focused study and revision tools with clear session progress.
- Guild Board: open career actions and government openings, with saved notices and source links.
- Recovery Sanctuary: make sleep, hydration, and nutrition actions feel like one calm, supportive area.
- Discipline Gate: keep No FAP and Adult Content & Reels tracking private and free of shame-based scoring copy.
- Use fast transform/opacity transitions, distinct realm accents, and touch feedback. Every destination remains a normal accessible button.

**Delivered so far:** module portal cards now have distinct accent glows, hover depth, touch feedback, and keyboard focus support. Module workspaces get a realm accent, entry transition, and subtle ambient lighting. The existing module actions and storage remain unchanged.

**Acceptance:** each destination still opens its existing module; all existing save/log actions behave as before; motion is brief and disabled or reduced when requested by the device; effects do not block taps or reduce text contrast.

## Phase 3 — Selective 3D Adventure Layer (planned)

Add real-time 3D only where it adds value, beginning with the journey path and character. Keep the rest of the app fast and readable.

- Use a compact rigged character and a stylized path with a camera that frames the current step.
- Let the player tap unlocked steps to inspect progress; animate the character to the actual current day only.
- Add subtle depth, lighting, particles, and environmental reactions. Avoid long unskippable sequences.
- Lazy-load the 3D scene after the profile/map is opened; keep a 2.5D fallback for low-power devices, reduced motion, and WebGL failure.
- Reuse the Phase 2 visual system for distinct scenes, such as Training Grounds, Study Hall, Guild Board, and Recovery Sanctuary, without duplicating the underlying module features.

**Acceptance:** all existing app flows work with WebGL enabled and disabled; scene assets load on demand; text and controls remain accessible; no challenge rules or local data are changed; the mobile fallback remains quick and usable.

## Implementation notes

- Use the existing React components, CSS motion, and Framer Motion first. Add a 3D runtime only in Phase 3 after measuring the bundle and mobile performance impact.
- Keep scene artwork and character files in `public/` with descriptive versioned names. Do not overwrite the original reference image or backup folder.
- Use original generated or clearly licensed art. Never put text labels inside scene backgrounds; render interface text in HTML.
- Check phone layouts, tap targets, reduced-motion behavior, loading states, and offline/PWA behavior before marking a phase complete.
