# Changelog

## 1.1.0 — 2026-10-29
Playtest round 2.
- **Finishing the block is loud.** The rival still gets one final turn, but now it is unmistakable: a red FINAL TURN banner, the event bar turns red for the whole turn, the round label reads FINAL TURN and the button reads *End game*.
- **Turn ceremony.** "Rival's turn" banner with their portrait before the replay, slower move ticks, the drafted card shown large, then a "Your turn" banner as your hand deals in. Your hand stays hidden until then.
- **Shuffle** is one stack lifting, flipping and landing on the draw pile, which then riffles; counts update on landing.
- **Natures.** Keywords printed on cards instead of a popup: Exhaust, Prestige (+1★/tier etc. inline), Retain, Ground, Top, Target, HQ.
- **Types activated inside a tower.** Office above Retail: the shop earns +$1. Residential above Retail or Civic: +1★. Hotel above Office: +2★. Four new type-synergy cards: Co-working Hub, Community Centre, Grand Bazaar, Convention Hotel.
- **Game logs.** Every game writes a versioned, seeded, structured history (`MCD.gameRecord`). Results screen has "Copy game log"; the title screen's Logs tile keeps the last 20 on the device. Random games now record the seed they actually used, so any logged game can be re-simulated.

## 1.0.0 — 2026-10-29
First shared build. Rules v1: shared-pool drafting, crews, caps, materials, zones, reputation tiers, HQ, talent fair, bigger events, draw/discard piles, landscape layout, rival AI with turn replay.

Fixes found during the refactor:
- Poach was reusable and could drain the rival's deck to zero. Now one-shot and floor-respecting.
- One-shot cards (Site Office, Crane, Poach) removed the wrong card when they carried an Expediter charm, leaving Site Office in play forever. Now removed explicitly.
