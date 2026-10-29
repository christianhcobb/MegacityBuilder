# Balance log

Numbers from `npm run sim -- 300` (AI vs AI, seeds 1000–1299). Add a row whenever a PR changes them.

| Date | Build | avgRounds | completion | finisherWin | avgScore | avgCaps | smallestDeck | Note |
|---|---|---|---|---|---|---|---|---|
| 2026-10-29 | 1.0.0 | 9.15 | 0.99 | 0.85 | 48.09 | 5.27 | 6 | first shared build |

## Known open questions

- The finisher wins 85% of completed AI games. Target is 60–75%. The AI is a racer, so humans may see a different number; collect real results before touching the finisher bonus (6).
- Glass has no height surcharge and uniform towers score per floor. If every game becomes glass spires, change the uniform bonus to +1 per floor above the second.
- Late-game money piles up (both players often end with $100+). Candidate sinks: paid extra draft, a late event converting cash to prestige at a poor rate.
- HQ has six cards. It needs ~12 for the choice to feel real.
- The AI does not use Demolition Crew, Tunnel Boring or Lobbyist well.
