// Rules of play: cards, economy, turn flow, scoring. Pure functions over a game object; no DOM, no timers.
import { makeRng, shuffle } from './rng.js';
import { countType, countLook, typeSet, neighbours, hasType, uniformLook, expand } from './board.js';
import { CATALOG, CHARMS, TIERS, ZONES, MAP_ZONES, BASE_DECK, STARTER, FIRMS, BOUNTIES, EVENTS, ONE_SHOT, BANK_RATE, TYPE_NAME, validPack } from './data.js';

export { countType, countLook, typeSet, neighbours, hasType, uniformLook, expand };

let UID = 1;
export function makeCard(key) {
  const c = Object.assign({ uid: UID++, key, charms: [] }, CATALOG[key]);
  return c;
}
export function hasCharm(c, k) {
  return !!(c.charms && c.charms.includes(k));
}
export function cardRev(c, tier) {
  return (c.rev || 0) + (c.charms || []).filter((k) => k === 'lease').length + (c.ps && c.ps.rev ? c.ps.rev * (tier || 0) : 0);
}
export function cardPts(c, tier) {
  const ch = c.charms || [];
  return (
    (c.pts || 0) +
    ch.filter((k) => k === 'architect').length +
    2 * ch.filter((k) => k === 'gilded').length +
    ch.filter((k) => k === 'tenured').length * (tier || 0) +
    (c.ps && c.ps.pts ? c.ps.pts * (tier || 0) : 0)
  );
}
// Effective height: Arcology Pods count double for cap requirements.
export function towerHeight(pl) {
  return pl.blocks.length + pl.blocks.filter((b) => b.key === 'arcology').length;
}
export function isGround(c) {
  return c.type === 'S' || !!c.ground;
}
// base prestige: finished-tower points with tier 0, so tiers do not feed themselves
export function basePrestige(p) {
  const t = p.tier;
  p.tier = 0;
  const v = p.plots.reduce((s, pl, i) => s + (pl.cap ? plotPts(p, i) + cardPts(pl.cap) + capBonus(pl, pl.cap, null) : 0), 0);
  p.tier = t;
  return v;
}
export function tierOf(prestige) {
  let t = 0;
  TIERS.forEach((x, i) => {
    if (prestige >= x.at) t = i;
  });
  return t;
}
export function refreshTier(p) {
  p.prestige = basePrestige(p);
  p.tier = tierOf(p.prestige);
  return p.tier;
}
export function blockRev(p, i, j) {
  const b = p.plots[i].blocks[j];
  let r = cardRev(b, p.tier);
  const nb = neighbours(p, i);
  if (j === 0 && p.tier >= 4 && p.plots[i].cap) r += 1; // Iconic
  if (b.type === 'S') r += nb.filter((n) => hasType(n, 'R')).length;
  if (b.type === 'O' && j === 0 && nb.some((n) => hasType(n, 'O'))) r += 1;
  if (b.type === 'C' && hasHq(p, 'hq_okafor')) r += 1;
  if (hasCharm(b, 'anchor') && p.plots[i].blocks.length > j + 1) r += 2;
  if (hasCharm(b, 'boardroom')) r += nb.filter((n) => hasType(n, 'O')).length;
  if (b.key === 'parking') r += Math.floor((p.plots[i].blocks.length - 1 - j) / 2);
  if (j === 0) r += nb.filter((n) => n.blocks.some((x) => x.key === 'streetmarket')).length;
  if (b.key === 'mirror' && j > 0) r += blockRev(p, i, j - 1);
  if (b.key === 'megamall') r += nb.reduce((a, n) => a + n.blocks.filter((x) => x.type === 'R').length, 0) - nb.filter((n) => hasType(n, 'R')).length;
  const above = p.plots[i].blocks[j + 1];
  if (b.type === 'S' && above && above.type === 'O') r += 1; // office workers shop downstairs
  if (b.key === 'bazaar') {
    let n = 0;
    (p.game ? p.game.players : [p]).forEach((q) => {
      n += countType(q, 'S');
    });
    r += n - 1;
  }
  return r;
}
export function blockPts(p, i, j) {
  const b = p.plots[i].blocks[j];
  let s = cardPts(b, p.tier);
  const nb = neighbours(p, i);
  if (b.type === 'H' && nb.some((n) => hasType(n, 'S'))) s += 2;
  if (b.type === 'R' && nb.some((n) => hasType(n, 'C'))) s += 1;
  if (b.type === 'O' && hasHq(p, 'hq_kessler')) s += 1;
  if (hasCharm(b, 'concierge')) s += j;
  if (hasCharm(b, 'super')) s += Math.min(3, p.plots[i].blocks.filter((x, k) => k !== j && x.type === 'R').length);
  if (b.key === 'datacenter') s -= nb.filter((n) => hasType(n, 'R')).length;
  if (b.key === 'loft' && typeSet(p.plots[i]).size >= 3) s += 2;
  if (b.key === 'lobby') s += Math.min(4, p.plots[i].blocks.length - 1 - j);
  if (b.key === 'mirror' && j > 0) s += blockPts(p, i, j - 1);
  if (b.type === 'R' && hasHq(p, 'designstudio')) s += 1;
  const pl = p.plots[i];
  if (pl.cap && b.look === 'stone' && hasHq(p, 'heritage')) s += 1;
  if (pl.cap && nb.some((n) => n.blocks.some((x) => x.key === 'skygarden'))) s += j === 0 ? 2 : 0; // once per tower, counted on the ground floor
  if (b.key === 'headline' && pl.cap && j === pl.blocks.length - 1) s += 3;
  const below = pl.blocks[j - 1];
  if (b.type === 'R' && below && below.type === 'S') s += 1; // homes over shops
  if (b.type === 'H' && below && below.type === 'O') s += 2; // conference trade
  if (b.type === 'R' && below && below.type === 'C') s += 1; // library downstairs
  if (b.key === 'cowork') s += pl.blocks.filter((x, k) => k !== j && x.type === 'O').length;
  if (b.key === 'community')
    s += Math.min(
      3,
      nb.reduce((a, n) => a + n.blocks.filter((x) => x.type === 'R').length, 0)
    );
  if (b.key === 'convention') s += pl.blocks.slice(0, j).filter((x) => x.type === 'O').length;
  return s;
}
export function plotIncome(p, i) {
  return p.plots[i].blocks.reduce((s, b, j) => s + blockRev(p, i, j), 0);
}
export function plotPts(p, i) {
  return p.plots[i].blocks.reduce((s, b, j) => s + blockPts(p, i, j), 0);
}
export function grossRev(p) {
  const s = p.game ? p.game.settings : {};
  const capPer = s.rentCapPerTower || 99;
  const v = p.plots.reduce((a, pl, i) => a + (pl.cap ? Math.min(capPer, plotIncome(p, i)) : 0), 0);
  return s.rentDiv ? Math.ceil(v / s.rentDiv) : v;
}
export function potentialRev(p) {
  return p.plots.reduce((s, pl, i) => s + plotIncome(p, i), 0);
}
export function grossPts(p) {
  return p.plots.reduce((s, pl, i) => s + plotPts(p, i), 0);
}
function g_base(p) {
  return p.game && p.game.settings.baseIncome != null ? p.game.settings.baseIncome : 2;
}
export function playerIncome(p) {
  return g_base(p) + grossRev(p) + p.opsBonus;
}
export function capCost(g, pl, p) {
  if (g.settings.freeBuilds || g.mods.freeCaps) return 0;
  const h = pl ? pl.blocks.length : 2;
  const stone = pl ? pl.blocks.filter((b) => b.look === 'stone').length : 0;
  return Math.max(1, (g.settings.capBase || 3) + Math.floor(Math.max(0, h - 2) / 2) - (p ? countType(p, 'C') : 0) - (p && p.tier >= 2 ? 1 : 0) - stone);
}
// Slot 1 holds the developer's signature HQ from the start; reputation opens more.
export function hqSlots(p) {
  return 2 + (p.tier >= 2 ? 1 : 0) + (p.tier >= 4 ? 1 : 0);
}
export function bankStars(p) {
  return Math.floor(p.money / (hasHq(p, 'treasury') ? 6 : BANK_RATE));
}
export function hasHq(p, k) {
  return p.hq.some((c) => c.key === k);
}
export function handSize(g, p) {
  return g.settings.handSize + (p.tier >= 3 ? 1 : 0);
}
export function marketSize(g, p) {
  return 3 + (p && p.tier >= 1 ? 1 : 0);
}

export function capBonus(pl, cap, game) {
  const h = pl.blocks.length;
  let b = (pl.zone === 'landmark' ? 3 : 0) + (uniformLook(pl) ? h : 0);
  switch (cap.key) {
    case 'garden':
      b = 2 * pl.blocks.filter((x) => x.type === 'R').length;
      break;
    case 'deck':
      b = h;
      break;
    case 'helipad':
      b = typeSet(pl).size === 1 ? 4 : 0;
      break;
    case 'skybridge':
      b = typeSet(pl).size >= 3 ? 3 : 0;
      break;
    case 'penthouse': {
      const t = pl.blocks[h - 1].type;
      b = t === 'H' || t === 'R' ? 3 : 0;
      break;
    }
    case 'rooftopbar': {
      if (!game) break;
      game.players.forEach((p) =>
        p.plots.forEach((o) => {
          b += o.blocks.filter((x) => x.type === 'H').length;
        })
      );
      break;
    }
    case 'landmark':
      b = 2 * h;
      break;
    case 'solar':
      b += pl.blocks.filter((x) => x.look === 'glass').length;
      break;
    case 'billboard': {
      if (!game) break;
      game.players.forEach((p) =>
        p.plots.forEach((o, i) => {
          if (o === pl) b += 2 * neighbours(p, i).filter((n) => hasType(n, 'S')).length;
        })
      );
      break;
    }
    case 'spire': {
      if (!game) break;
      const mine = h;
      let tallest = true;
      game.players.forEach((p) =>
        p.plots.forEach((o) => {
          if (o !== pl && o.cap && o.blocks.length >= mine) tallest = false;
        })
      );
      b = tallest ? 4 : 0;
      break;
    }
  }
  return b;
}

export function blockCost(g, c, pl, p) {
  if (g.settings.freeBuilds) return 0;
  let cost = c.cost + (g.mods.costDelta || 0) + (g.settings.costTune || 0);
  if (c.type === 'R') cost += g.mods.resDelta || 0;
  if (pl && pl.zone === 'transit') cost -= 1;
  if (pl && c.look !== 'glass') cost += Math.max(0, pl.blocks.length - 2); // every floor above the 3rd costs $1 more (Glass is exempt)
  if (p && c.type === 'R' && hasHq(p, 'hq_harlow')) cost -= 1;
  if (pl && pl.blocks.some((b) => b.key === 'atrium')) cost -= 1;
  if (hasCharm(c, 'foreman')) cost -= 1;
  if (p && c.look === 'glass' && hasHq(p, 'glassworks')) cost -= 1;
  return Math.max(0, cost);
}
// What placing this card on this plot would add right now (own value + adjacency effects on neighbours).
export function placementPreview(g, pi, uid, plotIdx) {
  const p = g.players[pi];
  const c = p.hand.find((x) => x.uid === uid);
  const pl = p.plots[plotIdx];
  if (!c || !pl) return null;
  if (c.kind === 'cap') return { rev: 0, pts: cardPts(c, p.tier) + capBonus(pl, c, g) };
  if (c.kind !== 'block') return null;
  const r0 = potentialRev(p),
    s0 = grossPts(p);
  pl.blocks.push({ key: c.key, type: c.type, look: c.look, rev: c.rev, pts: c.pts, ps: c.ps, charms: c.charms });
  const rev = potentialRev(p) - r0,
    pts = grossPts(p) - s0;
  pl.blocks.pop();
  return { rev, pts, cost: blockCost(g, c, pl, p) };
}

// --- Game creation ---
export function newGame(settings) {
  const seed = settings.seed || Math.floor(Math.random() * 1e9);
  const rng = makeRng(seed);
  const g = {
    settings: Object.assign({ freeBuilds: false, opponent: 'ai', handSize: 5, capMin: 3, maxHeight: 99, finisherBonus: 6 }, settings, { seed }),
    rng,
    round: 0,
    turn: 0,
    phase: 'setup',
    pending: [],
    log: [],
    history: [],
    version: settings.version || 'dev',
    players: [0, 1].map((i) => ({
      idx: i,
      name: i === 0 ? 'You' : settings.opponent === 'hotseat' ? 'Player 2' : 'Rival AI',
      firm: null,
      bounty: null,
      money: 5,
      deck: [],
      discard: [],
      hand: [],
      removed: [],
      plots: Array.from({ length: 6 }, () => ({ blocks: [], cap: null, zone: 'open', crane: false, builtThisTurn: 0 })),
      capBonus: 0,
      opsBonus: 0,
      prestige: 0,
      tier: 0,
      hq: [],
      buildsThisTurn: 0,
      extraDrafts: 0,
      charmedThisRound: false,
      noCap: false,
      incomePenalty: 0,
    })),
    communal: [],
    market: [],
    events: [],
    event: null,
    mods: {},
    endTriggeredBy: -1,
    gameOver: false,
    result: null,
    actions: [],
  };
  const early = shuffle(EVENTS.filter((e) => !e.late).slice(), rng).slice(0, 10),
    late = shuffle(EVENTS.filter((e) => e.late).slice(), rng).slice(0, 3);
  g.events = early.concat(late); // 10 of 14 early, 3 of 4 late = 13-round clock
  const zones = shuffle(MAP_ZONES.slice(), rng); // same map for both players
  g.players.forEach((p) => {
    p.game = g;
    p.deck = shuffle(expand(STARTER, makeCard), rng);
    p.plots.forEach((pl, i) => (pl.zone = zones[i]));
  });
  return g;
}

export function chooseFirm(g, pi, firmId, pack) {
  const f = FIRMS.find((x) => x.id === firmId);
  const p = g.players[pi];
  p.firm = f;
  if (f.hq && !p.hq.length) p.hq.push(makeCard(f.hq));
  const use = pack && validPack(f, pack) ? pack : f.pack;
  p.pack = use;
  g.communal.push(...expand(use, (k) => Object.assign(makeCard(k), { firm: f.id })));
}
export function finishSetup(g) {
  g.communal.push(...expand(BASE_DECK, makeCard));
  shuffle(g.communal, g.rng);
  g.market = g.communal.splice(0, 3);
  g.players.forEach((p) => {
    p.bountyOffer = shuffle(BOUNTIES.slice(), g.rng).slice(0, 2);
  });
  g.phase = 'play';
  startRound(g);
}
export function chooseBounty(g, pi, id) {
  const p = g.players[pi];
  p.bounty = p.bountyOffer.find((b) => b.id === id);
}

// --- Round / turn flow ---
export function startRound(g) {
  g.round += 1;
  if (g.round > g.events.length && g.endTriggeredBy < 0) {
    endGame(g, 'clock');
    return;
  }
  g.event =
    g.round > g.events.length
      ? { id: 'final', name: 'Final turn', text: 'The block is complete. One last turn, then scoring.', mods: {} }
      : g.events[g.round - 1];
  g.mods = Object.assign({}, g.event.mods || {});
  g.players.forEach((p) => (p.charmedThisRound = false));
  if (g.event.apply) g.event.apply(g);
  log(g, `Round ${g.round}: ${g.event.name}. ${g.event.text}`);
  record(g, 'event', null, { event: g.event.id });
  g.turn = 0;
  startTurn(g);
}
export function startTurn(g) {
  const p = cur(g);
  p.buildsThisTurn = 0;
  p.extraDrafts = 0;
  p.plots.forEach((pl) => (pl.builtThisTurn = 0));
  let inc = playerIncome(p);
  if (g.mods.noRent) inc = 2;
  inc = Math.max(0, inc - p.incomePenalty);
  p.incomePenalty = 0;
  p.money += inc;
  log(g, `${p.name} +${inc} income`);
  record(g, 'income', p.idx, { inc });
  const rolls = [];
  p.plots.forEach((pl, i) => {
    if (!pl.cap) return;
    pl.blocks.forEach((b) => {
      if (b.key === 'casino' && !g.mods.noRent) {
        const win = g.rng() < 0.5;
        if (win) p.money += 5;
        rolls.push({ plot: i, what: 'casino', roll: win ? 'heads' : 'tails', gain: win ? 5 : 0 });
      }
    });
  });
  if (rolls.length) {
    rolls.forEach((f) => log(g, `${p.name}'s Casino: ${f.roll}${f.gain ? ', +$' + f.gain : ''}`));
    record(g, 'rolls', p.idx, { rolls });
    g.actions.push({ pi: p.idx, kind: 'rolls', rolls });
  }
  const o = g.players[1 - p.idx];
  const nm = o.plots.reduce((a, pl) => a + (pl.cap ? pl.blocks.filter((b) => b.key === 'nightmarket').length : 0), 0);
  if (nm && !g.mods.noRent) {
    o.money += nm;
    log(g, `${o.name}'s Night Market earns $${nm} after hours`);
  }
  refreshTier(p);
  drawCards(g, p, handSize(g, p));
  if (g.mods.charm && !p.charmedThisRound && p.hand.length) {
    const keys = shuffle(Object.keys(CHARMS), g.rng).slice(0, 3);
    const prices = {};
    keys.forEach((k) => (prices[k] = 1 + Math.floor(g.rng() * 3)));
    g.pending.push({ type: 'charm', pi: p.idx, offer: keys, prices, price: 2 });
  }
  if (p.idx === 0 && !p.bounty && p.bountyOffer) g.pending.unshift({ type: 'bounty', pi: 0 });
  if (p.idx === 1 && !p.bounty && p.bountyOffer) g.pending.unshift({ type: 'bounty', pi: 1 });
  g.phase = 'act';
}
export const DECK_FLOOR = 8; // streamline never cuts a deck below this many cards in total
export function deckTotal(p) {
  return p.deck.length + p.discard.length + p.hand.length;
}
export function drawCards(g, p, n) {
  let reshuffled = false;
  for (let i = 0; i < n; i++) {
    if (!p.deck.length) {
      if (!p.discard.length) break;
      p.deck = shuffle(p.discard, g.rng);
      p.discard = [];
      reshuffled = true;
    }
    p.hand.push(p.deck.shift());
  }
  if (reshuffled) {
    // streamline: offer one cut from the cards still in the draw pile (never from the hand)
    if (deckTotal(p) > DECK_FLOOR && p.deck.length) {
      const opts = p.deck.slice(0, 3);
      g.pending.push({ type: 'remove', pi: p.idx, options: opts.map((c) => c.uid) });
      log(g, `${p.name} reshuffles. Streamline: remove one card.`);
    } else log(g, `${p.name} reshuffles. Deck is lean; no streamline.`);
  }
}
export function cur(g) {
  return g.players[g.turn];
}
export function opp(g) {
  return g.players[1 - g.turn];
}

// --- Actions ---
export function canPlay(g, pi, uid, plotIdx) {
  const p = g.players[pi];
  if (g.gameOver || g.turn !== pi || g.phase !== 'act' || g.pending.length) return 'wait';
  const c = p.hand.find((x) => x.uid === uid);
  if (!c) return 'no card';
  if (c.kind === 'block') {
    const pl = p.plots[plotIdx];
    if (!pl) return 'pick a plot';
    if (pl.cap) return 'capped';
    const h = pl.blocks.length,
      maxH = pl.zone === 'low' ? 3 : g.settings.maxHeight;
    if (h >= maxH) return pl.zone === 'low' ? 'height limit 3' : `max height ${maxH}`;
    if (h && pl.blocks[h - 1].type === 'H') return 'nothing builds above a Hotel';
    if (isGround(c) && h) return c.type === 'S' ? 'Retail only on the ground floor' : 'ground floor only';
    if (!h && pl.zone === 'resi' && c.type !== 'R' && !hasCharm(c, 'variance')) return 'ground floor must be Residential';
    if (!h && pl.zone === 'comm' && c.type !== 'O' && c.type !== 'S' && !hasCharm(c, 'variance')) return 'ground floor must be Office or Retail';
    const perTower = pl.crane && !g.mods.noCrane ? 2 : 1;
    if (pl.builtThisTurn >= perTower && !hasCharm(c, 'prefab'))
      return perTower === 1 ? 'tower in progress: 1 block per turn (a crane allows 2)' : 'crane limit: 2 blocks per turn';
    if (p.money < blockCost(g, c, pl, p)) return 'not enough money';
    return true;
  }
  if (c.kind === 'hq') {
    if (p.hq.length >= hqSlots(p)) return `HQ full (${hqSlots(p)} slot${hqSlots(p) > 1 ? 's' : ''}; reputation unlocks more)`;
    return true;
  }
  if (c.target === 'plot') {
    const pl = p.plots[plotIdx];
    if (!pl) return 'pick a tower';
    if (pl.cap) return 'already capped';
    if (c.key === 'crane' && pl.crane) return 'already has a crane';
    if (c.key === 'demolish' && !pl.blocks.length) return 'nothing to demolish';
    if (c.key === 'tunnel' && !pl.blocks.length) return 'pick a tower with floors';
    if (c.key === 'elevator' && !pl.builtThisTurn) return 'pick a tower that already took a floor this turn';
    return true;
  }
  if (c.kind === 'cap') {
    const pl = p.plots[plotIdx];
    if (!pl) return 'pick a plot';
    if (pl.cap) return 'already capped';
    if (p.noCap) return 'zoning challenge: no caps this turn';
    const need = pl.zone === 'landmark' ? Math.max(3, g.settings.capMin) : g.settings.capMin;
    if (towerHeight(pl) < need) return `needs ${need}+ blocks`;
    if (c.key === 'landmark' && towerHeight(pl) < 5) return 'Landmark Status needs 5+ floors';
    if (p.money < capCost(g, pl, p)) return `capping costs $${capCost(g, pl, p)}`;
    return true;
  }
  return true;
}
export function playCard(g, pi, uid, plotIdx) {
  const ok = canPlay(g, pi, uid, plotIdx);
  if (ok !== true) return ok;
  const p = g.players[pi];
  const c = p.hand.find((x) => x.uid === uid);
  p.hand = p.hand.filter((x) => x !== c);
  if (c.kind === 'block') {
    p.money -= blockCost(g, c, p.plots[plotIdx], p);
    // the card is a crew: it goes back to your discard and leaves a block token behind
    const token = {
      uid: UID++,
      key: c.key,
      name: c.name,
      kind: 'block',
      type: c.type,
      look: c.look,
      rev: c.rev,
      pts: c.pts,
      ps: c.ps,
      charms: c.charms.slice(),
      from: c.uid,
    };
    p.plots[plotIdx].blocks.push(token);
    p.buildsThisTurn++;
    p.plots[plotIdx].builtThisTurn++;
    if (hasCharm(c, 'expedite')) p.deck.unshift(c);
    else p.discard.push(c);
    // on-build effects (the lucky ones roll the game's seeded dice, so logs replay)
    const fx = [];
    if (hasCharm(c, 'grantwriter') && c.type === 'C') {
      p.money += 3;
      fx.push({ what: 'grantwriter', gain: 3 });
    }
    if (hasCharm(c, 'gambler')) {
      const win = g.rng() < 0.5;
      if (win) p.money += 4;
      fx.push({ what: 'gambler', roll: win ? 'heads' : 'tails', gain: win ? 4 : 0 });
    }
    if (c.key === 'lucky') {
      const roll = 1 + Math.floor(g.rng() * 6);
      const gain = roll <= 3 ? 2 : 5;
      p.money += gain;
      fx.push({ what: 'lucky', roll, gain });
    }
    fx.forEach((f) => log(g, `${p.name}: ${CATALOG[c.key].name} — ${f.roll != null ? 'rolls ' + f.roll + ', ' : ''}+$${f.gain}`));
    log(g, `${p.name} builds ${c.name} on plot ${plotIdx + 1}`);
    g.actions.push({ pi, kind: 'build', card: c, plot: plotIdx, fx });
    record(g, 'build', pi, { card: c.key, plot: plotIdx, cost: blockCost(g, c, p.plots[plotIdx], p), fx: fx.length ? fx : undefined });
    return true;
  }
  if (c.kind === 'cap') {
    p.money -= capCost(g, p.plots[plotIdx], p);
    p.plots[plotIdx].cap = c;
    refreshTier(p);
    if (hasHq(p, 'unionhall')) p.money += 3;
    g.actions.push({ pi, kind: 'cap', card: c, plot: plotIdx });
    record(g, 'cap', pi, { card: c.key, plot: plotIdx });
    if (p.plots.every((pl) => pl.cap) && g.endTriggeredBy < 0) {
      g.endTriggeredBy = pi;
      const o = g.players[1 - pi];
      log(g, `${p.name} completes the block! ${o.name} gets one final turn.`);
      record(g, 'blockComplete', pi, { finalTurnFor: o.idx });
    }
    log(g, `${p.name} caps plot ${plotIdx + 1} with ${c.name} (+${capBonus(p.plots[plotIdx], c, g) + cardPts(c)})`);
    return true;
  }
  if (c.kind === 'hq') {
    p.hq.push(c);
    log(g, `${p.name} opens ${c.name}`);
    g.actions.push({ pi, kind: 'hq', card: c });
    record(g, 'hq', pi, { card: c.key });
    return true;
  }
  // ops / interference. One-shot cards leave the game; the rest return to the deck (top, with an Expediter).
  if (ONE_SHOT.includes(c.key)) p.removed.push(c);
  else if (hasCharm(c, 'expedite')) p.deck.unshift(c);
  else p.discard.push(c);
  const o = g.players[1 - pi];
  if (c.kind === 'int' && hasHq(o, 'lobbyist')) {
    log(g, `${o.name}'s Lobbyist blocks ${c.name}`);
    g.actions.push({ pi, kind: 'play', card: c });
    return true;
  }
  switch (c.key) {
    case 'grant':
      p.money += 3 + p.tier;
      break;
    case 'permit':
      drawCards(g, p, 2);
      break;
    case 'siteoffice':
      p.opsBonus += 1;
      break;
    case 'presale': {
      const t = Math.max(0, ...p.plots.filter((pl) => !pl.cap).map((pl) => pl.blocks.length));
      p.money += t;
      break;
    }
    case 'poach': {
      if (o.discard.length && deckTotal(o) > DECK_FLOOR) {
        const t = o.discard.pop();
        delete t.firm;
        p.discard.push(t);
        log(g, `${p.name} poaches ${t.name}`);
      } else log(g, `${p.name}'s Poach finds nothing to take`);
      break;
    }
    case 'demolish': {
      const pl = p.plots[plotIdx];
      const b = pl.blocks.pop();
      p.money += 2;
      log(g, `${p.name} demolishes ${b.name} on plot ${plotIdx + 1}`);
      break;
    }
    case 'tunnel': {
      g.pending.push({ type: 'tunnel', pi, first: plotIdx, options: p.plots.map((pl, i) => i).filter((i) => i !== plotIdx) });
      break;
    }
    case 'survey': {
      g.communal.push(...g.market);
      shuffle(g.communal, g.rng);
      g.market = g.communal.splice(0, marketSize(g, p));
      break;
    }
    case 'headhunt':
      p.extraDrafts += 1;
      break;
    case 'audit':
      if (p.hand.length && deckTotal(p) > DECK_FLOOR) g.pending.push({ type: 'audit', pi, options: p.hand.map((x) => x.uid) });
      else log(g, `${p.name}'s deck is already lean`);
      break;
    case 'crane':
      p.plots[plotIdx].crane = true;
      break;
    case 'elevator':
      p.plots[plotIdx].builtThisTurn = 0;
      break;
    case 'windfall': {
      const roll = 1 + Math.floor(g.rng() * 6);
      p.money += roll;
      log(g, `${p.name} rolls ${roll} on Windfall`);
      g.lastRoll = roll;
      break;
    }
    case 'inspect':
      o.incomePenalty += 2;
      break;
    case 'zoning':
      o.noCap = true;
      break;
  }
  log(g, `${p.name} plays ${c.name}`);
  const roll = c.key === 'windfall' ? g.lastRoll : undefined;
  g.actions.push({ pi, kind: 'play', card: c, plot: plotIdx, roll });
  record(g, 'play', pi, { card: c.key, plot: plotIdx, roll });
  return true;
}
// Subcontract: discard a block card from hand, pay $1, draw a card. The way out of a full board.
export function subcontract(g, pi, uid) {
  const p = g.players[pi];
  if (g.gameOver || g.turn !== pi || g.phase !== 'act' || g.pending.length) return 'wait';
  const c = p.hand.find((x) => x.uid === uid);
  if (!c) return 'no card';
  if (c.kind !== 'block') return 'only block crews can be subcontracted';
  if (p.money < 1) return 'costs $1';
  p.money -= 1;
  p.hand = p.hand.filter((x) => x !== c);
  p.discard.push(c);
  drawCards(g, p, 1);
  log(g, `${p.name} subcontracts ${c.name}`);
  g.actions.push({ pi, kind: 'sub', card: c });
  record(g, 'sub', pi, { card: c.key });
  return true;
}
export function anyLegalPlay(g, pi) {
  const p = g.players[pi];
  return p.hand.some((c) =>
    c.kind === 'block' || c.kind === 'cap' || c.target === 'plot'
      ? p.plots.some((pl, i) => canPlay(g, pi, c.uid, i) === true)
      : canPlay(g, pi, c.uid, null) === true
  );
}
export function endTurn(g, pi) {
  if (g.gameOver || g.turn !== pi || g.phase !== 'act' || g.pending.length) return false;
  const p = cur(g);
  if (p.plots.every((pl) => pl.cap)) {
    // the block is finished: nothing left to build, so no draft
    finishTurn(g);
    return true;
  }
  while (g.market.length < marketSize(g, p) && g.communal.length) g.market.push(g.communal.shift()); // Noticed: see 4
  g.phase = 'draft';
  g.pending.push({ type: 'draft', pi });
  for (let i = 0; i < p.extraDrafts; i++) g.pending.push({ type: 'draft', pi });
  return true;
}
// Which cards a specialist can join.
export function charmFits(k, c) {
  const f = CHARMS[k].for;
  if (f === 'any') return true;
  if (f === 'block') return c.kind === 'block' ? true : 'joins floor crews only';
  if (f === 'cap') return c.kind === 'cap' ? true : 'joins caps only';
  return c.kind === 'block' && c.type === f ? true : `joins ${TYPE_NAME[f]} floors only`;
}
export function resolve(g, req, choiceUid) {
  const p = g.players[req.pi];
  const idx = g.pending.indexOf(req);
  if (idx < 0) return false;
  switch (req.type) {
    case 'bounty':
      chooseBounty(g, req.pi, choiceUid);
      record(g, 'bounty', req.pi, { bounty: choiceUid });
      break;
    case 'charm': {
      if (!p.hand.length) break;
      const ch = choiceUid;
      if (!ch) {
        p.charmedThisRound = true;
        break;
      }
      const c = p.hand.find((x) => x.uid === ch.card);
      if (!c || !req.offer.includes(ch.charm)) return false;
      if (charmFits(ch.charm, c) !== true) return false;
      const price = req.prices ? req.prices[ch.charm] : req.price;
      if (p.money < price) return false;
      p.money -= price;
      c.charms.push(ch.charm);
      p.charmedThisRound = true;
      log(g, `${p.name} hires ${CHARMS[ch.charm].name} for ${c.name}`);
      g.actions.push({ pi: req.pi, kind: 'charm', card: c, charm: ch.charm });
      record(g, 'charm', req.pi, { card: c.key, charm: ch.charm });
      break;
    }
    case 'remove': {
      const c = p.deck.find((x) => x.uid === choiceUid);
      if (!c) return false;
      p.deck = p.deck.filter((x) => x !== c);
      p.removed.push(c);
      log(g, `${p.name} removes ${c.name}`);
      record(g, 'cut', req.pi, { card: c.key });
      break;
    }
    case 'audit': {
      const c = p.hand.find((x) => x.uid === choiceUid);
      if (!c) return false;
      p.hand = p.hand.filter((x) => x !== c);
      p.removed.push(c);
      break;
    }
    case 'tunnel': {
      const j = choiceUid;
      if (!req.options.includes(j)) return false;
      const a = p.plots[req.first],
        b = p.plots[j];
      const za = a.zone,
        zb = b.zone;
      p.plots[req.first] = b;
      p.plots[j] = a;
      b.zone = za;
      a.zone = zb;
      log(g, `${p.name} tunnels: swaps plots ${req.first + 1} and ${j + 1}`);
      break;
    }
    case 'draft': {
      if (choiceUid === 'buyroof') {
        if (p.money < 5) return false;
        p.money -= 5;
        const c = makeCard('flatroof');
        p.discard.push(c);
        log(g, `${p.name} buys a Flat Roof`);
        g.actions.push({ pi: req.pi, kind: 'draft', card: c });
        record(g, 'buyroof', req.pi, {});
        break;
      }
      if (!g.market.length) break;
      const c = g.market.find((x) => x.uid === choiceUid);
      if (!c) return false;
      g.market = g.market.filter((x) => x !== c);
      while (g.market.length < 3 && g.communal.length) g.market.push(g.communal.shift());
      p.discard.push(c);
      if (hasHq(p, 'pressoffice')) p.money += 1;
      log(g, `${p.name} drafts ${c.name}`);
      g.actions.push({ pi: req.pi, kind: 'draft', card: c });
      record(g, 'draft', req.pi, { card: c.key, from: c.firm || 'base', market: g.market.map((m) => m.key) });
      break;
    }
  }
  g.pending.splice(idx, 1);
  if (g.phase === 'draft' && !g.pending.some((r) => r.type === 'draft')) finishTurn(g);
  return true;
}
export function finishTurn(g) {
  const p = cur(g);
  p.discard.push(...p.hand);
  p.hand = [];
  p.noCap = false;
  record(g, 'endTurn', p.idx, {});
  if (g.endTriggeredBy >= 0 && g.endTriggeredBy !== p.idx) {
    endGame(g, 'complete');
    return;
  }
  if (g.turn === 0) {
    g.turn = 1;
    startTurn(g);
  } else {
    startRound(g);
  }
}

// --- Scoring ---
// Scoring v0.5: only finished towers count. Towers + bounty + finisher bonus. Per-tower detail for the breakdown view.
export function score(g, p) {
  refreshTier(p);
  const s = { towers: 0, bounty: 0, finisher: 0, bank: 0, total: 0, detail: [] };
  p.plots.forEach((pl, i) => {
    const floors = pl.blocks.reduce((a, b) => a + cardPts(b, p.tier), 0);
    const adj = plotPts(p, i) - floors;
    const cap = pl.cap ? cardPts(pl.cap, p.tier) + capBonus(pl, pl.cap, g) + p.capBonus : 0;
    const total = pl.cap ? floors + adj + cap : 0;
    s.detail.push({ plot: i + 1, zone: pl.zone, height: pl.blocks.length, capped: !!pl.cap, capName: pl.cap ? pl.cap.name : null, floors, adj, cap, total });
    s.towers += total;
  });
  if (p.bounty && p.bounty.check(p)) s.bounty = p.bounty.pts;
  if (g.endTriggeredBy === p.idx) s.finisher = g.settings.finisherBonus;
  s.bank = bankStars(p);
  s.total = s.towers + s.bounty + s.finisher + s.bank;
  return s;
}
// The final (rebuttal) turn: the block is complete and the other player is taking their last turn.
export function isFinalTurn(g) {
  return !g.gameOver && g.endTriggeredBy >= 0 && g.turn !== g.endTriggeredBy;
}
export function endGame(g, reason) {
  g.gameOver = true;
  g.phase = 'over';
  g.pending = [];
  const sc = g.players.map((p) => score(g, p));
  const winner = sc[0].total === sc[1].total ? -1 : sc[0].total > sc[1].total ? 0 : 1;
  g.result = { reason, scores: sc, winner };
  record(g, 'end', null, { reason, totals: sc.map((s) => s.total), winner });
  log(g, `Game over (${reason}). ${sc[0].total} to ${sc[1].total}.`);
}
export function log(g, m) {
  g.log.push(m);
  if (g.log.length > 60) g.log.shift();
}
// Structured history: enough to analyse a game (and, later, replay it). Human choices and AI choices look the same.
export function record(g, type, pi, data) {
  const p = pi != null ? g.players[pi] : null;
  g.history.push(Object.assign({ r: g.round, pi, t: type }, data, p ? { $: p.money, star: p.prestige } : {}));
}
export function gameRecord(g) {
  return {
    version: g.version,
    seed: g.settings.seed,
    settings: g.settings,
    opponent: g.settings.opponent,
    ended: g.result ? g.result.reason : null,
    rounds: g.round,
    developers: g.players.map((p) => ({ name: p.name, firm: p.firm ? p.firm.id : null, pack: p.pack, bounty: p.bounty ? p.bounty.id : null })),
    zones: g.players[0].plots.map((pl) => pl.zone),
    events: g.events.map((e) => e.id),
    history: g.history,
    final: g.players.map((p) => ({
      money: p.money,
      prestige: p.prestige,
      tier: p.tier,
      hq: p.hq.map((c) => c.key),
      towers: p.plots.map((pl) => ({ zone: pl.zone, floors: pl.blocks.map((b) => b.key), cap: pl.cap ? pl.cap.key : null })),
      deck: deckTotal(p),
      removed: p.removed.map((c) => c.key),
    })),
    scores: g.result ? g.result.scores.map((s) => ({ towers: s.towers, bounty: s.bounty, finisher: s.finisher, bank: s.bank, total: s.total })) : null,
    winner: g.result ? g.result.winner : null,
  };
}
