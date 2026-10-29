// Balance tool: AI vs AI over many seeds. `npm run sim -- 300` (default 300 games).
import { MCD } from '../engine/index.js';

const N = parseInt(process.argv[2] || '300', 10);
export function runSim(n = N, opts = {}) {
  const s = {
    games: n,
    crashes: 0,
    rounds: [],
    completion: 0,
    finisherWins: 0,
    p0: 0,
    p1: 0,
    ties: 0,
    totals: [],
    margins: [],
    caps: [],
    unfinished: 0,
    towers: 0,
    minDeck: 99,
  };
  for (let i = 0; i < n; i++) {
    try {
      const g = MCD.newGame(Object.assign({ seed: 1000 + i, opponent: 'ai' }, opts));
      MCD.chooseFirm(g, 0, MCD.FIRMS[i % 3].id);
      MCD.chooseFirm(g, 1, MCD.FIRMS[(i + 1) % 3].id);
      MCD.finishSetup(g);
      let guard = 200;
      while (!g.gameOver && guard-- > 0) MCD.aiTurn(g, g.turn);
      if (!g.gameOver) {
        s.crashes++;
        continue;
      }
      const r = g.result;
      s.rounds.push(g.round);
      if (r.reason === 'complete') {
        s.completion++;
        if (r.winner === g.endTriggeredBy) s.finisherWins++;
      }
      if (r.winner === -1) s.ties++;
      else if (r.winner === 0) s.p0++;
      else s.p1++;
      s.totals.push(r.scores[0].total, r.scores[1].total);
      s.margins.push(Math.abs(r.scores[0].total - r.scores[1].total));
      g.players.forEach((p) => {
        s.caps.push(p.plots.filter((pl) => pl.cap).length);
        s.minDeck = Math.min(s.minDeck, MCD.deckTotal(p));
        p.plots.forEach((pl) => {
          if (pl.blocks.length) {
            s.towers++;
            if (!pl.cap) s.unfinished++;
          }
        });
      });
    } catch (e) {
      s.crashes++;
      if (s.crashes <= 3) console.error('seed', 1000 + i, e.stack.split('\n').slice(0, 3).join(' | '));
    }
  }
  const avg = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : 0);
  return {
    games: n,
    crashes: s.crashes,
    avgRounds: avg(s.rounds),
    minRounds: Math.min(...s.rounds),
    maxRounds: Math.max(...s.rounds),
    completionRate: +(s.completion / n).toFixed(2),
    finisherWinRate: +(s.finisherWins / Math.max(1, s.completion)).toFixed(2),
    p0Wins: s.p0,
    p1Wins: s.p1,
    ties: s.ties,
    avgScore: avg(s.totals),
    avgMargin: avg(s.margins),
    avgCapsPerPlayer: avg(s.caps),
    unfinishedShare: +(s.unfinished / Math.max(1, s.towers)).toFixed(2),
    smallestDeck: s.minDeck,
  };
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(runSim(N), null, 1));
