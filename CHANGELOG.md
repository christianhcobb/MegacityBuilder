# Changelog

## 1.2.0 — 2026-10-29
Playtest round 3.
- **Rebuttal turn stays**, and it is loud: red FINAL TURN banner, the event bar turns red for the turn, the button reads *End game*. A player whose block is complete stops drafting (no accidental $5 roofs).
- **Hand.** Playing a card no longer re-deals the hand; the survivors slide into the gap. Only newly drawn cards deal in.
- **Expediter** visibly returns the card to the top of the draw pile with a label.
- **Specialists (charms) reworked.** 14 specialists, 9 new; most are tied to a building type (Anchor Tenant: Retail, Concierge: Hotel, Boardroom: Office, Superintendent: Residential, Grant Writer: Civic), Gilder joins caps, Gambler flips a coin. Three offered per fair at random prices $1–3. New hire sheet: pick a specialist, eligible cards light up, ineligible ones say why.
- **HQ.** Your developer's specialty is now a signature HQ card installed from the start, so the strip is never empty. One open slot from the start (was zero visible value), Respected and Iconic add two. New Treasury HQ. Union Hall pays $3.
- **Prestige shimmer.** No popup; Prestige cards shimmer in your hand once you have a reputation tier, faster and brighter at higher tiers. Reputation badge glows from Respected.
- **Fewer plain base cards, 16 new cards**: Mirror Hall, Glass Atrium, Data Centre, Casino, Night Market, Arcology Pod, Artist Lofts, Parking Deck, Grand Lobby, Street Market, Lucky Dragon Diner (floors) · Billboard, Solar Array (caps) · Express Elevator, Windfall (ops) · Treasury (HQ). Ground is a nature on its own now (Retail, Parking Deck, Grand Lobby) and the draft marks Ground cards with how many empty plots you have left; the AI stops drafting them when it has none.
- **Special effects.** Coins and stars burst from a tower when a floor or cap lands; dice and coin flips pop with their result; the rival's rolls show in the replay.
- **Banked money scores** 1★ per $10 (Treasury: per $6). Caps cost $3 base. Reputation tiers now 8/18/30/44★.
- **Meta sim.** `npm run meta` plays random developers with random packs and writes docs/meta.md: win rate per card, cap, charm, HQ, developer, matchup and bounty.
- Web-app manifest and icon: open the Pages URL on a phone, Add to Home Screen, and it runs full-screen in either orientation. Landscape layout tightened for short screens.

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
