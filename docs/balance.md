# Balance log

Numbers from `npm run sim -- 300` (AI vs AI, seeds 1000–1299). Add a row whenever a PR changes them.

| Date | Build | avgRounds | completion | finisherWin | avgScore | avgCaps | smallestDeck | Note |
|---|---|---|---|---|---|---|---|---|
| 2026-10-29 | 1.0.0 | 9.15 | 0.99 | 0.85 | 48.09 | 5.27 | 6 | first shared build |
| 2026-10-29 | 1.1.0 | 9.0 | 1.00 | 0.87 | 47.45 | 5.17 | 7 | in-tower type synergies; 4 new cards; rebuttal turn kept |
| 2026-10-29 | 1.2.0 | 10.1 | 0.98 | 0.84 | 55.17 | 5.08 | 5 | 16 new cards, 9 new charms, signature HQs, bank 1★/$10, cap base $3, tiers 8/18/30/44 |

## Known open questions

- Tried removing the rebuttal turn in 1.1.0: AI finisher win rate jumped from 85% to 94%, so it stays.
- The finisher wins 85% of completed AI games. Target is 60–75%. The AI is a racer, so humans may see a different number; collect real results before touching the finisher bonus (6).
- Glass has no height surcharge and uniform towers score per floor. If every game becomes glass spires, change the uniform bonus to +1 per floor above the second.
- Late-game money piles up (both players often end with $100+). Candidate sinks: paid extra draft, a late event converting cash to prestige at a poor rate.
- HQ has six cards. It needs ~12 for the choice to feel real.
- The AI does not use Demolition Crew, Tunnel Boring or Lobbyist well.

## 1.2.0 meta notes (docs/meta.md, 2000 games)

- Money is unconstrained after round 6: income goes $2 → $20 a round by round 8 and players end with ~$70. Costs alone do not fix it (tested floors +$1/+$2, caps $4–6: completion rate collapses before money does). The surplus is structural: once towers are capped there is nothing to buy. Banked money is therefore worth only 1★ per $10. The real lever is more things to spend on late — ideas: pay to draft 2, pay to re-roll the market, buy a specialist outside a fair.
- Tiers were being maxed by round 8 (everyone Iconic). Thresholds raised to 8/18/30/44; the spread is now roughly 1 / 8 / 24 / 81 / 86 per 200 players.
- Okafor wins 38% vs ~55% for the others in AI hands. The greedy AI undervalues Civic (no rent) even with the $1 passive; watch whether humans do too before buffing.
- Special caps (Solar Array, Penthouse, Rooftop Bar, Spire) sit at 0.60–0.67 win rate; expensive specialty floors (Casino, Parking Deck, Arcology, Data Centre) at ~0.35. Likely the AI misplays them (it values printed numbers), so no change yet.
- Expediter at 0.39 and Anchor Tenant at 0.35 are the weakest charms; Grant Writer 0.63 and Superintendent 0.58 the strongest.
