# Megacity Developers

A two-player mobile deck-builder about rival skyscraper developers. Each player brings ten cards into a shared pool, drafts from it every turn, and races to finish six towers on a city block — or out-builds the racer with taller, better-planned ones.

**Play the current build:** `main` deploys to https://christianhcobb.github.io/megacitybuilder/. On a phone, open it in Safari, Share → *Add to Home Screen* for a full-screen app.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173, hot reload
npm test           # engine tests (vitest)
npm run sim        # 300 AI-vs-AI games, balance numbers as JSON
npm run lint
npm run build      # dist/ for GitHub Pages
SINGLEFILE=1 npm run build   # one self-contained index.html (artifacts, home-screen testing)
```

## How the code is laid out

```
src/engine/   pure rules, no DOM. Deterministic from a seed.
  rng.js        seeded RNG + shuffle
  board.js      counting helpers over a player's plots
  data.js       every card, developer, bounty, event, zone, tier  ← most content changes live here
  rules.js      economy, placement rules, turn flow, scoring
  ai.js         the greedy rival
  index.js      the public surface (MCD)
src/ui/       the screen. main.js (state → DOM), art.js (all SVG illustration), styles.css
src/sim/      npm run sim
test/         vitest; every bug we have fixed should leave a test behind
docs/         design doc, balance log
```

The UI only ever talks to the engine through `MCD.*`. Keep it that way: the engine is what we would ship to a server for async multiplayer, and the sim and tests depend on it having no side effects beyond the game object.

## Adding a card

1. Add an entry to `CATALOG` in `src/engine/data.js` (`kind`, `type`, `look`, `cost`, `rev`, `pts`, `text`, optional `ps` for prestige scaling, `target: 'plot'` for cards aimed at a tower).
2. If it needs an effect beyond its numbers, add a `case` in `playCard` / `capBonus` / `blockPts` / `blockRev` in `rules.js`. If it is an HQ card, its effect is checked with `hasHq(p, key)` wherever it applies.
3. Give it an illustration in `src/ui/art.js` (`blocks`, `caps` or `ops` maps; the sheet of all cards is a good reference for the style: bold outline, flat colour, a little scene).
4. Put it in `BASE_DECK` or a developer's `collection`.
5. Run `npm test` and `npm run sim`, and paste the sim numbers in the PR.

## Rules in one paragraph

Each round: an event hits both players, you collect $2 plus rent from *finished* towers, draw five, build and play, then draft one card from a shared market (the rest stay for your rival). A floor card is a crew: it builds one floor and returns to your discard. Caps are one-shot and finish a tower, which banks its points and starts its rent. Every floor above the third costs $1 more (Glass excepted). Floors are Glass, Brick or Stone; a finished tower all in one material scores +1★ per floor. Plots carry zoning (icons). Reputation tiers come from banked points and unlock perks and HQ slots. Cap your sixth tower to trigger the end; the rival gets one last turn. Score = finished towers + bounty + finisher bonus. The full design and its history are in `docs/design.md`.
