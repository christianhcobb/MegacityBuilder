// Seeded RNG so every game is reproducible from its seed (sim, tests, bug reports, future async play).
export function makeRng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; };
}
export function shuffle(arr, rng) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
