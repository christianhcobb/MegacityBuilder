import { describe, it, expect } from 'vitest';
import { MCD } from '../src/engine/index.js';
import { runSim } from '../src/sim/sim.js';

function game(seed, a = 'harlow', b = 'okafor') {
  const g = MCD.newGame({ seed, opponent: 'ai' });
  MCD.chooseFirm(g, 0, a);
  MCD.chooseFirm(g, 1, b);
  MCD.finishSetup(g);
  return g;
}
function playOut(g) {
  let n = 200;
  while (!g.gameOver && n-- > 0) MCD.aiTurn(g, g.turn);
  return g;
}

describe('engine', () => {
  it('is deterministic for a seed', () => {
    const a = playOut(game(42)),
      b = playOut(game(42));
    expect(a.result.scores.map((s) => s.total)).toEqual(b.result.scores.map((s) => s.total));
    expect(a.round).toBe(b.round);
  });
  it('plays 200 AI games without crashing or stalling', () => {
    const r = runSim(200);
    expect(r.crashes).toBe(0);
  });
  it('never cuts a deck below the floor', () => {
    const r = runSim(150);
    expect(r.smallestDeck).toBeGreaterThanOrEqual(MCD.DECK_FLOOR - 3); // HQ, Site Office and Crane leave the deck legitimately
    expect(r.crashes).toBe(0);
  });
  it('only finished towers collect rent', () => {
    const g = game(7);
    const p = g.players[0];
    p.plots[0].blocks.push({ key: 'office', type: 'O', look: 'glass', rev: 1, pts: 1, charms: [] });
    expect(MCD.grossRev(p)).toBe(0);
    p.plots[0].cap = MCD.CATALOG.flatroof && Object.assign({ uid: 1, key: 'flatroof', charms: [] }, MCD.CATALOG.flatroof);
    expect(MCD.grossRev(p)).toBe(1);
  });
  it('scores only finished towers', () => {
    const g = game(8);
    const p = g.players[0];
    p.plots[0].blocks.push(
      { key: 'condo', type: 'R', look: 'stone', rev: 0, pts: 2, charms: [] },
      { key: 'condo', type: 'R', look: 'stone', rev: 0, pts: 2, charms: [] }
    );
    expect(MCD.score(g, p).towers).toBe(0);
    p.plots[0].cap = Object.assign({ uid: 2, key: 'flatroof', charms: [] }, MCD.CATALOG.flatroof);
    const s = MCD.score(g, p);
    expect(s.towers).toBe(2 + 2 + 1 + 2); // floors + cap + uniform stone (+1 per floor)
  });
  it('retail only on the ground floor, nothing above a hotel', () => {
    const g = game(9);
    const p = g.players[0];
    p.plots[2].zone = 'open';
    p.plots[2].blocks.push({ key: 'studio', type: 'R', look: 'brick', rev: 1, pts: 1, charms: [] });
    const food = p.hand.find((c) => c.key === 'foodhall') || (p.hand[0] = Object.assign({ uid: 999, key: 'foodhall', charms: [] }, MCD.CATALOG.foodhall));
    g.turn = 0;
    g.phase = 'act';
    g.pending = [];
    p.money = 20;
    expect(MCD.canPlay(g, 0, food.uid, 2)).toMatch(/ground floor/);
    p.plots[2].blocks.push({ key: 'hotel', type: 'H', look: 'stone', rev: 0, pts: 2, charms: [] });
    const studio = Object.assign({ uid: 998, key: 'studio', charms: [] }, MCD.CATALOG.studio);
    p.hand.push(studio);
    expect(MCD.canPlay(g, 0, studio.uid, 2)).toMatch(/Hotel/);
  });
  it('the AI caps its sixth tower when it holds a cap and has the money', () => {
    let declined = 0,
      chances = 0;
    for (let i = 0; i < 120; i++) {
      const g = game(3000 + i, MCD.FIRMS[i % 3].id, MCD.FIRMS[(i + 1) % 3].id);
      let n = 200;
      while (!g.gameOver && n-- > 0) {
        if (g.turn === 1 && g.phase === 'act' && !g.pending.length) {
          const p = g.players[1];
          const caps = p.plots.filter((pl) => pl.cap).length;
          const can = p.hand.some((c) => c.kind === 'cap' && p.plots.some((pl, j) => MCD.canPlay(g, 1, c.uid, j) === true));
          if (caps === 5 && can) {
            chances++;
            MCD.aiTurn(g, 1);
            if (p.plots.filter((pl) => pl.cap).length === 5) declined++;
            continue;
          }
        }
        MCD.aiTurn(g, g.turn);
      }
    }
    expect(declined).toBe(0);
    expect(chances).toBeGreaterThan(0);
  });
  it('one-shot cards leave the game exactly once, even with an Expediter', () => {
    const g = game(11);
    const p = g.players[0];
    g.turn = 0;
    g.phase = 'act';
    g.pending = [];
    p.money = 20;
    const so = Object.assign({ uid: 777, key: 'siteoffice', charms: ['expedite'] }, MCD.CATALOG.siteoffice);
    p.hand.push(so);
    const before = MCD.deckTotal(p);
    expect(MCD.playCard(g, 0, so.uid, null)).toBe(true);
    expect(p.removed).toContain(so);
    expect(p.deck).not.toContain(so);
    expect(MCD.deckTotal(p)).toBe(before - 1);
    expect(p.opsBonus).toBe(1);
  });
  it('records a replayable game log with the real seed', () => {
    const g = MCD.newGame({ opponent: 'ai', version: 'test' });
    MCD.chooseFirm(g, 0, 'harlow');
    MCD.chooseFirm(g, 1, 'kessler');
    MCD.finishSetup(g);
    expect(g.settings.seed).toBeGreaterThan(0);
    playOut(g);
    const rec = MCD.gameRecord(g);
    expect(rec.version).toBe('test');
    expect(rec.seed).toBe(g.settings.seed);
    expect(rec.history.length).toBeGreaterThan(20);
    expect(rec.history.some((e) => e.t === 'cap')).toBe(true);
    expect(rec.ended).toBeTruthy();
    const again = MCD.newGame({ seed: rec.seed, opponent: 'ai' });
    MCD.chooseFirm(again, 0, 'harlow');
    MCD.chooseFirm(again, 1, 'kessler');
    MCD.finishSetup(again);
    playOut(again);
    expect(again.result.scores.map((s) => s.total)).toEqual(g.result.scores.map((s) => s.total));
  });
  it('the game ends the moment a sixth tower is capped', () => {
    const g = game(21);
    const p = g.players[0];
    g.turn = 0;
    g.phase = 'act';
    g.pending = [];
    p.money = 50;
    p.plots.forEach((pl) => {
      pl.blocks.push(
        { key: 'studio', type: 'R', look: 'brick', rev: 1, pts: 1, charms: [] },
        { key: 'studio', type: 'R', look: 'brick', rev: 1, pts: 1, charms: [] },
        { key: 'studio', type: 'R', look: 'brick', rev: 1, pts: 1, charms: [] }
      );
    });
    p.plots.slice(0, 5).forEach((pl) => {
      pl.cap = Object.assign({ uid: 900, key: 'flatroof', charms: [] }, MCD.CATALOG.flatroof);
    });
    const cap = Object.assign({ uid: 901, key: 'flatroof', charms: [] }, MCD.CATALOG.flatroof);
    p.hand.push(cap);
    expect(MCD.playCard(g, 0, cap.uid, 5)).toBe(true);
    expect(g.gameOver).toBe(true);
    expect(g.result.reason).toBe('complete');
    expect(g.result.scores[0].finisher).toBe(6);
  });
  it('every developer pack is a valid ten', () => {
    MCD.FIRMS.forEach((f) => expect(MCD.validPack(f, f.pack)).toBe(true));
  });
  it('every card referenced in decks exists in the catalogue', () => {
    const keys = new Set(Object.keys(MCD.CATALOG));
    [...MCD.BASE_DECK, ...MCD.STARTER, ...MCD.FIRMS.flatMap((f) => [...f.pack, ...f.collection])].forEach(([k]) => expect(keys.has(k), k).toBe(true));
  });
});
