// Screen logic: title, setup, match, prompts, animations. Talks to the engine through MCD only.

import { MCD as M } from '../engine/index.js';
import { ART as A } from './art.js';
import './styles.css';
const $ = id => document.getElementById(id);
let g = null, selected = null, settings = { opponent: 'ai', freeBuilds: false, finisherBonus: 6, capMin: 3 };
try { const s = JSON.parse(localStorage.getItem('mcd-settings') || 'null'); if (s && s.freeBuilds) { s.freeBuilds = false; localStorage.setItem('mcd-settings', JSON.stringify(s)); } } catch {}
let humanView = 0, passPending = false, overlayKey = null;
let lastHandSig = '', lastCounts = null, lastMoney = null, lastRound = 0, lastTier = null, splashRound = 0, replaying = false;

try { const s = JSON.parse(localStorage.getItem('mcd-settings') || 'null'); if (s) settings = Object.assign(settings, s); } catch {}
function saveSettings() { try { localStorage.setItem('mcd-settings', JSON.stringify(settings)); } catch {} }
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 1600); }
function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const artCache = {};
function cardArt(c) { const k = c.key; return artCache[k] || (artCache[k] = A.card(c)); }

// ---------- home ----------
function showHome() {
  $('home').hidden = false; $('app').style.visibility = 'hidden'; $('overlay').innerHTML = ''; overlayKey = null;
  if (!$('sky1').innerHTML) {
    $('sky1').innerHTML = A.skyline(900, 160, 5, true); $('sky2').innerHTML = A.skyline(900, 200, 9, false);
    $('cl1').innerHTML = A.cloudSvg(); $('cl2').innerHTML = A.cloudSvg();
    const r = $('roster'); M.FIRMS.forEach(f => { const d = h('div'); d.innerHTML = A.dev(f.id); d.title = f.name; r.appendChild(d); });
    ['Campaign', 'Collection', 'Season', 'Friends'].forEach(n => { const t = h('div', 'tile', A.lockSvg() + n + '<span class="soon">soon</span>'); t.setAttribute('aria-disabled', 'true'); $('tiles').appendChild(t); });
  }
}
$('playAi').addEventListener('click', () => { settings.opponent = 'ai'; startSetup(); });
$('playHot').addEventListener('click', () => { settings.opponent = 'hotseat'; startSetup(); });
$('homeBtn').addEventListener('click', showHome);
let oppPref = null; // null = automatic by screen height; true/false = user's choice
function autoCompact() { return oppPref === null ? (window.innerHeight < 760) : oppPref; }
function applyOppMode() { const s = $('oppSide'); const c = autoCompact(); s.classList.toggle('compact', c); $('oppExpand').textContent = c ? '▾' : '▴'; }
$('oppSide').addEventListener('click', () => { oppPref = !autoCompact(); applyOppMode(); });
window.addEventListener('resize', () => { if (!replaying) applyOppMode(); });
function startSetup() { $('home').hidden = true; $('app').style.visibility = 'visible'; showSetup(); }

// ---------- rendering ----------
function cardEl(c, opts) {
  opts = opts || {};
  const e = h('button', 'card ' + (c.kind === 'block' ? c.type : c.kind) + (c.look ? ' ' + c.look : '') + (c.firm ? ' firm' : ''));
  e.type = 'button'; e.dataset.uid = c.uid;
  if (c.firm) e.dataset.firm = M.FIRMS.find(f => f.id === c.firm).name.split(' ')[1] || '';
  const kd = c.kind === 'block' ? M.TYPE_NAME[c.type] : (c.kind === 'cap' ? 'Cap' : c.kind === 'ops' ? 'Ops' : 'Rival');
  e.appendChild(h('div', 'art', cardArt(c)));
  e.appendChild(h('div', 'kd', c.kind === 'hq' ? 'HQ' : kd));
  const badges = h('div', 'badges');
  if (c.look) { const b = h('span', 'lk', A.lookBadge(c.look)); b.title = M.LOOKS[c.look].name + ': ' + M.LOOKS[c.look].trait + ' All one material in a finished tower: +1★ per floor.'; badges.appendChild(b); }
  if (c.ps) { const b = h('span', 'ps', A.psBadge()); b.title = 'Prestige-sensitive'; b.addEventListener('click', ev => { ev.stopPropagation(); showPsInfo(c); }); badges.appendChild(b); }
  if (badges.childNodes.length) e.appendChild(badges);
  const body = h('div', 'body'); e.appendChild(body);
  body.appendChild(h('div', 'nm', c.name));
  if (c.text) body.appendChild(h('div', 'tx', c.text));
  else if (c.kind === 'block') { const r = M.TYPE_RULES[c.type]; body.appendChild(h('div', 'tx', (r.rule === 'Any floor.' ? '' : r.rule + ' ') + r.bonus)); }
  if (c.charms && c.charms.length) { const ch = h('div', 'charms'); c.charms.forEach(k => { const b = h('span', null, A.charmBadge(k)); b.title = M.CHARMS[k].name + ': ' + M.CHARMS[k].text; ch.appendChild(b); }); e.appendChild(ch); }
  const n = h('div', 'nums');
  const tier = g ? g.players[humanView].tier : 0;
  if (c.kind === 'block') { const cost = g ? M.blockCost(g, c, null, g.players[humanView]) : c.cost; n.innerHTML = `<span><b>$${cost}</b></span>${M.cardRev(c, tier) ? `<span><b>+$${M.cardRev(c, tier)}</b></span>` : '<span></span>'}<span><b>${M.cardPts(c, tier)}★</b></span>`; }
  else if (c.kind === 'cap') n.innerHTML = `<span><b>$2+</b></span><span></span><span><b>${M.cardPts(c, tier)}★</b></span>`;
  if (c.kind === 'block' || c.kind === 'cap') body.appendChild(n);
  if (opts.onclick) e.addEventListener('click', opts.onclick);
  return e;
}
function plotEl(pl, i, big, p) {
  const e = h('div', 'plot' + (big ? ' big' : '') + ' z-' + pl.zone); e.tabIndex = big ? 0 : -1; e.dataset.i = i;
  e.innerHTML = A.tower(pl);
  const z = M.ZONES[pl.zone];
  if (pl.zone !== 'open') e.appendChild(h('div', 'zg', A.zoneGlyph(pl.zone)));
  if (M.uniformLook(pl)) { e.classList.add('uni-' + pl.blocks[0].look); e.appendChild(h('div', 'uni', M.LOOKS[pl.blocks[0].look].name)); }
  if (pl.blocks.length) { const inc = M.plotIncome(p, i); const pts = M.plotPts(p, i) + (pl.cap ? M.cardPts(pl.cap) + M.capBonus(pl, pl.cap, g) : 0); e.appendChild(h('div', 'inc', pl.cap ? `$${inc} · ${pts}★` : `<i>($${inc} · ${pts}★)</i>`)); }
  e.title = `Plot ${i + 1} · ${z.name}: ${z.text}` + (pl.blocks.length ? '\n' + pl.blocks.map(b => b.name).join(' / ') + (pl.cap ? ' + ' + pl.cap.name : '') : '');
  return e;
}
function statsHtml(p, mine) {
  const inc = M.playerIncome(p), gross = M.grossRev(p), pot = M.potentialRev(p), capped = p.plots.filter(pl => pl.cap).length;
  let s = `<span class="money${p.money < 3 ? ' low' : ''}" id="${mine ? 'myMoney' : 'opMoney'}">$${p.money}<small>+${inc}</small></span>`;
  s += `<span class="name">${p.firm ? `<span class="pf">${A.dev(p.firm.id)}</span>` : ''}${p.name}${p.firm ? ' · ' + p.firm.name.split(' ')[1] : ''}</span>`;
  M.refreshTier(p);
  const t = p.tier, next = M.TIERS[t + 1]; const prog = next ? Math.min(1, (p.prestige - M.TIERS[t].at) / (next.at - M.TIERS[t].at)) : 1;
  s += `<span class="rep" data-pi="${p.idx}" title="Reputation">${A.tierBadge(t)}<span>${p.prestige}★</span><span class="bar"><i style="width:${Math.round(prog * 100)}%"></i></span></span>`;
  s += `<span class="rentline" title="Only finished towers collect rent">rent $${gross}${pot > gross ? ` <i>(+$${pot - gross} when finished)</i>` : ''}</span><span class="finline">finished <b class="k">${capped}/6</b></span>`;
  if (mine) s += `<span class="deckbtn" data-pi="${p.idx}">deck ${p.deck.length} · discard ${p.discard.length} · cut ${p.removed.length}</span>`;
  if (mine && p.bounty) s += `<span class="bounty">★ <b>${p.bounty.name}</b>: ${p.bounty.text} (+${p.bounty.pts})</span>`;
  return s;
}
function render() {
  if (!g) return;
  const me = g.players[humanView], op = g.players[1 - humanView];
  $('roundLbl').textContent = g.gameOver ? 'final' : `R${g.round}/${g.events.length} · ${M.cur(g).name}`;
  if (g.event) { const eb = $('eventBar'); eb.innerHTML = `<b>${g.event.name}</b><span>${g.event.text}</span>`; const ep = $('evtPill'); ep.hidden = false; ep.innerHTML = `<b>${g.event.name}</b><span>${g.event.text}</span>`; ep.title = g.event.text; if (g.round !== lastRound) { eb.classList.remove('flash'); void eb.offsetWidth; eb.classList.add('flash'); lastRound = g.round; } }
  if (g.event && g.round !== splashRound && !g.gameOver && !replaying) { splashRound = g.round; showSplash(g.event, g.round); }
  $('oppStats').innerHTML = statsHtml(op, false);
  $('myStats').innerHTML = statsHtml(me, true);
  document.querySelectorAll('.rep').forEach(el => el.addEventListener('click', () => showTiers(g.players[+el.dataset.pi])));
  document.querySelectorAll('.deckbtn').forEach(el => el.addEventListener('click', () => showPiles(g.players[+el.dataset.pi])));
  if (lastTier !== null && me.tier > lastTier) { const r = document.querySelector('#myStats .rep'); if (r) r.classList.add('up'); toast('Reputation up: ' + M.TIERS[me.tier].name + '. ' + M.TIERS[me.tier].perk); }
  lastTier = me.tier;
  if (lastMoney !== null && lastMoney !== me.money) { const m = $('myMoney'); if (m) m.classList.add('pop'); }
  lastMoney = me.money;
  const ol = $('oppLots'); ol.innerHTML = ''; op.plots.forEach((pl, i) => ol.appendChild(plotEl(pl, i, false, op)));
  $('oppDiagram').innerHTML = A.blockDiagram(op);
  if (!replaying) applyOppMode();
  const ml = $('myLots'); ml.innerHTML = '';
  const sel = selected && me.hand.find(c => c.uid === selected);
  renderHq(me, sel);
  const counts = me.plots.map(pl => pl.blocks.length + (pl.cap ? 1 : 0) + (pl.crane ? 1 : 0));
  me.plots.forEach((pl, i) => {
    const e = plotEl(pl, i, true, me);
    if (lastCounts && lastCounts[i] !== counts[i] && lastCounts.view === humanView) e.classList.add('bump');
    if (pendingFx && pendingFx.plot === i) { const fx = pendingFx.fx; pendingFx = null; setTimeout(() => e.classList.add(fx), 380); }
    if (sel && (sel.kind === 'block' || sel.kind === 'cap' || sel.target === 'plot')) {
      const ok = M.canPlay(g, humanView, sel.uid, i);
      if (ok === true) {
        e.classList.add('target'); e.addEventListener('click', () => doPlay(sel.uid, i)); e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); doPlay(sel.uid, i); } });
        const pv = M.placementPreview(g, humanView, sel.uid, i);
        if (pv) {
          let uni = '';
          if (sel.kind === 'block' && pl.blocks.length) { const same = pl.blocks.every(b => b.look === sel.look); uni = same ? `<small>✓ uniform ${M.LOOKS[sel.look].name.toLowerCase()}</small>` : (M.uniformLook(pl) ? '<small>breaks uniform</small>' : ''); }
          e.appendChild(h('div', 'pv', (sel.kind === 'block' ? `$${pv.cost} ` : '') + (pv.rev ? `+$${pv.rev} ` : '') + (pv.pts ? `+${pv.pts}★` : '') + uni));
        }
      } else { e.classList.add('blocked'); e.title = ok + '\n' + e.title; e.addEventListener('click', () => popLabel(e, ok, 1500)); }
    } else { e.addEventListener('click', ev => popPlot(e, me, i)); }
    ml.appendChild(e);
  });
  lastCounts = counts; lastCounts.view = humanView;
  const hd = $('hand'); hd.innerHTML = '';
  const myTurn = g.turn === humanView && g.phase === 'act' && !g.pending.length && !g.gameOver;
  hd.classList.toggle('away', settings.opponent === 'ai' && g.turn !== humanView && !g.gameOver);
  const sig = humanView + ':' + me.hand.map(c => c.uid).join(',');
  const fresh = sig !== lastHandSig && me.hand.length && !hd.classList.contains('away'); if (!hd.classList.contains('away')) lastHandSig = sig;
  hd.style.setProperty('--n', me.hand.length);
  me.hand.forEach((c, i) => {
    const e = cardEl(c, { onclick: () => onCard(c) }); e.style.setProperty('--i', i);
    if (selected === c.uid) e.classList.add('sel');
    if (!myTurn) e.classList.add('dim');
    else { const playable = (c.kind === 'block' || c.kind === 'cap' || c.target === 'plot') ? me.plots.some((pl, j) => M.canPlay(g, humanView, c.uid, j) === true) : M.canPlay(g, humanView, c.uid, null) === true; if (!playable) e.classList.add('dead'); }
    if (fresh) { e.classList.add('deal'); e.style.animationDelay = (i * 90) + 'ms'; }
    hd.appendChild(e);
  });
  if (fresh) { const pr = $('pileDraw').getBoundingClientRect(); hd.querySelectorAll('.card.deal').forEach(e => { const r = e.getBoundingClientRect(); e.style.setProperty('--dx', (pr.left + pr.width / 2 - (r.left + r.width / 2)) + 'px'); e.style.setProperty('--dy', (pr.top + pr.height / 2 - (r.top + r.height / 2)) + 'px'); }); }
  updatePiles(me);
  $('endBtn').disabled = !myTurn;
  $('subBtn').hidden = !(myTurn && sel && sel.kind === 'block');
  $('mktBtn').hidden = !(myTurn && !(sel && sel.kind === 'block'));
  if (!replaying) $('hint').textContent = hintText(me, myTurn, sel);
  renderPending();
}
function renderHq(me, sel) {
  const strip = $('hqStrip'); strip.innerHTML = '<span class="hqlbl">HQ</span>';
  const slots = M.hqSlots(me);
  for (let i = 0; i < 3; i++) {
    const c = me.hq[i];
    if (c) { const s = h('div', 'hqslot filled', `<span class="ha">${cardArt(c)}</span><span>${c.name}</span>`); s.title = c.text; s.addEventListener('click', () => toast(c.name + ': ' + c.text.replace('HQ: ', ''))); strip.appendChild(s); }
    else if (i < slots) { const s = h('div', 'hqslot', 'open slot'); if (sel && sel.kind === 'hq') { s.addEventListener('click', ev => { ev.stopPropagation(); doPlay(sel.uid, null); }); } strip.appendChild(s); }
    else { const need = i === 1 ? 'Respected' : 'Iconic'; strip.appendChild(h('div', 'hqslot locked', `${A.lockSvg()}<span>${need}</span>`)); }
  }
  strip.classList.toggle('target', !!(sel && sel.kind === 'hq' && me.hq.length < slots));
}
function hintText(me, myTurn, sel) {
  if (g.gameOver) return 'Game over.';
  if (!myTurn) return g.pending.length ? 'Resolve the prompt.' : `${M.cur(g).name} is building…`;
  if (!sel) return M.anyLegalPlay(g, humanView) ? 'Tap a card, then a tower. One floor per tower per turn (two with a crane).' : 'No legal plays: towers are full or capped. Subcontract a block ($1: discard, draw) or end turn.';
  if (sel.kind === 'hq') { const ok = M.canPlay(g, humanView, sel.uid, null); return ok === true ? 'Tap an open HQ slot. It stays in play for the match.' : ok; }
  if (sel.target === 'plot') { const any = me.plots.some((pl, i) => M.canPlay(g, humanView, sel.uid, i) === true); return any ? 'Tap a tower.' : 'No valid tower: ' + firstReason(sel); }
  if (sel.kind === 'block') { const any = me.plots.some((pl, i) => M.canPlay(g, humanView, sel.uid, i) === true); return any ? 'Tap a glowing plot to build, or subcontract.' : 'No legal plot (' + firstReason(sel) + '). Subcontract for $1 to draw a card.'; }
  if (sel.kind === 'cap') { const any = me.plots.some((pl, i) => M.canPlay(g, humanView, sel.uid, i) === true); return any ? 'Tap a tower to cap it.' : 'No cappable tower: ' + firstReason(sel); }
  return 'Tap again to play it.';
}
function firstReason(c) { const me = g.players[humanView]; const r = me.plots.map((pl, i) => M.canPlay(g, humanView, c.uid, i)).filter(x => x !== true); return r[0] || ''; }
function onCard(c) {
  const myTurn = g.turn === humanView && g.phase === 'act' && !g.pending.length && !g.gameOver;
  if (!myTurn) return;
  if (selected === c.uid && (c.kind === 'ops' || c.kind === 'int') && c.target !== 'plot') { doPlay(c.uid, null); return; }
  if (selected === c.uid && c.kind === 'hq') { doPlay(c.uid, null); return; }
  selected = selected === c.uid ? null : c.uid; render();
}
let lastPiles = null, pendingFx = null;
function updatePiles(p) {
  $('drawCnt').textContent = p.deck.length; $('discCnt').textContent = p.discard.length;
  $('pileDraw').classList.toggle('empty', !p.deck.length); $('pileDiscard').classList.toggle('empty', !p.discard.length);
  if (lastPiles && lastPiles.view === humanView) {
    if (p.discard.length > lastPiles.disc) { const d = $('pileDiscard'); d.classList.remove('pulse'); void d.offsetWidth; d.classList.add('pulse'); }
    if (lastPiles.deck === 0 && p.deck.length > 0 && p.discard.length < lastPiles.disc) flyBacks($('pileDiscard'), $('pileDraw'), Math.min(6, p.deck.length));
  }
  lastPiles = { deck: p.deck.length, disc: p.discard.length, view: humanView };
}
function flyBacks(fromEl, toEl, n) {
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const f = h('div', 'flyer back'); f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; document.body.appendChild(f);
    f.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${(b.left - a.left) / 2}px,${b.top - a.top - 40}px) rotate(180deg)`, offset: .5 }, { transform: `translate(${b.left - a.left}px,${b.top - a.top}px) rotate(360deg)` }], { duration: 500, delay: i * 60, easing: 'cubic-bezier(.3,.8,.3,1)', fill: 'backwards' }).onfinish = () => f.remove();
  }
}
function flyRect(a, toEl, opts) {
  opts = opts || {}; const b = toEl.getBoundingClientRect();
  const f = h('div', 'flyer'); f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; if (opts.node) f.appendChild(opts.node); else f.classList.add('back'); document.body.appendChild(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = f.animate([{ transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 }, { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 30}px) scale(${opts.mid || .8}) rotate(-6deg)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(${opts.end || .35}) rotate(3deg)`, opacity: opts.fade === false ? 1 : .3 }], { duration: opts.ms || 420, delay: opts.delay || 0, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'backwards' });
  anim.onfinish = () => f.remove(); return anim;
}
function flyCard(uid, targetEl) {
  const src = document.querySelector(`.hand .card[data-uid="${uid}"]`); if (!src || !targetEl) return;
  const a = src.getBoundingClientRect(), b = targetEl.getBoundingClientRect();
  const f = h('div', 'flyer'); f.appendChild(src.cloneNode(true)); f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; document.body.appendChild(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  f.animate([{ transform: 'translate(0,0) scale(1) rotate(0deg)' }, { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 40}px) scale(.7) rotate(-8deg)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.2) rotate(4deg)`, opacity: .2 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' }).onfinish = () => f.remove();
}
function doPlay(uid, plot) {
  const target = plot != null ? $('myLots').children[plot] : $('hqStrip');
  const me = g.players[humanView]; const card = me.hand.find(c => c.uid === uid);
  const src = document.querySelector(`.hand .card[data-uid="${uid}"]`); const a = src ? src.getBoundingClientRect() : null;
  const r = M.playCard(g, humanView, uid, plot); if (r !== true) { toast(r); return; }
  flyCard(uid, target);
  if (card && card.kind === 'block' && plot != null) {
    const fx = 'fx-' + card.look; pendingFx = { plot, fx };
    const pl = me.plots[plot]; if (pl.blocks.length >= 2 && M.uniformLook(pl)) { try { if (!localStorage.getItem('mcd-hint-uni')) { setTimeout(() => toast(`Uniform tower: all ${M.LOOKS[card.look].name} scores +1★ per floor when finished`), 500); localStorage.setItem('mcd-hint-uni', '1'); } } catch {} }
  }
  // the crew returns: a card back hops from the tower to the discard pile (unless the card left the deck)
  const stays = card && (card.kind === 'cap' || card.kind === 'hq' || card.key === 'siteoffice' || card.key === 'crane' || (card.charms && card.charms.includes('expedite')));
  if (a && !stays) setTimeout(() => flyRect(target.getBoundingClientRect(), $('pileDiscard'), { ms: 380, end: 1, fade: false }), 380);
  selected = null; render();
}
$('pileDraw').addEventListener('click', () => { if (g) showPiles(g.players[humanView]); });
$('pileDiscard').addEventListener('click', () => { if (g) showPiles(g.players[humanView]); });
$('mktBtn').addEventListener('click', () => {
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, 'Market'));
  sheet.appendChild(h('p', null, `These are the cards on offer at your draft this turn (you will take one). ${g.communal.length} left in the pool. Market Survey swaps them for fresh ones.`));
  const ch = h('div', 'choices'); g.market.forEach(c => ch.appendChild(cardEl(c))); sheet.appendChild(ch);
  const b = h('button', 'btn', 'Close'); b.style.marginTop = '10px'; b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(b);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'info';
});
$('subBtn').addEventListener('click', () => { if (!selected) return; const r = M.subcontract(g, humanView, selected); if (r !== true) { toast(r); return; } selected = null; render(); });
$('endBtn').addEventListener('click', () => {
  const cards = Array.from(document.querySelectorAll('.hand .card'));
  if (M.endTurn(g, humanView)) {
    cards.forEach((e, i) => flyRect(e.getBoundingClientRect(), $('pileDiscard'), { node: e.cloneNode(true), ms: 380, delay: i * 50, end: .4 }));
    selected = null; render();
  }
});

function showSplash(ev, round) {
  const old = document.querySelector('.splash'); if (old) old.remove();
  const s = h('div', 'splash'); s.innerHTML = `<div class="ev ${ev.mood || 'calm'}"><span class="mood">${{ good: 'Good news', bad: 'Bad news', shop: 'Opportunity', calm: 'Quiet' }[ev.mood] || 'Event'}</span><h2>${ev.name}</h2><p>${ev.text}</p><div class="r">Round ${round} of ${g.events.length}</div></div>`;
  const close = () => { s.classList.add('out'); setTimeout(() => s.remove(), 260); };
  s.addEventListener('click', close); document.body.appendChild(s); setTimeout(close, 1700);
}
function popLabel(anchor, text, ms) {
  document.querySelectorAll('.poplbl').forEach(x => x.remove());
  const r = anchor.getBoundingClientRect(); const l = h('div', 'poplbl', text); document.body.appendChild(l);
  const w = l.offsetWidth; let x = r.left + r.width / 2 - w / 2; x = Math.max(8, Math.min(window.innerWidth - w - 8, x));
  l.style.left = x + 'px'; l.style.top = Math.max(8, r.top - l.offsetHeight - 8) + 'px';
  setTimeout(() => l.remove(), ms || 1800);
}
function popPlot(el, p, i) {
  const pl = p.plots[i], z = M.ZONES[pl.zone];
  let t = pl.zone === 'open' ? 'Open lot: build anything' : `${z.name}: ${z.text.replace(/\.$/, '')}`;
  if (pl.blocks.length) { const inc = M.plotIncome(p, i), pts = M.plotPts(p, i) + (pl.cap ? M.cardPts(pl.cap, p.tier) + M.capBonus(pl, pl.cap, g) : 0); t += ` · ${pl.blocks.length} fl, $${inc}, ${pts}★${pl.cap ? '' : ' when finished'}`; }
  popLabel(el, t, 2200);
}
function showPsInfo(c) {
  const p = g ? g.players[humanView] : null; const t = p ? p.tier : 0;
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, c.name + ' is prestige-sensitive'));
  const what = c.ps.pts ? `+${c.ps.pts}★ per reputation tier` : c.ps.rev ? `+$${c.ps.rev} rent per reputation tier` : `+$${c.ps.money} per reputation tier`;
  sheet.appendChild(h('p', null, `${what}. You are tier ${t} (${M.TIERS[t].name}), so right now it is worth ${c.ps.pts ? '+' + c.ps.pts * t + '★' : c.ps.rev ? '+$' + c.ps.rev * t + ' rent' : '+$' + c.ps.money * t}. Tiers come from points banked in finished towers.`));
  const b = h('button', 'btn', 'Close'); b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(b);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'info';
}
function showTiers(p) {
  M.refreshTier(p);
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, `${p.name}: ${M.TIERS[p.tier].name}`));
  sheet.appendChild(h('p', null, `${p.prestige}★ banked in finished towers. Reputation unlocks perks and powers up prestige-sensitive cards (the ◈ badge).`));
  const list = h('div', 'tiers');
  M.TIERS.forEach((tr, i) => { const row = h('div', 'tierrow' + (i === p.tier ? ' now' : i < p.tier ? ' done' : ''), `${A.tierBadge(i)}<div><b>${tr.name}</b> <small>${tr.at}★</small><br><small>${tr.perk || 'Starting reputation.'}</small></div>`); list.appendChild(row); });
  sheet.appendChild(list);
  const b = h('button', 'btn', 'Close'); b.style.marginTop = '10px'; b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(b);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'info';
}
function showPiles(p) {
  const sheet = h('div', 'sheet pile'); sheet.appendChild(h('h2', null, 'Your cards'));
  const group = (title, cards, note) => { sheet.appendChild(h('h3', null, `${title} · ${cards.length}`)); if (note) sheet.appendChild(h('p', null, note)); const m = h('div', 'mini'); cards.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(c => m.appendChild(cardEl(c))); if (!cards.length) m.appendChild(h('p', null, 'empty')); sheet.appendChild(m); };
  group('Hand', p.hand); group('Draw pile', p.deck, 'Shown sorted; the draw order is hidden.'); group('Discard', p.discard); group('Cut from the game', p.removed);
  sheet.appendChild(h('h3', null, 'Your ten')); sheet.appendChild(h('p', null, (p.pack || []).map(([k, n]) => `${n}× ${M.CATALOG[k].name}`).join(', ')));
  const b = h('button', 'btn', 'Close'); b.style.marginTop = '10px'; b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(b);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'info';
}
// ---------- prompts ----------
function wrap(sheet) { const o = h('div', 'overlay'); o.appendChild(sheet); return o; }
function renderPending() {
  const ov = $('overlay');
  if (passPending || replaying) return;
  const req = g.pending[0];
  if (g.gameOver) { if (overlayKey !== 'over') { overlayKey = 'over'; showGameOver(); } return; }
  if (!req || req.pi !== humanView) { if (overlayKey && overlayKey !== 'settings' && overlayKey !== 'log' && overlayKey !== 'info') { ov.innerHTML = ''; overlayKey = null; } return; }
  const key = req.type + ':' + (req.options ? req.options.join(',') : g.market.map(c => c.uid).join(','));
  if (overlayKey === key) return;
  overlayKey = key;
  const p = g.players[req.pi];
  const sheet = h('div', 'sheet'); ov.innerHTML = ''; ov.appendChild(wrap(sheet));
  const pick = v => { M.resolve(g, req, v); overlayKey = null; ov.innerHTML = ''; afterHumanAction(); };
  if (req.type === 'bounty') {
    sheet.appendChild(h('h2', null, 'Pick a bounty'));
    sheet.appendChild(h('p', null, 'A secret goal. Scores at game end if you hit it.'));
    const ch = h('div', 'choices');
    p.bountyOffer.forEach(b => { const o = h('button', 'option', `<b>${b.name}</b>${b.text}<br><small>+${b.pts} prestige</small>`); o.addEventListener('click', () => pick(b.id)); ch.appendChild(o); });
    sheet.appendChild(ch);
  } else if (req.type === 'charm') {
    sheet.classList.add('add');
    sheet.appendChild(h('div', 'tag', 'Talent fair'));
    sheet.appendChild(h('h2', null, 'Hire a specialist'));
    sheet.appendChild(h('p', null, `$${req.price} to embed one in a card in your hand, for the rest of the match. You have $${p.money}. Or skip.`));
    let charm = null; const ch = h('div', 'shop'); const opts = [];
    req.offer.forEach(k => { const o = h('button', 'option', `${A.charmBadge(k)}<b>${M.CHARMS[k].name}</b><br><small>${M.CHARMS[k].text}</small>`); o.addEventListener('click', () => { if (p.money < req.price) { toast('Not enough money'); return; } charm = k; opts.forEach(x => x.classList.toggle('sel', x === o)); cards.classList.remove('dimall'); }); opts.push(o); ch.appendChild(o); });
    sheet.appendChild(ch); sheet.appendChild(h('p', null, 'Then the card they join:'));
    const cards = h('div', 'choices dimall'); p.hand.forEach(c => cards.appendChild(cardEl(c, { onclick: () => { if (!charm) { toast('Pick a specialist first'); return; } pick({ card: c.uid, charm }); } }))); sheet.appendChild(cards);
    const skip = h('button', 'btn ghost', 'Skip'); skip.style.marginTop = '10px'; skip.addEventListener('click', () => pick(null)); sheet.appendChild(skip);
  } else if (req.type === 'remove' || req.type === 'audit') {
    sheet.classList.add('cut');
    sheet.appendChild(h('div', 'tag', 'Cut from deck'));
    sheet.appendChild(h('h2', null, req.type === 'remove' ? 'Retire a crew' : 'Retire a card'));
    sheet.appendChild(h('p', null, (req.type === 'remove' ? 'Your deck reshuffled, so you streamline. ' : '') + 'The card you tap leaves your deck for the rest of the match.'));
    const ch = h('div', 'choices');
    req.options.forEach(uid => { const c = p.deck.find(x => x.uid === uid) || p.hand.find(x => x.uid === uid); if (c) ch.appendChild(cardEl(c, { onclick: () => pick(c.uid) })); });
    sheet.appendChild(ch);
  } else if (req.type === 'tunnel') {
    sheet.appendChild(h('h2', null, 'Tunnel Boring'));
    sheet.appendChild(h('p', null, `Swap plot ${req.first + 1} with which tower? Zones stay where they are.`));
    const ch = h('div', 'choices');
    req.options.forEach(j => { const pl = p.plots[j]; const o = h('button', 'option', `<b>Plot ${j + 1} · ${M.ZONES[pl.zone].short || 'open'}</b><small>${pl.blocks.length ? pl.blocks.length + ' floors' + (pl.cap ? ', finished' : '') : 'empty'}</small>`); o.addEventListener('click', () => pick(j)); ch.appendChild(o); });
    sheet.appendChild(ch);
  } else if (req.type === 'draft') {
    sheet.classList.add('add');
    sheet.appendChild(h('div', 'tag', 'Add to deck'));
    sheet.appendChild(h('h2', null, 'Draft a card'));
    sheet.appendChild(h('p', null, `The card you tap joins your deck (via the discard pile). The rest stay in the market for ${g.players[1 - req.pi].name}. ${g.communal.length} left in the pool.`));
    const ch = h('div', 'choices');
    if (!g.market.length) { sheet.appendChild(h('p', null, 'The market is empty.')); const b = h('button', 'btn', 'Continue'); b.addEventListener('click', () => pick(null)); sheet.appendChild(b); }
    g.market.forEach(c => ch.appendChild(cardEl(c, { onclick: () => pick(c.uid) })));
    sheet.appendChild(ch);
    const buy = h('button', 'btn ghost', 'Or buy a Flat Roof for $5'); buy.style.marginTop = '10px'; buy.disabled = p.money < 5; buy.title = 'The permit office always has one.';
    buy.addEventListener('click', () => pick('buyroof')); sheet.appendChild(buy);
  }
}
function afterHumanAction() {
  render();
  if (g.gameOver) return;
  if (g.turn !== humanView) { if (settings.opponent === 'ai') runAi(); else showPass(); }
}
function runAi() {
  $('hint').textContent = 'Rival is building…';
  setTimeout(() => {
    const start = g.actions.length;
    M.aiTurn(g, 1);
    const acts = g.actions.slice(start).filter(a => a.pi === 1);
    replaying = acts.length > 0;
    render();
    replay(acts, () => { replaying = false; applyOppMode(); if (!g.gameOver && g.turn === 1) runAi(); else render(); });
  }, 500);
}
function replay(acts, done) {
  if (!acts.length) { done(); return; }
  const side = $('oppSide');
  side.classList.remove('compact'); document.querySelector('.boards').classList.add('focus');
  let i = 0;
  const step = () => {
    const old = side.querySelector('.ticker'); if (old) old.remove();
    side.querySelectorAll('.plot.hilite').forEach(e => e.classList.remove('hilite'));
    if (i >= acts.length) { document.querySelector('.boards').classList.remove('focus'); done(); return; }
    const a = acts[i++];
    const verb = { build: 'builds', cap: 'caps with', play: 'plays', sub: 'subcontracts', draft: 'drafts', charm: 'hires for', hq: 'opens' }[a.kind];
    const t = h('div', 'ticker ' + a.kind, `<span class="ta">${cardArt(a.card)}</span><span>${verb} <b>${a.kind === 'charm' ? M.CHARMS[a.charm].name + ' → ' + a.card.name : a.card.name}</b>${a.plot != null ? ' · plot ' + (a.plot + 1) : ''}</span>`);
    side.appendChild(t);
    if (a.plot != null) { const pl = $('oppLots').children[a.plot]; if (pl) { pl.classList.add('hilite', 'bump'); } }
    setTimeout(step, a.kind === 'draft' ? 1100 : 650);
  };
  step();
}
function showPass() {
  passPending = true; const next = g.players[g.turn];
  const sheet = h('div', 'sheet');
  sheet.appendChild(h('h2', null, `Pass to ${next.name}`));
  sheet.appendChild(h('p', null, 'Hand over the phone. Your hand stays hidden until they tap.'));
  const b = h('button', 'btn', `I am ${next.name}`);
  b.addEventListener('click', () => { passPending = false; humanView = g.turn; selected = null; lastCounts = null; lastPiles = null; $('overlay').innerHTML = ''; overlayKey = null; render(); });
  sheet.appendChild(b);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet));
  $('hand').innerHTML = ''; $('hint').textContent = '';
}
function showGameOver() {
  const r = g.result; const sheet = h('div', 'sheet winner'); const names = g.players.map(p => p.name);
  const w = r.winner;
  if (w >= 0 && g.players[w].firm) sheet.appendChild(h('div', 'pf', A.dev(g.players[w].firm.id)));
  sheet.appendChild(h('h2', null, w === -1 ? 'Tie!' : (w === 0 && names[0] === 'You' ? 'You win!' : `${names[w]} wins`)));
  sheet.appendChild(h('p', null, r.reason === 'complete' ? `${g.players[g.endTriggeredBy].name} completed the block in round ${g.round}.` : 'The city ran out of time.'));
  const rows = [['Finished towers', 'towers'], ['Bounty', 'bounty'], ['Finisher bonus', 'finisher']];
  let t = `<table class="score"><tr><td></td><td>${names[0]}</td><td>${names[1]}</td></tr>`;
  rows.forEach(([l, k]) => t += `<tr><td>${l}</td><td>${r.scores[0][k]}</td><td>${r.scores[1][k]}</td></tr>`);
  t += `<tr class="tot"><td>Total</td><td>${r.scores[0].total}</td><td>${r.scores[1].total}</td></tr></table>`;
  sheet.insertAdjacentHTML('beforeend', t);
  sheet.appendChild(h('p', null, 'Only capped towers score. Unfinished towers and leftover money count for nothing.'));
  const tog = h('button', 'btn ghost', 'Tower breakdown'); tog.style.fontSize = '13px'; tog.style.padding = '8px 12px'; tog.style.marginBottom = '10px';
  const det = h('div', 'detail'); det.hidden = true;
  let dt = `<table class="score small"><tr><td>Tower</td><td>Floors</td><td>Neighbours</td><td>Cap</td><td>Score</td></tr>`;
  [0, 1].forEach(pi => { dt += `<tr><td colspan="5" class="who">${names[pi]}</td></tr>`; r.scores[pi].detail.forEach(d => { dt += `<tr class="${d.capped ? '' : 'unf'}"><td>${d.plot} · ${M.ZONES[d.zone].short || 'open'} · ${d.height} fl${d.capped ? ' · ' + d.capName : ' · unfinished'}</td><td>${d.capped ? d.floors : '–'}</td><td>${d.capped ? (d.adj ? '+' + d.adj : '0') : '–'}</td><td>${d.capped ? d.cap : '–'}</td><td>${d.total}</td></tr>`; }); });
  dt += '</table>'; det.innerHTML = dt;
  tog.addEventListener('click', () => { det.hidden = !det.hidden; tog.textContent = det.hidden ? 'Tower breakdown' : 'Hide breakdown'; });
  sheet.appendChild(tog); sheet.appendChild(det);
  const b = h('button', 'btn', 'Play again'); b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; showSetup(); }); sheet.appendChild(b);
  const hb = h('button', 'btn ghost', 'Home'); hb.style.marginLeft = '8px'; hb.addEventListener('click', showHome); sheet.appendChild(hb);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet));
}

// ---------- setup ----------
function devOption(f, onpick) {
  const o = h('button', 'option dev', `<div class="pf">${A.dev(f.id)}</div><div><b>${f.name}</b><small>${f.tag}</small><br><small style="color:var(--fg)">${f.passive}</small></div>`);
  o.addEventListener('click', () => onpick(f, o));
  return o;
}
function loadPack(f) { try { const p = JSON.parse(localStorage.getItem('mcd-pack-' + f.id) || 'null'); if (p && M.validPack(f, p)) return p; } catch {} return f.pack.map(x => x.slice()); }
function showDeckPicker(f, onDone) {
  const sheet = h('div', 'sheet');
  sheet.appendChild(h('h2', null, `${f.name.split(' ')[0]}'s ten`));
  sheet.appendChild(h('p', null, 'Pick the ten cards you bring into the shared pool. Your rival can draft them too, so bring cards that fit your plan more than theirs.'));
  const counts = {}; loadPack(f).forEach(([k, n]) => counts[k] = n);
  const total = () => Object.values(counts).reduce((a, b) => a + b, 0);
  const head = h('div', 'pkhead'); sheet.appendChild(head);
  const list = h('div', 'pklist'); sheet.appendChild(list);
  const done = h('button', 'btn big', 'Build'); done.style.width = '100%'; done.style.marginTop = '10px';
  const reset = h('button', 'btn ghost', 'Default ten'); reset.style.marginTop = '10px'; reset.style.marginRight = '8px';
  function refresh() {
    const t = total(); head.innerHTML = `<span class="pkcount${t === M.PACK_SIZE ? ' ok' : ''}">${t} / ${M.PACK_SIZE}</span>`;
    done.disabled = t !== M.PACK_SIZE;
    list.innerHTML = '';
    f.collection.forEach(([k, max]) => {
      const c = Object.assign({ key: k, charms: [] }, M.CATALOG[k]); const n = counts[k] || 0;
      const row = h('div', 'pkrow' + (n ? ' on' : ''));
      row.innerHTML = `<div class="pkart">${cardArt(c)}</div><div class="pkinfo"><b>${c.name}</b><small>${c.text || (c.kind === 'block' ? M.TYPE_NAME[c.type] + ' · ' + M.TYPE_RULES[c.type].bonus : '')}</small></div>`;
      const ctl = h('div', 'pkctl'); const minus = h('button', 'pkbtn', '−'); const num = h('span', 'pknum', n); const plus = h('button', 'pkbtn', '+');
      minus.disabled = n <= 0; plus.disabled = n >= max || total() >= M.PACK_SIZE;
      minus.addEventListener('click', () => { counts[k] = n - 1; refresh(); }); plus.addEventListener('click', () => { counts[k] = n + 1; refresh(); });
      ctl.appendChild(minus); ctl.appendChild(num); ctl.appendChild(plus); ctl.appendChild(h('small', 'pkmax', 'of ' + max)); row.appendChild(ctl); list.appendChild(row);
    });
  }
  reset.addEventListener('click', () => { Object.keys(counts).forEach(k => delete counts[k]); f.pack.forEach(([k, n]) => counts[k] = n); refresh(); });
  done.addEventListener('click', () => { const pack = Object.entries(counts).filter(([k, n]) => n > 0); try { localStorage.setItem('mcd-pack-' + f.id, JSON.stringify(pack)); } catch {} onDone(pack); });
  refresh();
  const foot = h('div'); foot.appendChild(reset); foot.appendChild(done); sheet.appendChild(foot);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'deck';
}
function showSetup() {
  humanView = 0; passPending = false; selected = null; lastCounts = null; lastHandSig = ''; lastMoney = null; lastRound = 0; lastTier = null; splashRound = 0; lastPiles = null;
  const sheet = h('div', 'sheet');
  sheet.appendChild(h('h2', null, 'Pick your developer'));
  sheet.appendChild(h('p', null, 'Each one brings ten cards into the shared pool. Your rival can draft them too.'));
  const ch = h('div', 'choices'); ch.style.flexDirection = 'column'; let firm = null; const opts = [];
  M.FIRMS.forEach(f => { const o = devOption(f, (ff, el) => { firm = ff.id; opts.forEach(x => x.classList.toggle('sel', x === el)); start.disabled = false; }); opts.push(o); ch.appendChild(o); });
  sheet.appendChild(ch);
  const start = h('button', 'btn big', 'Pick your ten'); start.disabled = true; start.style.width = '100%'; start.style.marginTop = '8px';
  start.addEventListener('click', () => {
    settings.freeBuilds = false; settings.finisherBonus = 6; saveSettings();
    const f = M.FIRMS.find(x => x.id === firm);
    showDeckPicker(f, pack => {
      g = M.newGame({ opponent: settings.opponent, freeBuilds: settings.freeBuilds, finisherBonus: settings.finisherBonus });
      M.chooseFirm(g, 0, firm, pack);
      const others = M.FIRMS.filter(x => x.id !== firm);
      if (settings.opponent === 'hotseat') { $('overlay').innerHTML = ''; overlayKey = null; showFirm2(others); return; }
      M.chooseFirm(g, 1, others[Math.floor(Math.random() * others.length)].id);
      M.finishSetup(g); $('overlay').innerHTML = ''; overlayKey = null; render();
      setTimeout(() => { try { if (!localStorage.getItem('mcd-hint-zones')) { toast('Plot icons are zoning rules. Tap a plot to read it.'); localStorage.setItem('mcd-hint-zones', '1'); } } catch {} }, 2400);
    });
  });
  sheet.appendChild(start);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'setup';
}
function showFirm2(others) {
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, 'Player 2: pick your developer'));
  const ch = h('div', 'choices'); ch.style.flexDirection = 'column';
  others.forEach(f => ch.appendChild(devOption(f, ff => showDeckPicker(ff, pack => { M.chooseFirm(g, 1, ff.id, pack); M.finishSetup(g); $('overlay').innerHTML = ''; overlayKey = null; render(); }))));
  sheet.appendChild(ch); $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet));
}

// ---------- rules & log ----------
$('setBtn').addEventListener('click', () => {
  if (overlayKey === 'settings') { $('overlay').innerHTML = ''; overlayKey = null; render(); return; }
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, 'How it works'));
  sheet.innerHTML += `<p>Each round: event → income → draw 5 → build → draft 1 of 3 → discard hand.<br><br>
  <b>Crews.</b> A block card builds one floor and returns to your discard. A card with nowhere to go can be subcontracted: pay $1, discard it, draw a card.<br>
  <b>Caps</b> are one-shot and need ${g ? g.settings.capMin : 2}+ floors. They cost $2, plus $1 per 2 floors above the 2nd, minus $1 per Civic floor you own. No height limit (except H3 plots), but every floor above the 3rd costs $1 more. A tower takes 1 floor per turn; a Tower Crane lets it take 2.<br>
  <b>Money.</b> You earn $2 a turn plus rent. Only finished towers collect rent: cap a tower and its floors start paying.<br>
  <b>Streamline.</b> Every reshuffle you retire one card from the draw pile, but never below ${M.DECK_FLOOR} cards in total.<br>
  <b>Market.</b> Tap Market during your turn to see what you can draft at the end of it. The permit office always sells a Flat Roof for $5.<br>
  <b>Reputation.</b> Points banked in finished towers set your tier (tap the badge). Tiers unlock perks and power up prestige-sensitive cards (◈).<br>
  <b>HQ.</b> HQ cards leave your deck and sit above your block with a permanent effect. One slot to start; Respected and Iconic unlock two more.<br>
  <b>Materials.</b> Floors are Glass, Brick or Stone (the badge on the card and the frame colour). Glass builds tall: no height surcharge. Brick is sturdy: ignores Tremor and Heat Wave. Stone carries weight: each Stone floor makes the cap $1 cheaper. A finished tower built all in one material scores +1★ per floor.<br>
  <b>Placement.</b> Retail: ground floor only. Hotel: always the top floor. Retail +$1 per neighbouring Residential tower, Office +$1 next to Office, Hotel +2★ next to Retail, Residential +1★ next to Civic.<br>
  <b>Zones</b> show as an icon on the plot (tap a plot to read it; same map for both): house = Residential zone, ground floor must be Residential · shop = Commercial zone, ground floor must be Office or Retail · 3 under a bar = height limit 3 · star = Landmark site, needs 3+ floors to cap, cap +3 · train = Transit hub, floors cost $1 less · no icon = open lot.<br>
  <b>End.</b> Cap your 6th tower; the rival gets one last turn. Score = finished towers (floors + neighbour bonuses + cap) + bounty + finisher bonus. Unfinished towers and leftover money score nothing.</p>`;
  const b = h('button', 'btn ghost', 'New game'); b.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; showSetup(); }); sheet.appendChild(b);
  const c = h('button', 'btn', 'Close'); c.style.marginLeft = '8px'; c.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(c);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'settings';
});
$('logBtn').addEventListener('click', () => {
  if (!g) return;
  if (overlayKey === 'log') { $('overlay').innerHTML = ''; overlayKey = null; render(); return; }
  const sheet = h('div', 'sheet'); sheet.appendChild(h('h2', null, 'Log'));
  sheet.appendChild(h('div', 'log', g.log.slice(-25).join('\n')));
  const c = h('button', 'btn', 'Close'); c.style.marginTop = '8px'; c.addEventListener('click', () => { $('overlay').innerHTML = ''; overlayKey = null; render(); }); sheet.appendChild(c);
  $('overlay').innerHTML = ''; $('overlay').appendChild(wrap(sheet)); overlayKey = 'log';
});

document.getElementById('ver').textContent = 'v' + __APP_VERSION__ + (import.meta.env.DEV ? ' dev' : '');
showHome();

