# Working on Megacity together

**Branches.** `main` is always playable and deploys automatically. Work on a branch, open a PR, get one review. Keep PRs small: one card, one rule, one screen.

**Before you push:** `npm run check` (lint + tests + build). CI runs the same and posts a 300-game sim snapshot.

**Balance changes** (anything in `src/engine/`): paste `npm run sim -- 300` before and after in the PR. The numbers we watch:

- `avgRounds` — target 9 to 12. A 30-second turn makes that a 5–6 minute match.
- `completionRate` — share of games ending by someone finishing six towers. Should stay high but not 100%; the clock is the alternative ending.
- `finisherWinRate` — how often the player who finishes wins. We want 60–75%. Above that, finishing is the only strategy.
- `smallestDeck` — must never collapse (we had decks eat themselves once).

**Playtest feedback** goes in issues with the *playtest-feedback* label. Include the build version from the title screen and, for scoring questions, a screenshot of the results breakdown.

**Tests.** When you fix a bug, add a test that would have caught it. The engine is deterministic from a seed, so a failing game can be reproduced with `MCD.newGame({ seed })`.

**Style.** Prettier and ESLint are configured; `npm run format` before committing. The engine stays free of DOM and timers. The UI stays free of rules (if you find yourself computing a cost in `main.js`, the engine needs a function).

**Art.** All illustration is SVG in `src/ui/art.js`, one consistent style: 2.2px dark outline, flat fills with a lighter top face, rounded corners, no gradients except sky. Render the contact sheet (see the `sheet` test script in `docs/`) before merging new art.
