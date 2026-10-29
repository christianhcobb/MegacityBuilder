// All card, developer, bounty, event, zone and tier data. Adding content usually means editing only this file.
import { countType, countLook, typeSet } from './board.js';

// --- Card catalogue ---
// kind: block | cap | ops | int.  type for blocks: R residential, O office, S retail, H hotel, C civic
export const CATALOG = {
  studio:   { name: 'Studio Apartments', kind: 'block', type: 'R', look: 'brick', cost: 1, rev: 1, pts: 1 },
  condo:    { name: 'Luxury Condos',     kind: 'block', type: 'R', look: 'stone', cost: 3, rev: 0, pts: 2, ps: { pts: 1 } },
  office:   { name: 'Open Office',       kind: 'block', type: 'O', look: 'glass', cost: 2, rev: 1, pts: 1 },
  corner:   { name: 'Corner Office',     kind: 'block', type: 'O', look: 'glass', cost: 3, rev: 1, pts: 2 },
  foodhall: { name: 'Food Hall',         kind: 'block', type: 'S', look: 'brick', cost: 2, rev: 1, pts: 1 },
  hotel:    { name: 'Boutique Hotel',    kind: 'block', type: 'H', look: 'stone', cost: 3, rev: 0, pts: 2, ps: { rev: 1 } },
  library:  { name: 'Library',           kind: 'block', type: 'C', look: 'stone', cost: 2, rev: 0, pts: 3 },
  clinic:   { name: 'Clinic',            kind: 'block', type: 'C', look: 'glass', cost: 2, rev: 0, pts: 2 },
  skygarden:{ name: 'Sky Garden Lobby',  kind: 'block', type: 'C', look: 'glass', cost: 3, rev: 0, pts: 1, text: 'Neighbouring towers score +2★ when capped.' },
  megamall: { name: 'Mega Mall',         kind: 'block', type: 'S', look: 'brick', cost: 4, rev: 1, pts: 1, text: 'Ground floor only. Earns $1 per Residential floor in neighbouring towers.' },
  headline: { name: 'Headline Tenant',   kind: 'block', type: 'O', look: 'glass', cost: 4, rev: 1, pts: 0, ps: { rev: 1 }, text: '+3★ if it is the top floor when capped.' },

  flatroof: { name: 'Flat Roof',         kind: 'cap', pts: 1, text: 'No bonus. Gets the job done.' },
  garden:   { name: 'Rooftop Garden',    kind: 'cap', pts: 1, text: '+2 per Residential block below' },
  deck:     { name: 'Observation Deck',  kind: 'cap', pts: 0, text: '+1 per block below' },
  helipad:  { name: 'Helipad',           kind: 'cap', pts: 1, text: '+4 if every block is the same type' },
  skybridge:{ name: 'Skybridge',         kind: 'cap', pts: 1, text: '+3 if 3 or more block types' },
  penthouse:{ name: 'Penthouse',         kind: 'cap', pts: 1, ps: { pts: 1 }, text: '+3 if top block is Hotel or Residential' },
  spire:    { name: 'Spire',             kind: 'cap', pts: 2, text: '+4 if tallest capped building in the city' },
  rooftopbar:{ name: 'Rooftop Bar',      kind: 'cap', pts: 0, ps: { pts: 1 }, text: '+1★ per Hotel floor in the whole city, both players' },
  landmark: { name: 'Landmark Status',   kind: 'cap', pts: 0, text: 'Needs 5+ floors. +2★ per floor' },

  grant:    { name: 'City Grant',        kind: 'ops', ps: { money: 1 }, text: '+$3' },
  permit:   { name: 'Permit Expediter',  kind: 'ops', text: 'Draw 2 cards' },
  siteoffice:{ name: 'Site Office',      kind: 'ops', text: '+$1 income every turn for the rest of the game. Removed after use.' },
  survey:   { name: 'Market Survey',     kind: 'ops', text: 'Send the current market back into the pool and reveal fresh cards for your draft this turn.' },
  headhunt: { name: 'Headhunter',        kind: 'ops', text: 'Draft an extra card this turn' },
  audit:    { name: 'Operational Efficiencies', kind: 'ops', text: 'Remove a card in your hand from the game' },
  presale:  { name: 'Pre-Sale',          kind: 'ops', text: 'Gain $1 per floor on your tallest unfinished tower' },
  demolish: { name: 'Demolition Crew',   kind: 'ops', target: 'plot', text: 'Remove the top floor of one of your towers. Refund $2.' },
  tunnel:   { name: 'Tunnel Boring',     kind: 'ops', target: 'plot', text: 'Swap the positions of two of your towers. Zones stay put.' },
  unionhall:   { name: 'Union Hall',     kind: 'hq', text: 'HQ: gain $2 whenever you finish a tower.' },
  designstudio:{ name: 'Design Studio',  kind: 'hq', text: 'HQ: your Residential floors score +1★.' },
  pressoffice: { name: 'Press Office',   kind: 'hq', text: 'HQ: gain $1 whenever you draft a card.' },
  glassworks:  { name: 'Glassworks',     kind: 'hq', text: 'HQ: Glass floors cost $1 less.' },
  heritage:    { name: 'Heritage Trust', kind: 'hq', text: 'HQ: finished Stone towers score +1★ per floor.' },
  lobbyist:    { name: 'Lobbyist',       kind: 'hq', text: 'HQ: the rival\'s interference cards do not affect you.' },
  poach:    { name: 'Poach',             kind: 'int', text: 'Take the top card of the rival\'s discard pile into yours. One use.' },
  crane:    { name: 'Tower Crane',       kind: 'ops', target: 'plot', text: 'Put a crane on a tower. It takes 2 blocks a turn for the rest of the game.' },

  inspect:  { name: 'Inspection',        kind: 'int', text: 'Opponent income -2 next turn' },
  zoning:   { name: 'Zoning Challenge',  kind: 'int', text: 'Opponent cannot cap on their next turn' },
};
export const CHARMS = {
  lease:    { name: 'Leasing Agent',   text: '+1 revenue' },
  architect:{ name: 'Architect',       text: '+1 prestige' },
  foreman:  { name: 'Foreman',         text: 'Costs 1 less' },
  variance: { name: 'Zoning Variance', text: 'Ignores ground-floor zone rules' },
  expedite: { name: 'Expediter',       text: 'Returns to the top of your deck after play' },
};
export const LOOKS = {
  glass: { name: 'Glass', trait: 'Builds tall: no extra cost for height.' },
  brick: { name: 'Brick', trait: 'Sturdy: ignores Tremor and Heat Wave.' },
  stone: { name: 'Stone', trait: 'Carries weight: each Stone floor makes the cap $1 cheaper.' },
};
// Reputation tiers. Prestige = points banked in finished towers (base, before prestige-sensitive bonuses).
export const TIERS = [
  { at: 0,  name: 'Unknown',   perk: '' },
  { at: 6,  name: 'Noticed',   perk: 'The market shows 4 cards.' },
  { at: 12, name: 'Respected', perk: 'Caps cost $1 less.' },
  { at: 18, name: 'Renowned',  perk: 'Hand size 6.' },
  { at: 26, name: 'Iconic',    perk: 'Finished towers earn +$1 rent each.' },
];
export const TYPE_NAME = { R: 'Residential', O: 'Office', S: 'Retail', H: 'Hotel', C: 'Civic' };
// Placement rules. Types carry a vertical rule and an adjacency bonus; plots carry a zone.
export const TYPE_RULES = {
  R: { rule: 'Any floor.', bonus: '+1 prestige if a neighbouring tower has Civic.' },
  O: { rule: 'Any floor.', bonus: 'Tower earns +$1 if a neighbouring tower has Office.' },
  S: { rule: 'Ground floor only.', bonus: '+1 revenue per neighbouring tower with Residential.' },
  H: { rule: 'Always the top floor: nothing builds above it.', bonus: '+2 prestige if a neighbouring tower has Retail.' },
  C: { rule: 'Any floor.', bonus: 'Each Civic floor you own makes your caps cost $1 less.' },
};
export const ZONES = {
  open:     { name: 'Open lot',          short: '',    text: 'No restriction.' },
  resi:     { name: 'Residential zone',  short: 'RES', text: 'Ground floor must be Residential.' },
  comm:     { name: 'Commercial zone',   short: 'COM', text: 'Ground floor must be Office or Retail.' },
  low:      { name: 'Height limit',      short: 'H3',  text: 'Max 3 blocks.' },
  landmark: { name: 'Landmark site',     short: 'LMK', text: 'Needs 3+ blocks to cap. Cap scores +3.' },
  transit:  { name: 'Transit hub',       short: 'TRN', text: 'Blocks here cost 1 less.' },
};
export const MAP_ZONES = ['resi', 'comm', 'low', 'landmark', 'transit', 'open'];

export const BASE_DECK = [
  ['studio', 6], ['condo', 4], ['office', 6], ['corner', 3], ['foodhall', 4], ['hotel', 3], ['library', 3], ['clinic', 2],
  ['flatroof', 5], ['garden', 2], ['deck', 2], ['helipad', 1], ['spire', 1],
  ['grant', 2], ['permit', 2], ['siteoffice', 2], ['crane', 3], ['survey', 1], ['zoning', 1], ['inspect', 1],
  ['presale', 2], ['demolish', 1], ['poach', 1], ['rooftopbar', 1], ['megamall', 1],
  ['unionhall', 1], ['pressoffice', 1], ['glassworks', 1],
];
export const STARTER = [['studio', 3], ['office', 3], ['foodhall', 1], ['flatroof', 1], ['garden', 1], ['grant', 1]];

// Developers: a person, a specialty (passive), and the 10 cards they bring to the shared pool.
export const PACK_SIZE = 10;
export const FIRMS = [
  { id: 'harlow',  name: 'Ines Harlow',  tag: 'Housing developer',  passive: 'Residential blocks cost 1 less.',
    collection: [['condo', 3], ['studio', 3], ['garden', 2], ['penthouse', 2], ['grant', 2], ['landmark', 1], ['tunnel', 1], ['presale', 1], ['designstudio', 1]],
    pack: [['condo', 3], ['studio', 1], ['garden', 2], ['penthouse', 2], ['grant', 2]] },
  { id: 'kessler', name: 'Dov Kessler',  tag: 'Commercial builder', passive: 'Office blocks score +1 prestige.',
    collection: [['corner', 3], ['foodhall', 2], ['deck', 2], ['helipad', 1], ['crane', 2], ['headhunt', 2], ['headline', 1], ['megamall', 1], ['lobbyist', 1]],
    pack: [['corner', 3], ['foodhall', 1], ['deck', 2], ['helipad', 1], ['crane', 1], ['headhunt', 2]] },
  { id: 'okafor',  name: 'Ade Okafor',   tag: 'Civic planner',      passive: 'Civic floors also earn $1.',
    collection: [['library', 3], ['clinic', 2], ['skybridge', 2], ['spire', 1], ['siteoffice', 2], ['inspect', 1], ['audit', 1], ['skygarden', 1], ['tunnel', 1], ['heritage', 1]],
    pack: [['library', 2], ['clinic', 2], ['skybridge', 2], ['spire', 1], ['siteoffice', 1], ['inspect', 1], ['audit', 1]] },
];
export function validPack(f, pack) { const n = pack.reduce((a, [k, c]) => a + c, 0); if (n !== PACK_SIZE) return false; return pack.every(([k, c]) => { const m = f.collection.find(x => x[0] === k); return m && c >= 0 && c <= m[1]; }); }

export const BOUNTIES = [
  { id: 'resi',  name: 'Housing First',  text: '6 or more Residential blocks standing', pts: 5, check: p => countType(p, 'R') >= 6 },
  { id: 'tall',  name: 'Tall Order',     text: 'A capped building 6 or more floors high', pts: 6, check: p => p.plots.some(pl => pl.cap && pl.blocks.length >= 6) },
  { id: 'mixed', name: 'Mixed Use',      text: '3 capped buildings with 2 or more block types each', pts: 5, check: p => p.plots.filter(pl => pl.cap && typeSet(pl).size >= 2).length >= 3 },
  { id: 'cash',  name: 'Cash Rich',      text: '12 or more money at game end', pts: 4, check: p => p.money >= 12 },
  { id: 'civic', name: 'Civic Minded',   text: '3 or more Civic blocks standing', pts: 4, check: p => countType(p, 'C') >= 3 },
  { id: 'landlord', name: 'Landlord',    text: 'Every plot has at least 2 blocks', pts: 5, check: p => p.plots.every(pl => pl.blocks.length >= 2) },
];

// Events. late: true means they sit in the bottom half of the event deck (the clock).
export const EVENTS = [
  { id: 'boom',     name: 'Construction Boom', mood: 'good', text: 'Both developers gain $5.', apply: g => g.players.forEach(p => p.money += 5) },
  { id: 'recess',   name: 'Recession',         mood: 'bad',  text: 'No rent this round. Everyone gets the base $2 only.', mods: { noRent: true } },
  { id: 'heat',     name: 'Heat Wave',         mood: 'bad',  text: 'Glass is an oven. Lose $1 per Glass floor (max $5). Brick shrugs it off.', apply: g => g.players.forEach(p => p.money = Math.max(0, p.money - Math.min(5, countLook(p, 'glass')))) },
  { id: 'festival', name: 'Street Festival',   mood: 'good', text: 'Gain $2 per Retail floor.', apply: g => g.players.forEach(p => p.money += 2 * countType(p, 'S')) },
  { id: 'tourism',  name: 'Tourism Surge',     mood: 'good', text: 'Gain $3 per Hotel floor.', apply: g => g.players.forEach(p => p.money += 3 * countType(p, 'H')) },
  { id: 'fair',     name: 'Talent Fair',       mood: 'shop', text: 'Specialists are hiring. Pay $2 to embed one in a card in your hand.', mods: { charm: true } },
  { id: 'fair2',    name: 'Talent Fair',       mood: 'shop', text: 'Specialists are hiring. Pay $2 to embed one in a card in your hand.', mods: { charm: true } },
  { id: 'strike',   name: 'Transit Strike',    mood: 'bad',  text: 'Floors cost $2 more this round.', mods: { costDelta: 2 } },
  { id: 'housing',  name: 'Housing Push',      mood: 'good', text: 'Residential floors are free this round.', mods: { resDelta: -9 } },
  { id: 'taxhol',   name: 'Tax Holiday',       mood: 'good', text: 'Caps are free this round.', mods: { freeCaps: true } },
  { id: 'shortage', name: 'Materials Shortage',mood: 'bad',  text: 'Cranes are idle this round: 1 floor per tower.', mods: { noCrane: true } },
  { id: 'quake',    name: 'Tremor',            mood: 'bad',  text: 'Every unfinished tower 4 or more floors high loses its top floor, unless that floor is Brick.', apply: g => g.players.forEach(p => p.plots.forEach(pl => { if (!pl.cap && pl.blocks.length >= 4 && pl.blocks[pl.blocks.length - 1].look !== 'brick') pl.blocks.pop(); })) },
  { id: 'rezone',   name: 'Rezoning',          mood: 'bad',  text: 'The council redraws one plot. Its zone changes for both developers.', apply: g => { const i = Math.floor(g.rng() * 6); const cur = g.players[0].plots[i].zone; const pool = Object.keys(ZONES).filter(z => z !== cur); const z = pool[Math.floor(g.rng() * pool.length)]; g.players.forEach(p => p.plots[i].zone = z); g.event = Object.assign({}, g.event, { text: `Plot ${i + 1} is now ${ZONES[z].name}: ${ZONES[z].text}` }); } },
  { id: 'calm',     name: 'Quiet Quarter',     mood: 'calm', text: 'Nothing happens. Build.' },
  { id: 'tax',      name: 'Tax Season',        mood: 'bad',  late: true, text: 'Both developers lose half their money.', apply: g => g.players.forEach(p => p.money = Math.ceil(p.money / 2)) },
  { id: 'final',    name: 'Final Inspections', mood: 'good', late: true, text: 'Finished towers score +2★ each at game end.', apply: g => g.players.forEach(p => p.capBonus += 2) },
  { id: 'deadline', name: 'Council Deadline',  mood: 'bad',  late: true, text: 'Unfinished towers cost $2 each in fines.', apply: g => g.players.forEach(p => p.money = Math.max(0, p.money - 2 * p.plots.filter(pl => !pl.cap && pl.blocks.length).length)) },
  { id: 'grandop',  name: 'Grand Opening',     mood: 'good', late: true, text: 'Gain $3 per finished tower.', apply: g => g.players.forEach(p => p.money += 3 * p.plots.filter(pl => pl.cap).length) },
];
