// Public engine surface. The UI, the sim and the tests all import from here.
export * from './rng.js';
export * from './board.js';
export * from './data.js';
export * from './rules.js';
export * from './ai.js';
import * as rules from './rules.js';
import * as ai from './ai.js';
import * as data from './data.js';
import * as board from './board.js';
import * as rng from './rng.js';
export const MCD = Object.assign({}, rng, board, data, rules, ai);
export default MCD;
