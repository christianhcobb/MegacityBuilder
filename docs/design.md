# Megacity Developers — design

The living design doc (full history, playtest notes, every decision) is a Claude Doc: https://claude.ai/artifact/FCELWbL48Cb33fYnAzqwG1. This file is the current state of the rules, kept short so a collaborator can read it in five minutes. When the rules change, change this file in the same PR.

## Pitch

Two rival developers each hold a block of six plots in a new megacity district. Each brings ten cards from their collection into a shared pool and drafts from it every turn — so every card you take is one your rival can't, and every card you bring is one they might. Finish six towers to trigger the end, or out-build the racer with taller, better-planned ones. The city (an event deck) hits both players every round.

Pillars: the draft is the core tension · a tower is a visible commitment · the city is a shared opponent · finishing is a bet, not a win.

## A round

1. **Event** — a splash card for both players (boom, recession, tremor, rezoning, talent fair…). 13 rounds; the deck is the clock.
2. **Income** — $2 plus rent from *finished* towers.
3. **Draw** — 5 cards (6 at Renowned). Reshuffle when the draw pile is empty; on a reshuffle, retire one card from the draw pile (never below 8 cards total).
4. **Act** — play cards. One floor per tower per turn (two with a crane). Any order, no limit on cards.
5. **Draft** — take 1 of the 3 market cards (4 at Noticed); the rest stay for the rival. The permit office always sells a Flat Roof for $5.
6. End of turn discards the hand. When a sixth tower is capped the rival gets one final turn (flagged loudly in the UI), then score.

## Cards

- **Floor cards are crews.** Playing one builds a floor and the card returns to your discard. Cost $1–4; every floor above the 3rd costs $1 more (Glass excepted). Types: Residential, Office, Retail, Hotel, Civic. Materials: Glass, Brick, Stone.
- **Caps** are one-shot. A tower needs 3+ floors to cap. A cap costs $2, +$1 per 2 floors above the 2nd, −$1 per Civic floor you own, −$1 per Stone floor in that tower, −$1 at Respected. Capping banks the tower's points and starts its rent.
- **Ops** cards do things (draw, money, cranes, demolish, swap towers). **Interference** cards hit the rival mildly. **HQ** cards leave your deck and sit in a slot with a permanent effect.
- **Charms** (specialists) attach to one card for the match: Leasing Agent +$1, Architect +1★, Foreman −$1, Zoning Variance, Expediter (returns to top of deck). Bought at a Talent Fair for $2.

## Placement

- Zones (same map for both, random order): Residential zone (ground floor must be Residential) · Commercial (ground floor Office/Retail) · Height limit 3 · Landmark (3+ to cap, cap +3★) · Transit (floors $1 cheaper) · open.
- Vertical: Retail only on the ground floor; nothing builds above a Hotel.
- Inside a tower: Office above Retail (+$1 to the shop) · Residential above Retail or Civic (+1★) · Hotel above Office (+2★).
- Neighbours: Retail +$1 per neighbouring tower with Residential · Office tower +$1 next to Office · Hotel +2★ next to Retail · Residential +1★ next to Civic.
- Materials: Glass has no height surcharge · Brick ignores Tremor and Heat Wave · Stone makes the cap cheaper. A finished tower all in one material scores +1★ per floor.

## Reputation

Points banked in finished towers set a tier: Noticed 6★ (market shows 4) · Respected 12★ (caps $1 cheaper, 2nd HQ slot) · Renowned 18★ (hand 6) · Iconic 26★ (finished towers +$1 rent, 3rd HQ slot). Prestige-sensitive cards (◈) scale with tier.

## Natures

Keywords printed on cards: **Exhaust** (one use, leaves the game) · **Prestige** (scales with reputation tier) · **Retain** (returns to the top of the deck) · **Ground** · **Top** · **Target** (played onto a tower) · **HQ**.

## Game logs

Every game produces a versioned record (`MCD.gameRecord(g)`): seed, settings, developers and their ten, zones, events, every action with money and prestige after it, final boards and scores. Copy it from the results screen or the Logs tile and paste it into a playtest issue. The engine is deterministic, so the seed reproduces the game.

## Scoring

Finished towers (floor points + neighbour bonuses + cap and its bonus) + bounty + finisher bonus (6). Unfinished towers and money score nothing.

## Developers

Same starter deck for everyone. The developer gives a passive and a collection to pick ten from:
- **Ines Harlow** — Residential floors $1 cheaper. Condos, gardens, penthouses.
- **Dov Kessler** — Office floors +1★. Corner offices, cranes, headline tenants.
- **Ade Okafor** — Civic floors earn $1. Libraries, clinics, skybridges, spire.

## Known open questions

See `balance.md`. Short version: the finisher wins too often in AI games; glass spires may dominate; late-game money has no sink; HQ needs more cards; the AI ignores Demolition, Tunnel and Lobbyist.
