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
  it('a sixth cap gives the rival one final turn, then the game ends', () => {
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
    expect(g.gameOver).toBe(false);
    expect(g.endTriggeredBy).toBe(0);
    const pass = (pi) => {
      MCD.endTurn(g, pi);
      while (g.pending.length) MCD.resolve(g, g.pending[0], g.market[0] ? g.market[0].uid : null);
    };
    pass(0);
    expect(MCD.isFinalTurn(g)).toBe(true);
    expect(g.turn).toBe(1);
    pass(1);
    expect(g.gameOver).toBe(true);
    expect(g.result.reason).toBe('complete');
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

  it('banked money scores 1★ per $10 (Treasury: per $6)', () => {
    const g = game(31);
    const p = g.players[0];
    p.money = 25;
    expect(MCD.bankStars(p)).toBe(2);
    p.hq.push(Object.assign({ uid: 950, key: 'treasury', charms: [] }, MCD.CATALOG.treasury));
    expect(MCD.bankStars(p)).toBe(4);
  });
  it('a developer starts with their signature HQ installed and one open slot', () => {
    const g = game(32);
    const p = g.players[0];
    expect(p.hq.length).toBe(1);
    expect(p.hq[0].signature).toBe(true);
    expect(MCD.hqSlots(p)).toBe(2);
  });
  it('specialists only join the cards they are for', () => {
    const block = { kind: 'block', type: 'S' };
    expect(MCD.charmFits('anchor', block)).toBe(true);
    expect(MCD.charmFits('concierge', block)).not.toBe(true);
    expect(MCD.charmFits('gilded', { kind: 'cap' })).toBe(true);
    expect(MCD.charmFits('gilded', block)).not.toBe(true);
    expect(MCD.charmFits('expedite', { kind: 'ops' })).toBe(true);
  });
  it('a finished block stops drafting', () => {
    const g = game(33);
    const p = g.players[0];
    g.turn = 0;
    g.phase = 'act';
    g.pending = [];
    p.plots.forEach((pl) => {
      pl.blocks.push({ key: 'studio', type: 'R', look: 'brick', rev: 1, pts: 1, charms: [] });
      pl.cap = Object.assign({ uid: 960, key: 'flatroof', charms: [] }, MCD.CATALOG.flatroof);
    });
    const before = MCD.deckTotal(p);
    expect(MCD.endTurn(g, 0)).toBe(true);
    expect(g.pending.some((r) => r.type === 'draft')).toBe(false);
    expect(g.turn).toBe(1);
    expect(MCD.deckTotal(p)).toBe(before);
  });
  it('ground-only floors need an empty plot; Mirror Hall copies the floor below', () => {
    const g = game(34);
    const p = g.players[0];
    g.turn = 0;
    g.phase = 'act';
    g.pending = [];
    p.money = 50;
    p.plots.forEach((pl) => (pl.zone = 'open'));
    const lobby = Object.assign({ uid: 970, key: 'lobby', charms: [] }, MCD.CATALOG.lobby);
    const mirror = Object.assign({ uid: 971, key: 'mirror', charms: [] }, MCD.CATALOG.mirror);
    p.hand.push(lobby, mirror);
    expect(MCD.playCard(g, 0, lobby.uid, 0)).toBe(true);
    const lobby2 = Object.assign({ uid: 972, key: 'lobby', charms: [] }, MCD.CATALOG.lobby);
    p.hand.push(lobby2);
    expect(MCD.canPlay(g, 0, lobby2.uid, 0)).not.toBe(true);
    p.plots[0].builtThisTurn = 0;
    expect(MCD.playCard(g, 0, mirror.uid, 0)).toBe(true);
    // lobby: 1★ +1 per floor above (mirror) = 2; mirror copies 2 → tower 4★
    expect(MCD.plotPts(p, 0)).toBe(4);
  });
});
