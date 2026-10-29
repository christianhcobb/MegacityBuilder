// Greedy heuristic opponent. Reads the public game state and calls the same rules functions a human would.
import {
  canPlay,
  playCard,
  endTurn,
  resolve,
  subcontract,
  anyLegalPlay,
  capBonus,
  capCost,
  cardRev,
  cardPts,
  plotIncome,
  plotPts,
  placementPreview,
  grossRev,
  hqSlots,
  charmFits,
  isGround,
} from './rules.js';

// --- AI (greedy heuristic) ---
export function cardValue(c, p, g) {
  const left = Math.max(2, g ? g.events.length - g.round : 10);
  if (c.kind === 'block') {
    let v = cardRev(c) * Math.min(left, 6) * 0.5 + cardPts(c) - (c.cost || 0) * 0.3;
    if (c.type === 'C') v += 1.5;
    if (c.text) v += 1; // special floors are usually worth more than their printed numbers
    if (c.key === 'casino') v += 2;
    if (p && isGround(c)) {
      // ground-only floors need an empty plot; without one they are dead cards
      const empty = p.plots.filter((pl) => !pl.blocks.length && !pl.cap).length;
      if (!empty) v = Math.min(v, 0.2);
      else if (empty === 1) v *= 0.7;
    }
    return v;
  }
  if (c.kind === 'cap') {
    let best = 1;
    if (p)
      p.plots.forEach((pl, i) => {
        if (!pl.cap && pl.blocks.length >= 2) best = Math.max(best, capBonus(pl, c, g) + cardPts(c) + plotPts(p, i) * 0.5);
      });
    const waiting = p ? p.plots.filter((pl) => !pl.cap && pl.blocks.length >= 2).length : 0;
    const held = p ? p.hand.concat(p.deck, p.discard).filter((x) => x.kind === 'cap').length : 0;
    return best + 1.5 + Math.max(0, waiting - held) * 1.5;
  }
  if (c.kind === 'hq') return p && p.hq.length < hqSlots(p) ? 4 : 1;
  return (
    {
      grant: 3,
      permit: 3.5,
      crane: 3,
      siteoffice: left > 6 ? 4 : 1.5,
      survey: 1.5,
      headhunt: 3,
      audit: 2,
      inspect: 2.5,
      zoning: 2,
      presale: 2.5,
      poach: 2,
      demolish: 0.5,
      tunnel: 0.5,
      elevator: 2,
      windfall: 3,
    }[c.key] || 1
  );
}
export function aiAct(g, pi) {
  const p = g.players[pi];
  let guard = 40;
  while (guard-- > 0) {
    let best = null;
    const capped = p.plots.filter((pl) => pl.cap).length;
    const racing = capped >= 4 || g.round >= g.events.length - 4 || g.endTriggeredBy >= 0;
    p.hand.forEach((c) => {
      if (c.kind === 'hq') {
        if (canPlay(g, pi, c.uid, null) === true) {
          const v = 4;
          if (!best || v > best.v) best = { c, v, plot: null };
        }
      } else if (c.target === 'plot') {
        if (c.key !== 'crane' && c.key !== 'elevator') return; // AI does not use demolish/tunnel yet
        p.plots.forEach((pl, i) => {
          if (canPlay(g, pi, c.uid, i) !== true) return;
          let v = pl.blocks.length >= 1 && pl.blocks.length <= 2 ? 3.5 : 1;
          if (c.key === 'elevator') v = p.hand.some((x) => x.kind === 'block' && x.uid !== c.uid) ? 2.5 : -1;
          if (!best || v > best.v) best = { c, v, plot: i };
        });
      } else if (c.kind === 'ops' || c.kind === 'int') {
        if (c.key === 'survey' && g.market.reduce((a, m) => a + cardValue(m, p, g), 0) > 9) return;
        if (c.key === 'audit' && p.hand.length < 3) return;
        const v = cardValue(c, p, g);
        if (!best || v > best.v) best = { c, v, plot: null };
      } else if (c.kind === 'cap') {
        p.plots.forEach((pl, i) => {
          if (canPlay(g, pi, c.uid, i) !== true) return;
          const bonus = capBonus(pl, c, g) + cardPts(c);
          const h = pl.blocks.length;
          const left = Math.max(1, g.events.length - g.round);
          // capping banks the tower's floor points (unfinished towers score 0) and starts its rent
          const banked = plotPts(p, i);
          let v = bonus + banked * 0.6 + plotIncome(p, i) * Math.min(left, 8) * 0.35 + (racing ? 5 : 0) + (h >= 3 ? 1 : -1);
          if (!racing && h < 3 && bonus < 3) v -= 2;
          if (left <= 3) v += banked * 0.4; // the clock is ending: bank everything
          if (p.money < capCost(g, pl, p) + 2) v -= 1;
          if (!best || v > best.v) best = { c, v, plot: i };
        });
      } else {
        p.plots.forEach((pl, i) => {
          if (canPlay(g, pi, c.uid, i) !== true) return;
          const h = pl.blocks.length;
          const pv = placementPreview(g, pi, c.uid, i);
          const left = Math.max(2, g.events.length - g.round);
          const capsInHand = p.hand.filter((x) => x.kind === 'cap').length;
          let v = pv.rev * Math.min(left, 6) * 0.35 + pv.pts * 0.8 - pv.cost * 0.35;
          if (c.type === 'C') v += 1.5;
          if (h >= 1 && h <= 2) v += 1.5; // stack to cappable height
          if (h === 0 && p.plots.filter((x) => x.blocks.length).length >= 4) v -= 1; // don't sprawl early
          if (c.type === 'H') v -= pl.zone === 'landmark' && h < 2 ? 3 : h < 1 ? 2 : 0; // hotel ends the tower
          if (h >= 4 && !capsInHand) v -= (h - 3) * 1.5; // don't build a skyscraper you cannot finish
          if (left <= 3 && !capsInHand) v -= 3; // too late to start something new
          if (racing && h >= 3) v -= 2; // stop stacking, cap instead
          if (!best || v > best.v) best = { c, v, plot: i };
        });
      }
    });
    if (!best || best.v < 0.5) {
      const blk = p.hand.find((c) => c.kind === 'block');
      if (blk && p.money >= 2 && !anyLegalPlay(g, pi) && guard > 30) {
        subcontract(g, pi, blk.uid);
        continue;
      }
      break;
    }
    const r = playCard(g, pi, best.c.uid, best.plot);
    if (r !== true) break;
    aiResolvePending(g, pi);
  }
}
export function aiResolvePending(g, pi) {
  let guard = 20;
  while (g.pending.length && g.pending[0].pi === pi && guard-- > 0) {
    const req = g.pending[0];
    const p = g.players[pi];
    let pick;
    switch (req.type) {
      case 'bounty':
        pick = p.bountyOffer[Math.floor(g.rng() * 2)].id;
        break;
      case 'charm': {
        // best (card, charm) pair the AI can afford: card value × charm weight
        const w = {
          lease: 3,
          architect: 3,
          foreman: 2,
          variance: 1,
          expedite: 2.5,
          anchor: 3,
          concierge: 3,
          boardroom: 2,
          super: 3,
          grantwriter: 3,
          prefab: 1.5,
          gilded: 3,
          tenured: 2.5,
          gambler: 2,
        };
        let bestPair = null;
        p.hand.forEach((c) => {
          const cv = cardValue(c, p, g);
          req.offer.forEach((k) => {
            const price = req.prices ? req.prices[k] : req.price;
            if (p.money < price + 3 || charmFits(k, c) !== true) return;
            const v = cv * (w[k] || 1) - price;
            if (!bestPair || v > bestPair.v) bestPair = { card: c.uid, charm: k, v };
          });
        });
        pick = bestPair && bestPair.v > 3 ? { card: bestPair.card, charm: bestPair.charm } : null;
        break;
      }
      case 'tunnel':
        pick = req.options[0];
        break;
      case 'remove':
      case 'audit': {
        const cards = req.options.map((u) => p.deck.find((c) => c.uid === u) || p.hand.find((c) => c.uid === u)).filter(Boolean);
        pick = cards.sort((a, b) => cardValue(a, p, g) - cardValue(b, p, g))[0].uid;
        break;
      }
      case 'draft': {
        if (!g.market.length) {
          pick = null;
          break;
        }
        const capsHeld = p.hand.concat(p.deck, p.discard).filter((x) => x.kind === 'cap').length,
          waiting = p.plots.filter((pl) => !pl.cap && pl.blocks.length >= 2).length;
        const tall = p.plots.filter((pl) => !pl.cap && pl.blocks.length >= 3).length;
        if (p.money >= 12 && capsHeld === 0 && tall > 0 && !g.market.some((m) => m.kind === 'cap')) {
          pick = 'buyroof';
          break;
        }
        const o = g.players[1 - pi];
        pick = g.market.slice().sort((a, b) => cardValue(b, p, g) + 0.4 * cardValue(b, o, g) - (cardValue(a, p, g) + 0.4 * cardValue(a, o, g)))[0].uid;
        break;
      }
    }
    resolve(g, req, pick);
  }
}
export function aiTurn(g, pi) {
  if (g.gameOver || g.turn !== pi) return;
  aiResolvePending(g, pi);
  if (g.phase === 'act') {
    aiAct(g, pi);
    endTurn(g, pi);
  }
  aiResolvePending(g, pi);
}
