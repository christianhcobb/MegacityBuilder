// All card, developer, bounty, event, zone and tier data. Adding content usually means editing only this file.
import { countType, countLook, typeSet } from './board.js';

// --- Card catalogue ---
// kind: block | cap | ops | int.  type for blocks: R residential, O office, S retail, H hotel, C civic
export const CATALOG = {
  studio: { name: 'Studio Apartments', kind: 'block', type: 'R', look: 'brick', cost: 1, rev: 1, pts: 1 },
  condo: { name: 'Luxury Condos', kind: 'block', type: 'R', look: 'stone', cost: 3, rev: 0, pts: 2, ps: { pts: 1 } },
  office: { name: 'Open Office', kind: 'block', type: 'O', look: 'glass', cost: 2, rev: 1, pts: 1 },
  corner: { name: 'Corner Office', kind: 'block', type: 'O', look: 'glass', cost: 3, rev: 1, pts: 2 },
  foodhall: { name: 'Food Hall', kind: 'block', type: 'S', look: 'brick', cost: 2, rev: 1, pts: 1 },
  hotel: { name: 'Boutique Hotel', kind: 'block', type: 'H', look: 'stone', cost: 3, rev: 0, pts: 2, ps: { rev: 1 } },
  library: { name: 'Library', kind: 'block', type: 'C', look: 'stone', cost: 2, rev: 0, pts: 3 },
  clinic: { name: 'Clinic', kind: 'block', type: 'C', look: 'glass', cost: 2, rev: 0, pts: 2 },
  skygarden: { name: 'Sky Garden Lobby', kind: 'block', type: 'C', look: 'glass', cost: 3, rev: 0, pts: 1, text: 'Neighbouring towers score +2★ when capped.' },
  megamall: {
    name: 'Mega Mall',
    kind: 'block',
    type: 'S',
    look: 'brick',
    cost: 4,
    rev: 1,
    pts: 1,
    text: 'Ground floor only. Earns $1 per Residential floor in neighbouring towers.',
  },
  headline: {
    name: 'Headline Tenant',
    kind: 'block',
    type: 'O',
    look: 'glass',
    cost: 4,
    rev: 1,
    pts: 0,
    ps: { rev: 1 },
    text: '+3★ if it is the top floor when capped.',
  },
  cowork: { name: 'Co-working Hub', kind: 'block', type: 'O', look: 'glass', cost: 3, rev: 1, pts: 0, text: '+1★ per other Office floor in this tower.' },
  community: {
    name: 'Community Centre',
    kind: 'block',
    type: 'C',
    look: 'brick',
    cost: 3,
    rev: 0,
    pts: 1,
    text: '+1★ per Residential floor in neighbouring towers (max 3).',
  },
  bazaar: {
    name: 'Grand Bazaar',
    kind: 'block',
    type: 'S',
    look: 'stone',
    cost: 3,
    rev: 1,
    pts: 1,
    text: 'Earns +$1 per other Retail floor in the whole city, both players.',
  },
  convention: { name: 'Convention Hotel', kind: 'block', type: 'H', look: 'glass', cost: 4, rev: 0, pts: 2, text: '+1★ per Office floor below it.' },
  // v1.2 floors: stranger interactions. Realism is optional.
  mirror: { name: 'Mirror Hall', kind: 'block', type: 'O', look: 'glass', cost: 3, rev: 0, pts: 0, text: 'Copies the $ and ★ of the floor below it.' },
  atrium: { name: 'Glass Atrium', kind: 'block', type: 'C', look: 'glass', cost: 2, rev: 0, pts: 1, text: 'Every floor built above it costs $1 less.' },
  datacenter: {
    name: 'Data Centre',
    kind: 'block',
    type: 'O',
    look: 'brick',
    cost: 3,
    rev: 3,
    pts: 0,
    text: 'Earns $3. −1★ per neighbouring tower with Residential.',
  },
  casino: { name: 'Casino', kind: 'block', type: 'S', look: 'stone', cost: 4, rev: 0, pts: 1, fx: 'dice', text: 'Each income, flip a coin: +$5 or nothing.' },
  nightmarket: {
    name: 'Night Market',
    kind: 'block',
    type: 'S',
    look: 'brick',
    cost: 2,
    rev: 1,
    pts: 1,
    text: "Also earns $1 at the start of the rival's turn.",
  },
  arcology: {
    name: 'Arcology Pod',
    kind: 'block',
    type: 'R',
    look: 'glass',
    cost: 4,
    rev: 0,
    pts: 2,
    text: 'Counts as 2 floors for cap height and Tall Order.',
  },
  loft: { name: 'Artist Lofts', kind: 'block', type: 'R', look: 'brick', cost: 2, rev: 0, pts: 1, text: '+2★ if this tower has 3 or more types.' },
  parking: { name: 'Parking Deck', kind: 'block', type: 'C', look: 'stone', cost: 1, rev: 0, pts: 0, ground: true, text: 'Earns $1 per 2 floors above it.' },
  lobby: { name: 'Grand Lobby', kind: 'block', type: 'C', look: 'stone', cost: 2, rev: 0, pts: 1, ground: true, text: '+1★ per floor above it (max 4).' },
  streetmarket: {
    name: 'Street Market',
    kind: 'block',
    type: 'S',
    look: 'brick',
    cost: 1,
    rev: 1,
    pts: 0,
    text: "Neighbouring towers' ground floors earn +$1.",
  },
  lucky: {
    name: 'Lucky Dragon Diner',
    kind: 'block',
    type: 'S',
    look: 'brick',
    cost: 2,
    rev: 1,
    pts: 0,
    fx: 'dice',
    text: 'When built: roll. 1–3 gain $2, 4–6 gain $5.',
  },

  flatroof: { name: 'Flat Roof', kind: 'cap', pts: 1, text: 'No bonus. Gets the job done.' },
  garden: { name: 'Rooftop Garden', kind: 'cap', pts: 1, text: '+2 per Residential block below' },
  deck: { name: 'Observation Deck', kind: 'cap', pts: 0, text: '+1 per block below' },
  helipad: { name: 'Helipad', kind: 'cap', pts: 1, text: '+4 if every block is the same type' },
  skybridge: { name: 'Skybridge', kind: 'cap', pts: 1, text: '+3 if 3 or more block types' },
  penthouse: { name: 'Penthouse', kind: 'cap', pts: 1, ps: { pts: 1 }, text: '+3 if top block is Hotel or Residential' },
  spire: { name: 'Spire', kind: 'cap', pts: 2, text: '+4 if tallest capped building in the city' },
  rooftopbar: { name: 'Rooftop Bar', kind: 'cap', pts: 0, ps: { pts: 1 }, text: '+1★ per Hotel floor in the whole city, both players' },
  landmark: { name: 'Landmark Status', kind: 'cap', pts: 0, text: 'Needs 5+ floors. +2★ per floor' },
  billboard: { name: 'Billboard', kind: 'cap', pts: 0, text: '+2★ per neighbouring tower with Retail' },
  solar: { name: 'Solar Array', kind: 'cap', pts: 1, text: '+1★ per Glass floor below. Immune to Heat Wave.' },

  grant: { name: 'City Grant', kind: 'ops', ps: { money: 1 }, text: '+$3' },
  permit: { name: 'Permit Expediter', kind: 'ops', text: 'Draw 2 cards' },
  siteoffice: { name: 'Site Office', kind: 'ops', text: '+$1 income every turn for the rest of the game. Removed after use.' },
  survey: { name: 'Market Survey', kind: 'ops', text: 'Send the current market back into the pool and reveal fresh cards for your draft this turn.' },
  headhunt: { name: 'Headhunter', kind: 'ops', text: 'Draft an extra card this turn' },
  audit: { name: 'Operational Efficiencies', kind: 'ops', text: 'Remove a card in your hand from the game' },
  presale: { name: 'Pre-Sale', kind: 'ops', text: 'Gain $1 per floor on your tallest unfinished tower' },
  demolish: { name: 'Demolition Crew', kind: 'ops', target: 'plot', text: 'Remove the top floor of one of your towers. Refund $2.' },
  tunnel: { name: 'Tunnel Boring', kind: 'ops', target: 'plot', text: 'Swap the positions of two of your towers. Zones stay put.' },
  unionhall: { name: 'Union Hall', kind: 'hq', text: 'HQ: gain $3 whenever you finish a tower.' },
  designstudio: { name: 'Design Studio', kind: 'hq', text: 'HQ: your Residential floors score +1★.' },
  pressoffice: { name: 'Press Office', kind: 'hq', text: 'HQ: gain $1 whenever you draft a card.' },
  glassworks: { name: 'Glassworks', kind: 'hq', text: 'HQ: Glass floors cost $1 less.' },
  heritage: { name: 'Heritage Trust', kind: 'hq', text: 'HQ: finished Stone towers score +1★ per floor.' },
  lobbyist: { name: 'Lobbyist', kind: 'hq', text: "HQ: the rival's interference cards do not affect you." },
  poach: { name: 'Poach', kind: 'int', text: "Take the top card of the rival's discard pile into yours. One use." },
  crane: { name: 'Tower Crane', kind: 'ops', target: 'plot', text: 'Put a crane on a tower. It takes 2 blocks a turn for the rest of the game.' },
  elevator: { name: 'Express Elevator', kind: 'ops', target: 'plot', text: 'One tower may take a second floor this turn.' },
  windfall: { name: 'Windfall', kind: 'ops', fx: 'dice', text: 'Roll: gain $1 to $6.' },
  // Developer signature HQs: installed from the start. The developer's specialty, made visible.
  hq_harlow: { name: 'Housing Dept', kind: 'hq', signature: true, text: 'HQ: Residential floors cost $1 less.' },
  hq_kessler: { name: 'Leasing Dept', kind: 'hq', signature: true, text: 'HQ: Office floors score +1★.' },
  hq_okafor: { name: 'Planning Dept', kind: 'hq', signature: true, text: 'HQ: Civic floors also earn $1.' },
  treasury: { name: 'Treasury', kind: 'hq', text: 'HQ: banked money scores 1★ per $6 instead of $10.' },

  inspect: { name: 'Inspection', kind: 'int', text: 'Opponent income -2 next turn' },
  zoning: { name: 'Zoning Challenge', kind: 'int', text: 'Opponent cannot cap on their next turn' },
};
// Charms (specialists). for: which cards they can join. Offered 3 at a time at a Talent Fair, each at its own price.
export const CHARMS = {
  lease: { name: 'Leasing Agent', for: 'block', text: '+$1 rent.' },
  architect: { name: 'Architect', for: 'block', text: '+1★.' },
  foreman: { name: 'Foreman', for: 'block', text: 'Costs $1 less.' },
  variance: { name: 'Zoning Variance', for: 'block', text: 'Ignores ground-floor zone rules.' },
  expedite: { name: 'Expediter', for: 'any', text: 'Retain: returns to the top of your deck after play.' },
  anchor: { name: 'Anchor Tenant', for: 'S', text: 'Retail: +$2 rent once something is built above it.' },
  concierge: { name: 'Concierge', for: 'H', text: 'Hotel: +1★ per floor below it.' },
  boardroom: { name: 'Boardroom', for: 'O', text: 'Office: +$1 rent per neighbouring tower with Office.' },
  super: { name: 'Superintendent', for: 'R', text: 'Residential: +1★ per other Residential floor in the tower (max 3).' },
  grantwriter: { name: 'Grant Writer', for: 'C', text: 'Civic: gain $3 when built.' },
  prefab: { name: 'Prefab Kit', for: 'block', text: 'Can be built on a tower that already took a floor this turn.' },
  gilded: { name: 'Gilder', for: 'cap', text: 'Cap: +2★.' },
  tenured: { name: 'Tenured Crew', for: 'block', text: 'Prestige: +1★ per reputation tier.' },
  gambler: { name: 'Gambler', for: 'block', text: 'When built: flip a coin, +$4 or nothing.' },
};
export const LOOKS = {
  glass: { name: 'Glass', trait: 'Builds tall: no extra cost for height.' },
  brick: { name: 'Brick', trait: 'Sturdy: ignores Tremor and Heat Wave.' },
  stone: { name: 'Stone', trait: 'Carries weight: each Stone floor makes the cap $1 cheaper.' },
};
// Reputation tiers. Prestige = points banked in finished towers (base, before prestige-sensitive bonuses).
export const TIERS = [
  { at: 0, name: 'Unknown', perk: '' },
  { at: 8, name: 'Noticed', perk: 'The market shows 4 cards.' },
  { at: 18, name: 'Respected', perk: 'Caps cost $1 less.' },
  { at: 30, name: 'Renowned', perk: 'Hand size 6.' },
  { at: 44, name: 'Iconic', perk: 'Finished towers earn +$1 rent each.' },
];
export const TYPE_NAME = { R: 'Residential', O: 'Office', S: 'Retail', H: 'Hotel', C: 'Civic' };
// Placement rules. Types carry a vertical rule and an adjacency bonus; plots carry a zone.
export const BANK_RATE = 10; // $ per 1★ of banked money at game end
export const TYPE_RULES = {
  R: { rule: '', bonus: '+1★ next to Civic. +1★ above Retail or Civic.' },
  O: { rule: '', bonus: 'Tower earns +$1 next to Office. Retail below it earns +$1.' },
  S: { rule: 'Ground floor only.', bonus: '+$1 per neighbouring Residential tower. +$1 with Office above.' },
  H: { rule: 'Always the top floor.', bonus: '+2★ next to Retail. +2★ above Office.' },
  C: { rule: '', bonus: 'Caps cost $1 less per Civic floor you own. Residential above it +1★.' },
};
export const ZONES = {
  open: { name: 'Open lot', short: '', text: 'No restriction.' },
  resi: { name: 'Residential zone', short: 'RES', text: 'Ground floor must be Residential.' },
  comm: { name: 'Commercial zone', short: 'COM', text: 'Ground floor must be Office or Retail.' },
  low: { name: 'Height limit', short: 'H3', text: 'Max 3 blocks.' },
  landmark: { name: 'Landmark site', short: 'LMK', text: 'Needs 3+ blocks to cap. Cap scores +3.' },
  transit: { name: 'Transit hub', short: 'TRN', text: 'Blocks here cost 1 less.' },
};
export const MAP_ZONES = ['resi', 'comm', 'low', 'landmark', 'transit', 'open'];

export const BASE_DECK = [
  ['studio', 3],
  ['condo', 2],
  ['office', 3],
  ['corner', 2],
  ['foodhall', 2],
  ['hotel', 3],
  ['library', 2],
  ['clinic', 2],
  ['flatroof', 3],
  ['garden', 2],
  ['deck', 2],
  ['helipad', 1],
  ['spire', 1],
  ['billboard', 1],
  ['solar', 1],
  ['grant', 2],
  ['permit', 2],
  ['siteoffice', 2],
  ['crane', 2],
  ['elevator', 2],
  ['windfall', 2],
  ['survey', 1],
  ['zoning', 1],
  ['inspect', 1],
  ['presale', 2],
  ['demolish', 1],
  ['poach', 1],
  ['rooftopbar', 1],
  ['megamall', 1],
  ['unionhall', 1],
  ['pressoffice', 1],
  ['glassworks', 1],
  ['treasury', 1],
  ['cowork', 2],
  ['community', 1],
  ['bazaar', 1],
  ['convention', 1],
  ['mirror', 2],
  ['atrium', 2],
  ['datacenter', 1],
  ['casino', 1],
  ['nightmarket', 2],
  ['arcology', 1],
  ['loft', 2],
  ['parking', 2],
  ['lobby', 2],
  ['streetmarket', 2],
  ['lucky', 1],
];
export const STARTER = [
  ['studio', 3],
  ['office', 3],
  ['foodhall', 1],
  ['flatroof', 1],
  ['garden', 1],
  ['grant', 1],
];

// Developers: a person, a specialty (passive), and the 10 cards they bring to the shared pool.
export const PACK_SIZE = 10;
export const FIRMS = [
  {
    id: 'harlow',
    name: 'Ines Harlow',
    tag: 'Housing developer',
    passive: 'Residential blocks cost 1 less.',
    hq: 'hq_harlow',
    collection: [
      ['arcology', 1],
      ['loft', 2],
      ['condo', 3],
      ['studio', 3],
      ['garden', 2],
      ['penthouse', 2],
      ['grant', 2],
      ['landmark', 1],
      ['tunnel', 1],
      ['presale', 1],
      ['designstudio', 1],
      ['bazaar', 1],
    ],
    pack: [
      ['condo', 3],
      ['studio', 1],
      ['garden', 2],
      ['penthouse', 2],
      ['grant', 2],
    ],
  },
  {
    id: 'kessler',
    name: 'Dov Kessler',
    tag: 'Commercial builder',
    passive: 'Office blocks score +1 prestige.',
    hq: 'hq_kessler',
    collection: [
      ['mirror', 1],
      ['datacenter', 1],
      ['casino', 1],
      ['corner', 3],
      ['foodhall', 2],
      ['deck', 2],
      ['helipad', 1],
      ['crane', 2],
      ['headhunt', 2],
      ['headline', 1],
      ['megamall', 1],
      ['lobbyist', 1],
      ['cowork', 1],
      ['convention', 1],
    ],
    pack: [
      ['corner', 3],
      ['foodhall', 1],
      ['deck', 2],
      ['helipad', 1],
      ['crane', 1],
      ['headhunt', 2],
    ],
  },
  {
    id: 'okafor',
    name: 'Ade Okafor',
    tag: 'Civic planner',
    passive: 'Civic floors also earn $1.',
    hq: 'hq_okafor',
    collection: [
      ['atrium', 1],
      ['lobby', 1],
      ['parking', 1],
      ['library', 3],
      ['clinic', 2],
      ['skybridge', 2],
      ['spire', 1],
      ['siteoffice', 2],
      ['inspect', 1],
      ['audit', 1],
      ['skygarden', 1],
      ['tunnel', 1],
      ['heritage', 1],
      ['community', 1],
    ],
    pack: [
      ['library', 2],
      ['clinic', 2],
      ['skybridge', 2],
      ['spire', 1],
      ['siteoffice', 1],
      ['inspect', 1],
      ['audit', 1],
    ],
  },
];
// Natures: the keywords printed on a card. Rules text stays on the card; natures are the recurring ones a player learns once.
export const NATURES = {
  Exhaust: 'Leaves the game after one use.',
  Prestige: 'Scales with your reputation tier.',
  Retain: 'Returns to the top of your deck instead of the discard.',
  Ground: 'Ground floor only. Needs an empty plot.',
  Lucky: 'Rolls dice. Anything can happen.',
  Top: 'Always the top floor; nothing builds above it.',
  Target: 'Played onto one of your towers.',
  HQ: 'Leaves your deck and sits in an HQ slot with a permanent effect.',
};
export const ONE_SHOT = ['siteoffice', 'crane', 'poach'];
export function natures(c) {
  const n = [];
  if (c.kind === 'hq') n.push('HQ');
  if (ONE_SHOT.includes(c.key)) n.push('Exhaust');
  if (c.ps) n.push('Prestige');
  if (c.charms && c.charms.includes('expedite')) n.push('Retain');
  if (c.charms && c.charms.includes('tenured') && !c.ps) n.push('Prestige');
  if (c.type === 'S' || c.ground) n.push('Ground');
  if (c.fx === 'dice' || (c.charms && c.charms.includes('gambler'))) n.push('Lucky');
  if (c.type === 'H') n.push('Top');
  if (c.target === 'plot') n.push('Target');
  return n;
}
export function validPack(f, pack) {
  const n = pack.reduce((a, [k, c]) => a + c, 0);
  if (n !== PACK_SIZE) return false;
  return pack.every(([k, c]) => {
    const m = f.collection.find((x) => x[0] === k);
    return m && c >= 0 && c <= m[1];
  });
}

export const BOUNTIES = [
  { id: 'resi', name: 'Housing First', text: '6 or more Residential blocks standing', pts: 5, check: (p) => countType(p, 'R') >= 6 },
  {
    id: 'tall',
    name: 'Tall Order',
    text: 'A capped building 6 or more floors high',
    pts: 6,
    check: (p) => p.plots.some((pl) => pl.cap && pl.blocks.length + pl.blocks.filter((b) => b.key === 'arcology').length >= 6),
  },
  {
    id: 'mixed',
    name: 'Mixed Use',
    text: '3 capped buildings with 2 or more block types each',
    pts: 5,
    check: (p) => p.plots.filter((pl) => pl.cap && typeSet(pl).size >= 2).length >= 3,
  },
  { id: 'cash', name: 'Cash Rich', text: '12 or more money at game end', pts: 4, check: (p) => p.money >= 12 },
  { id: 'civic', name: 'Civic Minded', text: '3 or more Civic blocks standing', pts: 4, check: (p) => countType(p, 'C') >= 3 },
  { id: 'landlord', name: 'Landlord', text: 'Every plot has at least 2 blocks', pts: 5, check: (p) => p.plots.every((pl) => pl.blocks.length >= 2) },
];

// Events. late: true means they sit in the bottom half of the event deck (the clock).
export const EVENTS = [
  { id: 'boom', name: 'Construction Boom', mood: 'good', text: 'Both developers gain $5.', apply: (g) => g.players.forEach((p) => (p.money += 5)) },
  { id: 'recess', name: 'Recession', mood: 'bad', text: 'No rent this round. Everyone gets the base $2 only.', mods: { noRent: true } },
  {
    id: 'heat',
    name: 'Heat Wave',
    mood: 'bad',
    text: 'Glass is an oven. Lose $1 per Glass floor (max $5). Brick shrugs it off.',
    apply: (g) =>
      g.players.forEach(
        (p) =>
          (p.money = Math.max(
            0,
            p.money -
              Math.min(
                5,
                p.plots.reduce((a, pl) => a + (pl.cap && pl.cap.key === 'solar' ? 0 : pl.blocks.filter((b) => b.look === 'glass').length), 0)
              )
          ))
      ),
  },
  {
    id: 'festival',
    name: 'Street Festival',
    mood: 'good',
    text: 'Gain $2 per Retail floor.',
    apply: (g) => g.players.forEach((p) => (p.money += 2 * countType(p, 'S'))),
  },
  {
    id: 'tourism',
    name: 'Tourism Surge',
    mood: 'good',
    text: 'Gain $3 per Hotel floor.',
    apply: (g) => g.players.forEach((p) => (p.money += 3 * countType(p, 'H'))),
  },
  { id: 'fair', name: 'Talent Fair', mood: 'shop', text: 'Specialists are hiring. Hire one into a card in your hand.', mods: { charm: true } },
  { id: 'fair2', name: 'Talent Fair', mood: 'shop', text: 'Specialists are hiring. Hire one into a card in your hand.', mods: { charm: true } },
  { id: 'strike', name: 'Transit Strike', mood: 'bad', text: 'Floors cost $2 more this round.', mods: { costDelta: 2 } },
  { id: 'housing', name: 'Housing Push', mood: 'good', text: 'Residential floors are free this round.', mods: { resDelta: -9 } },
  { id: 'taxhol', name: 'Tax Holiday', mood: 'good', text: 'Caps are free this round.', mods: { freeCaps: true } },
  { id: 'shortage', name: 'Materials Shortage', mood: 'bad', text: 'Cranes are idle this round: 1 floor per tower.', mods: { noCrane: true } },
  {
    id: 'quake',
    name: 'Tremor',
    mood: 'bad',
    text: 'Every unfinished tower 4 or more floors high loses its top floor, unless that floor is Brick.',
    apply: (g) =>
      g.players.forEach((p) =>
        p.plots.forEach((pl) => {
          if (!pl.cap && pl.blocks.length >= 4 && pl.blocks[pl.blocks.length - 1].look !== 'brick') pl.blocks.pop();
        })
      ),
  },
  {
    id: 'rezone',
    name: 'Rezoning',
    mood: 'bad',
    text: 'The council redraws one plot. Its zone changes for both developers.',
    apply: (g) => {
      const i = Math.floor(g.rng() * 6);
      const cur = g.players[0].plots[i].zone;
      const pool = Object.keys(ZONES).filter((z) => z !== cur);
      const z = pool[Math.floor(g.rng() * pool.length)];
      g.players.forEach((p) => (p.plots[i].zone = z));
      g.event = Object.assign({}, g.event, { text: `Plot ${i + 1} is now ${ZONES[z].name}: ${ZONES[z].text}` });
    },
  },
  { id: 'calm', name: 'Quiet Quarter', mood: 'calm', text: 'Nothing happens. Build.' },
  {
    id: 'tax',
    name: 'Tax Season',
    mood: 'bad',
    late: true,
    text: 'Both developers lose half their money.',
    apply: (g) => g.players.forEach((p) => (p.money = Math.ceil(p.money / 2))),
  },
  {
    id: 'final',
    name: 'Final Inspections',
    mood: 'good',
    late: true,
    text: 'Finished towers score +2★ each at game end.',
    apply: (g) => g.players.forEach((p) => (p.capBonus += 2)),
  },
  {
    id: 'deadline',
    name: 'Council Deadline',
    mood: 'bad',
    late: true,
    text: 'Unfinished towers cost $2 each in fines.',
    apply: (g) => g.players.forEach((p) => (p.money = Math.max(0, p.money - 2 * p.plots.filter((pl) => !pl.cap && pl.blocks.length).length))),
  },
  {
    id: 'grandop',
    name: 'Grand Opening',
    mood: 'good',
    late: true,
    text: 'Gain $3 per finished tower.',
    apply: (g) => g.players.forEach((p) => (p.money += 3 * p.plots.filter((pl) => pl.cap).length)),
  },
];
