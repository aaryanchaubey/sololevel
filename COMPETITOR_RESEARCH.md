# Solo Leveling product and mobile UX review

Research snapshot: November 2026. The goal is to borrow proven interaction patterns while keeping Solo Leveling's local-first, single-player product rules.

## Comparable products and patterns

| Product | Useful pattern | What Solo Leveling adopts |
| --- | --- | --- |
| Habitica | Gives completed tasks visible experience, earned currency, and an item/reward shop. | A small XP shop with two clear consumables: Recovery Skip and one-use Mission Booster. Available XP is distinct from lifetime XP so purchases do not rewrite the player's level history. |
| Hevy | Workout entry supports sets, reps, load or duration; workout history surfaces previous performance; rest timers reduce gym friction. | Quick activity chips, separate gym versus cardio forms, distance and duration logging, previous exercise values, and the existing rest timer. |
| Habitify Challenges | Challenge creation makes name, duration, daily target, and end date explicit; progress can be entered inside the challenge. | A personal challenge builder with one daily goal, a duration from 1 to 90 days, an on-page calendar check-in, and a direct dashboard switch. It stays separate from ranked challenge scoring. |
| Loop Habit Tracker | Local-only storage is a valid privacy choice for a habit tracker. | Keep local storage as the default and describe Google Drive as an optional user-triggered backup rather than silently uploading personal logs. |

## Product decisions

- The 21-day ranked challenge keeps its current 80% scoring and rank effects. Its new X action cancels the active run, retains daily mission history, and does not evaluate or change ranks.
- Personal challenges are private local records. They can run while the ranked challenge continues. Each day is an independent check-in; custom challenge events award no XP and do not affect ranks, skip inventory, or the leaderboard.
- Only one personal challenge can be active at once. The data model stores an array of challenges and challenge IDs on check-ins so multiple past and future challenges remain supported.
- The shop uses spendable XP earned from main missions. Lifetime XP remains a historical total. The Recovery Skip follows its current eligibility rules; a Mission Booster adds a one-time 50% XP bonus only to a newly completed main mission.
- Indian meal shortcuts label the basis behind each number. Roti uses dry atta weight; dal uses dry pulse weight; rice uses dry grain weight; cooking water, oil, serving variation, and brand variation are excluded. Paneer and fruit entries use the IFCT catalog where values are available.
- Google Drive sync uses a single versioned JSON backup in the account's hidden application data folder. Upload and restore are explicit actions. Access tokens remain in memory for the current browser session.

## Mobile interface review

The existing 5-item bottom navigation becomes a 6-item bar after adding Challenges. It now scrolls horizontally at narrow widths, includes the phone safe-area inset, and keeps controls at touch-friendly sizes. Panels collapse to one column, workout shortcuts and food shortcuts can scroll horizontally, and the challenge calendar uses compact touch targets. Main page changes now get a short transform/opacity transition; reduced-motion preferences still disable animations.

## Limitations and next follow-ups

- The Google Drive flow requires a Google OAuth web client ID and an enabled Drive API. Setup steps are in `GOOGLE_SYNC_SETUP.md`; production cloud sync cannot be enabled until that public client ID is added to Netlify.
- The local shop is intentionally small. Add cosmetic and recovery items only after observing how spendable XP feels in use; never use real-money purchases without a separate product decision.
- Nutrition shortcuts are reference calculations, not clinical dietary advice or lab measurements. Meal recipes vary substantially by cook and portion.

## Sources

- Habitica, [Features](https://habitica.com/static/features) and [main site](https://habitica.com/).
- Hevy, [Workout logging and routines](https://www.hevyapp.com/features/track-workouts/) and [exercise programming options](https://www.hevyapp.com/features/exercise-programming-options/).
- Habitify, [Challenge update](https://feedback.habitify.me/changelog?c=New) and [challenge creation updates](https://feedback.habitify.me/changelog?c=iOS+Update).
- Loop Habit Tracker, [Privacy policy](https://loophabits.org/privacy).
- Google, [Drive app data folder](https://developers.google.com/workspace/drive/api/guides/appdata).
