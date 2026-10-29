// Meta tool: what wins? AI vs AI with random developers and random packs, then per-card, per-charm,
// per-developer and per-bounty win rates. `npm run meta -- 2000` writes docs/meta.md and prints a summary.
import { writeFileSync } from 'node:fs';
import { MCD } from '../engine/index.js';
import { makeRng } from '../engine/rng.js';

const N = parseInt(process.argv[2] || '1500', 10);

// A random legal pack from a developer's collection (seeded).
export function randomPack(f, rng) {
  const pool = [];
  f.collection.forEach(([k, n]) => {
    for (let i = 0; i < n; i++) pool.push(k);
  });
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const take = pool.slice(0, MCD.PACK_SIZE);
  const m = {};
  take.forEach((k) => (m[k] = (m[k] || 0) + 1));
  return Object.entries(m);
}

function tally(map, key, won) {
  const t = map[key] || (map[key] = { n: 0, w: 0 });
  t.n++;
  if (won) t.w++;
}

export function runMeta(n = N) {
  const rng = makeRng(777);
  const cards = {}; // key -> {n: games where this player had it in deck at end, w: wins}
  const drafted = {}; // key -> times drafted from the market
  const passed = {}; // key -> times seen in a market and not taken
  const charms = {};
  const hq = {};
  const devs = {};
  const matchups = {};
  const bounties = {};
  const caps = {};
  const score = { towers: [], bounty: [], finisher: [], bank: [], money: [] };
  const tiers = [0, 0, 0, 0, 0];
  const deckSize = [];
  let games = 0,
    crashes = 0;
  for (let i = 0; i < n; i++) {
    try {
      const a = Math.floor(rng() * 3);
      let b = Math.floor(rng() * 3);
      if (b === a) b = (a + 1) % 3;
      const g = MCD.newGame({ seed: 50000 + i, opponent: 'ai' });
      MCD.chooseFirm(g, 0, MCD.FIRMS[a].id, randomPack(MCD.FIRMS[a], rng));
      MCD.chooseFirm(g, 1, MCD.FIRMS[b].id, randomPack(MCD.FIRMS[b], rng));
      MCD.finishSetup(g);
      let guard = 200;
      while (!g.gameOver && guard-- > 0) MCD.aiTurn(g, g.turn);
      if (!g.gameOver) {
        crashes++;
        continue;
      }
      games++;
      const w = g.result.winner;
      g.players.forEach((p, pi) => {
        const won = w === pi;
        // every card the player had at any point: deck, cut, HQ, and what is standing on the block
        const inDeck = new Set(p.deck.concat(p.discard, p.hand, p.removed, p.hq).map((c) => c.key));
        p.plots.forEach((pl) => {
          pl.blocks.forEach((bl) => inDeck.add(bl.key));
          if (pl.cap) inDeck.add(pl.cap.key);
        });
        inDeck.forEach((k) => tally(cards, k, won));
        p.hq.forEach((c) => tally(hq, c.key, won));
        p.plots.forEach((pl) => {
          if (pl.cap) tally(caps, pl.cap.key, won);
          pl.blocks.forEach((bl) => bl.charms.forEach((k) => tally(charms, k, won)));
        });
        p.deck.concat(p.discard, p.hand).forEach((c) => c.charms.forEach((k) => tally(charms, k, won)));
        tally(devs, p.firm.id, won);
        if (p.bounty) tally(bounties, p.bounty.id + (p.bounty.check(p) ? ' ✓' : ' ✗'), won);
        const s = g.result.scores[pi];
        score.towers.push(s.towers);
        score.bounty.push(s.bounty);
        score.finisher.push(s.finisher);
        score.bank.push(s.bank);
        score.money.push(p.money);
        tiers[p.tier]++;
        deckSize.push(MCD.deckTotal(p));
      });
      tally(matchups, `${g.players[0].firm.id} (first) vs ${g.players[1].firm.id}`, w === 0);
      g.history.forEach((e) => {
        if (e.t === 'draft') {
          drafted[e.card] = (drafted[e.card] || 0) + 1;
          (e.market || []).forEach((k) => (passed[k] = (passed[k] || 0) + 1));
        }
      });
    } catch (e) {
      crashes++;
      if (crashes <= 3) console.error('seed', 50000 + i, e.stack.split('\n').slice(0, 3).join(' | '));
    }
  }
  const avg = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : 0);
  const rows = (map, min) =>
    Object.entries(map)
      .filter(([, t]) => t.n >= (min || 1))
      .map(([k, t]) => ({ key: k, n: t.n, win: +(t.w / t.n).toFixed(2) }))
      .sort((x, y) => y.win - x.win);
  return {
    games,
    crashes,
    avgScore: { towers: avg(score.towers), bounty: avg(score.bounty), finisher: avg(score.finisher), bank: avg(score.bank), moneyAtEnd: avg(score.money) },
    tiersReached: tiers,
    avgDeck: avg(deckSize),
    developers: rows(devs),
    matchups: rows(matchups),
    cards: rows(cards, 20).map((r) => Object.assign(r, { drafted: drafted[r.key] || 0, passed: passed[r.key] || 0, name: MCD.CATALOG[r.key].name })),
    caps: rows(caps, 10).map((r) => Object.assign(r, { name: MCD.CATALOG[r.key].name })),
    charms: rows(charms).map((r) => Object.assign(r, { name: MCD.CHARMS[r.key].name })),
    hq: rows(hq).map((r) => Object.assign(r, { name: MCD.CATALOG[r.key].name })),
    bounties: rows(bounties),
  };
}

export function metaMarkdown(m, version) {
  const t = (rows, cols) =>
    `| ${cols.map((c) => c[0]).join(' | ')} |\n|${cols.map(() => '---').join('|')}|\n` +
    rows.map((r) => `| ${cols.map((c) => r[c[1]]).join(' | ')} |`).join('\n');
  const L = [];
  L.push(
    `# Meta report — v${version}`,
    '',
    `${m.games} AI-vs-AI games, random developers and random legal packs. "win" is the win rate of players who had the thing. 0.50 is neutral. The AI is greedy, so treat this as "what the greedy line finds", not human meta.`,
    ''
  );
  L.push(
    '## Score make-up (average per player)',
    '',
    t(
      [m.avgScore],
      [
        ['towers', 'towers'],
        ['bounty', 'bounty'],
        ['finisher', 'finisher'],
        ['bank', 'bank'],
        ['money at end', 'moneyAtEnd'],
      ]
    ),
    ''
  );
  L.push(`Reputation tiers reached (Unknown → Iconic): ${m.tiersReached.join(' / ')}. Average deck at end: ${m.avgDeck}.`, '');
  L.push(
    '## Developers',
    '',
    t(m.developers, [
      ['developer', 'key'],
      ['games', 'n'],
      ['win', 'win'],
    ]),
    ''
  );
  L.push(
    '## Matchups (win rate of the first player)',
    '',
    t(m.matchups, [
      ['matchup', 'key'],
      ['games', 'n'],
      ['first wins', 'win'],
    ]),
    ''
  );
  L.push(
    '## Cards (ever in the deck)',
    '',
    t(m.cards, [
      ['card', 'name'],
      ['decks', 'n'],
      ['win', 'win'],
      ['drafted', 'drafted'],
      ['passed', 'passed'],
    ]),
    ''
  );
  L.push(
    '## Caps used',
    '',
    t(m.caps, [
      ['cap', 'name'],
      ['used', 'n'],
      ['win', 'win'],
    ]),
    ''
  );
  L.push(
    '## Charms hired',
    '',
    t(m.charms, [
      ['charm', 'name'],
      ['hired', 'n'],
      ['win', 'win'],
    ]),
    ''
  );
  L.push(
    '## HQs',
    '',
    t(m.hq, [
      ['hq', 'name'],
      ['installed', 'n'],
      ['win', 'win'],
    ]),
    ''
  );
  L.push(
    '## Bounties (✓ hit, ✗ missed)',
    '',
    t(m.bounties, [
      ['bounty', 'key'],
      ['picked', 'n'],
      ['win', 'win'],
    ]),
    ''
  );
  return L.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const m = runMeta(N);
  const version = JSON.parse(await import('node:fs').then((f) => f.readFileSync('package.json', 'utf8'))).version;
  writeFileSync('docs/meta.md', metaMarkdown(m, version));
  console.log(JSON.stringify({ games: m.games, crashes: m.crashes, avgScore: m.avgScore, tiers: m.tiersReached, developers: m.developers }, null, 1));
  console.log(
    'top cards',
    m.cards
      .slice(0, 8)
      .map((c) => `${c.name} ${c.win}`)
      .join(' · ')
  );
  console.log(
    'bottom cards',
    m.cards
      .slice(-8)
      .map((c) => `${c.name} ${c.win}`)
      .join(' · ')
  );
  console.log('charms', m.charms.map((c) => `${c.name} ${c.n}/${c.win}`).join(' · '));
  console.log('wrote docs/meta.md');
}
