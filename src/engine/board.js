// Pure queries over a player's block. No rules here, just counting.
export function countLook(p, l) {
  return p.plots.reduce((n, pl) => n + pl.blocks.filter((b) => b.look === l).length, 0);
}
export function countType(p, t) {
  return p.plots.reduce((n, pl) => n + pl.blocks.filter((b) => b.type === t).length, 0);
}
export function typeSet(pl) {
  return new Set(pl.blocks.map((b) => b.type));
}
export function neighbours(p, i) {
  return [p.plots[i - 1], p.plots[i + 1]].filter(Boolean);
}
export function hasType(pl, t) {
  return pl.blocks.some((b) => b.type === t);
}
export function uniformLook(pl) {
  return pl.blocks.length >= 2 && new Set(pl.blocks.map((b) => b.look)).size === 1;
}
export function expand(list, mk) {
  const out = [];
  list.forEach(([k, n]) => {
    for (let i = 0; i < n; i++) out.push(mk(k));
  });
  return out;
}
