// ===== Cartoon vector art: card illustrations, caps, icons, developer portraits, towers, skyline =====
export const ART = (function () {
const K = '#23263a'; // outline
const SW = 2.2;
const C = {
  R: ['#ff8a65', '#ff6a3d', '#c94a24'], O: ['#6fb4ff', '#3f8de6', '#2a63b3'], S: ['#ffd25a', '#ffb830', '#d18b12'],
  H: ['#c78bff', '#a35ee8', '#6f3cb0'], C: ['#7fe08a', '#4cc264', '#2f8f45'], cap: ['#5b6078', '#3a3f55', '#23263a'],
  sky: ['#dff4ff', '#b7e3ff'], sun: '#ffd166', cloud: '#ffffff', ground: ['#8fe28f', '#5ac46b'], glass: '#bfe9ff', gold: '#ffc233', grey: ['#e6e9f2', '#c3c8d8', '#8d94ab'], skin: ['#f7c9a3', '#e0a77c', '#8d5a3b', '#5f3b22'], white: '#fff',
};
const rr = (x, y, w, h, fill, r, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r == null ? 3 : r}" fill="${fill}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" ${extra || ''}/>`;
const rect = (x, y, w, h, fill, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${fill}"/>`;
const circ = (cx, cy, r, fill, stroke) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${stroke === false ? '' : `stroke="${K}" stroke-width="${SW}"`}/>`;
const poly = (pts, fill, stroke) => `<polygon points="${pts}" fill="${fill}" ${stroke === false ? '' : `stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"`}/>`;
const path = (d, fill, extra) => `<path d="${d}" fill="${fill}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" ${extra || ''}/>`;
const line = (x1, y1, x2, y2, col, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || K}" stroke-width="${w || SW}" stroke-linecap="round"/>`;
const windows = (x, y, w, h, cols, rows, fill, pad) => { let s = ''; pad = pad || 3; const cw = (w - pad * (cols + 1)) / cols, ch = (h - pad * (rows + 1)) / rows; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += rect(x + pad + c * (cw + pad), y + pad + r * (ch + pad), cw, ch, fill || C.glass, 1.5); return s; };
const shine = (x, y, w, h) => rect(x, y, w, h, 'rgba(255,255,255,.35)', 2);
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.22}" fill="rgba(35,38,58,.18)"/>`;
const sun = (x, y) => circ(x, y, 9, C.sun) ;
const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})">${circ(0, 0, 7, C.cloud)}${circ(9, -3, 9, C.cloud)}${circ(19, 0, 7, C.cloud)}<rect x="-2" y="0" width="24" height="7" fill="${C.cloud}"/><rect x="-2" y="7" width="24" height="2" fill="${K}" rx="1"/></g>`;
const scene = (inner, tint) => `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint ? tint[0] : C.sky[0]}"/><stop offset="1" stop-color="${tint ? tint[1] : C.sky[1]}"/></linearGradient></defs><rect width="120" height="84" fill="url(#sky)"/>${sun(100, 18)}${cloud(14, 20, 0.8)}${cloud(78, 32, 0.6)}<rect x="0" y="70" width="120" height="14" fill="${C.ground[1]}"/><rect x="0" y="70" width="120" height="4" fill="${C.ground[0]}"/><rect x="0" y="69" width="120" height="2" fill="${K}"/>${inner}</svg>`;

// ---------- card illustrations ----------
const blocks = {
  studio: () => scene(shadow(60, 71, 34) + rr(30, 30, 60, 40, C.R[0]) + rect(30, 30, 60, 6, C.R[1]) + rr(26, 24, 68, 8, C.R[2], 2) + windows(32, 38, 56, 20, 3, 1) + rr(52, 56, 16, 14, C.R[2], 3) + circ(64, 63, 1.5, C.gold) + rr(24, 66, 72, 4, C.grey[1], 2) + shine(33, 33, 10, 3)),
  condo: () => scene(shadow(60, 71, 28) + rr(40, 8, 40, 62, C.R[0]) + rect(40, 8, 40, 5, C.R[1]) + [18, 32, 46].map(y => rr(34, y, 52, 5, C.R[2], 2) + windows(42, y - 8, 36, 8, 3, 1)).join('') + windows(42, 54, 36, 10, 3, 1) + rr(54, 60, 12, 10, C.R[2], 2) + rr(46, 4, 28, 6, C.grey[1], 2) + shine(43, 12, 6, 30)),
  office: () => scene(shadow(60, 71, 34) + rr(28, 12, 64, 58, C.O[0]) + rect(28, 12, 64, 5, C.O[1]) + windows(30, 18, 60, 48, 4, 4, C.glass, 2.5) + rr(24, 8, 72, 6, C.O[2], 2) + rr(50, 60, 20, 10, C.O[2], 2) + shine(31, 15, 8, 40)),
  corner: () => scene(shadow(60, 71, 36) + rr(26, 26, 40, 44, C.O[0]) + rr(60, 6, 34, 64, C.O[0]) + rect(60, 6, 34, 5, C.O[1]) + rect(26, 26, 40, 5, C.O[1]) + windows(28, 32, 36, 34, 3, 3, C.glass, 2.5) + windows(62, 12, 30, 54, 2, 5, C.glass, 2.5) + rr(56, 2, 42, 6, C.O[2], 2) + rr(40, 60, 14, 10, C.O[2], 2) + shine(63, 9, 6, 50)),
  foodhall: () => scene(shadow(60, 71, 38) + rr(22, 34, 76, 36, C.S[0]) + rect(22, 34, 76, 4, C.S[1]) + `<g>${[0, 1, 2, 3, 4, 5].map(i => rect(20 + i * 13, 26, 13, 12, i % 2 ? C.white : '#ff6b6b')).join('')}<rect x="20" y="26" width="78" height="12" rx="2" fill="none" stroke="${K}" stroke-width="${SW}"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${20 + i * 13} 38 q6.5 7 13 0" fill="${i % 2 ? C.white : '#ff6b6b'}" stroke="${K}" stroke-width="${SW}"/>`).join('')}</g>` + rr(28, 44, 26, 18, C.glass, 2) + rr(66, 44, 26, 18, C.glass, 2) + rr(54, 48, 12, 22, C.S[2], 2) + circ(58, 59, 1.5, C.gold) + rr(40, 14, 40, 10, C.S[2], 3) + `<text x="60" y="22" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="7" fill="${C.white}">FOOD HALL</text>`),
  hotel: () => scene(shadow(60, 71, 32) + rr(34, 18, 52, 52, C.H[0]) + rect(34, 18, 52, 5, C.H[1]) + windows(36, 24, 48, 30, 4, 3, '#fff1c1', 2.5) + rr(26, 54, 68, 6, C.H[2], 2) + rr(48, 58, 24, 12, C.H[2], 3) + rr(50, 60, 9, 10, '#fff1c1', 1) + rr(61, 60, 9, 10, '#fff1c1', 1) + rr(44, 6, 32, 12, C.H[2], 3) + `<text x="60" y="15" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="8" fill="${C.gold}">HOTEL</text>` + shine(37, 21, 6, 30)),
  library: () => scene(shadow(60, 71, 38) + poly('24,34 60,14 96,34', C.C[1]) + rr(26, 34, 68, 36, C.grey[0]) + [0, 1, 2, 3, 4].map(i => rr(31 + i * 13, 38, 7, 28, C.white, 2)).join('') + rr(22, 64, 76, 6, C.grey[1], 2) + rr(30, 30, 60, 6, C.C[2], 2) + circ(60, 24, 4, C.gold)),
  skygarden: () => scene(shadow(60, 71, 36) + rr(26, 30, 68, 40, C.C[0]) + rect(26, 30, 68, 4, C.C[1]) + rr(30, 38, 60, 24, C.glass, 3) + circ(44, 50, 8, C.C[1]) + circ(60, 46, 10, C.C[0]) + circ(76, 50, 7, C.C[1]) + rect(59, 54, 3, 8, '#8d5a3b') + rr(52, 62, 16, 8, C.C[2], 2) + rr(22, 24, 76, 8, C.grey[1], 3) + circ(36, 48, 2, '#ff5e8a', false) + circ(68, 42, 2, C.gold, false)),
  megamall: () => scene(shadow(60, 72, 44) + rr(14, 30, 92, 40, C.S[0]) + rect(14, 30, 92, 5, C.S[1]) + rr(10, 24, 100, 8, C.S[2], 3) + [0,1,2,3,4,5,6,7].map(i => rect(14 + i * 11.5, 38, 11.5, 8, i % 2 ? C.white : '#ff6b6b')).join('') + `<rect x="14" y="38" width="92" height="8" fill="none" stroke="${K}" stroke-width="${SW}"/>` + rr(22, 50, 18, 12, C.glass, 2) + rr(80, 50, 18, 12, C.glass, 2) + rr(46, 50, 28, 20, C.S[2], 3) + rr(49, 53, 10, 17, C.glass, 1) + rr(61, 53, 10, 17, C.glass, 1) + `<text x="60" y="21" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="${K}">MEGA MALL</text>`),
  headline: () => scene(shadow(60, 71, 34) + rr(28, 10, 64, 60, C.O[1]) + rect(28, 10, 64, 5, C.O[0]) + windows(30, 16, 60, 34, 4, 3, C.glass, 2.5) + rr(34, 52, 52, 14, C.gold, 3) + `<text x="60" y="62" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="${K}">★ ACME ★</text>` + circ(100, 18, 9, C.sun) + `<path d="M96 8 l2 -5 M104 8 l-2 -5 M108 14 l5 -2" stroke="${C.gold}" stroke-width="2" stroke-linecap="round"/>`),
  clinic: () => scene(shadow(60, 71, 36) + rr(24, 26, 72, 44, C.white) + rect(24, 26, 72, 5, C.grey[0]) + windows(26, 44, 68, 22, 4, 1) + rr(50, 56, 20, 14, C.C[1], 3) + rr(20, 20, 80, 8, C.C[1], 3) + `<g>${rect(53, 30, 14, 5, '#ff5e8a', 1)}${rect(57.5, 25.5, 5, 14, '#ff5e8a', 1)}<path d="M57.5 25.5h5v4.5h4.5v5h-4.5v4.5h-5v-4.5h-4.5v-5h4.5z" fill="none" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/></g>`),
};
const base = () => shadow(60, 71, 36) + rr(30, 40, 60, 30, C.grey[0]) + windows(32, 46, 56, 18, 4, 1, C.glass, 3) + rect(30, 40, 60, 4, C.grey[1]);
const caps = {
  flatroof: () => scene(base() + rr(26, 34, 68, 8, C.cap[0], 2) + rr(40, 24, 12, 10, C.grey[1], 2) + rr(68, 26, 10, 8, C.grey[1], 2)),
  garden: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + circ(40, 26, 10, C.C[1]) + circ(54, 22, 12, C.C[0]) + circ(70, 26, 9, C.C[1]) + circ(84, 30, 7, C.C[0]) + rect(53, 30, 3, 8, '#8d5a3b') + circ(44, 32, 2, '#ff5e8a', false) + circ(64, 30, 2, C.gold, false)),
  deck: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + [30, 40, 50, 60, 70, 80, 90].map(x => line(x, 22, x, 36)).join('') + line(26, 22, 94, 22) + rr(64, 14, 14, 6, C.grey[2], 2, 'transform="rotate(-25 71 17)"') + line(70, 20, 70, 36, K, 3)),
  helipad: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + `<ellipse cx="60" cy="30" rx="30" ry="9" fill="${C.cap[1]}" stroke="${K}" stroke-width="${SW}"/><ellipse cx="60" cy="30" rx="22" ry="6" fill="none" stroke="${C.white}" stroke-width="2"/><text x="60" y="34" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${C.white}">H</text>`),
  rooftopbar: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + rr(40, 22, 40, 14, C.H[0], 3) + rect(40, 22, 40, 3, C.white) + [46, 58, 70].map(x => circ(x, 30, 3, C.gold, false)).join('') + `<path d="M34 20 h52" stroke="${K}" stroke-width="2.5" stroke-linecap="round"/>` + [36, 48, 60, 72, 84].map(x => circ(x, 20, 2.2, '#ff5e8a')).join('') + `<path d="M86 18 l4 -9 M90 9 l-4 0 l4 0 l-2 -3" stroke="${K}" stroke-width="1.8" fill="none"/>`),
  landmark: () => scene(shadow(60, 71, 28) + rr(42, 2, 36, 68, C.grey[0]) + rect(42, 2, 36, 4, C.white) + windows(44, 8, 32, 56, 3, 5, C.glass, 2) + rr(36, 0, 48, 6, C.gold, 3) + circ(24, 22, 10, C.gold) + `<text x="24" y="26" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${K}">★</text>` + circ(98, 40, 8, C.gold) + `<text x="98" y="44" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="${K}">★</text>`),
  skybridge: () => scene(shadow(60, 71, 44) + rr(14, 30, 30, 40, C.O[0]) + rr(76, 22, 30, 48, C.R[0]) + windows(16, 36, 26, 30, 2, 3) + windows(78, 28, 26, 38, 2, 4) + rr(42, 34, 36, 12, C.glass, 4) + rect(42, 34, 36, 3, C.white) + line(44, 46, 76, 46, K, 2.5)),
  penthouse: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + rr(40, 14, 40, 22, C.glass, 4) + rect(40, 14, 40, 5, C.white) + rr(36, 10, 48, 6, C.gold, 3) + line(50, 14, 50, 36, K, 1.5) + line(70, 14, 70, 36, K, 1.5) + rr(84, 24, 8, 12, C.C[1], 3)),
  spire: () => scene(base() + rr(26, 36, 68, 6, C.cap[0], 2) + poly('44,36 60,4 76,36', C.grey[0]) + poly('52,36 60,16 68,36', C.grey[1]) + line(60, 4, 60, -2, K, 3) + circ(60, 0, 3, C.gold)),
};
const icon = (inner, bg) => `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="84" fill="${bg || '#eef2fb'}"/><circle cx="60" cy="44" r="30" fill="rgba(255,255,255,.6)"/>${inner}</svg>`;
const ops = {
  grant: () => icon(shadow(60, 70, 24) + circ(48, 48, 16, C.gold) + circ(66, 42, 16, C.gold) + circ(66, 42, 10, '#ffdd77', false) + `<text x="66" y="47" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="${K}">$</text>` + circ(48, 48, 16, 'none') , '#fff4d6'),
  permit: () => icon(shadow(60, 70, 22) + rr(40, 16, 40, 52, C.white, 3) + [26, 34, 42].map(y => rect(46, y, 28, 3, C.grey[1], 1.5)).join('') + circ(66, 56, 9, '#ff5e8a') + line(62, 56, 65, 59, C.white, 2.5) + line(65, 59, 71, 52, C.white, 2.5), '#e9f7ff'),
  siteoffice: () => icon(shadow(60, 70, 30) + rr(26, 34, 68, 30, C.S[0]) + rect(26, 34, 68, 4, C.S[1]) + rr(22, 28, 76, 8, C.cap[0], 2) + rr(34, 42, 14, 12, C.glass, 2) + rr(72, 42, 14, 12, C.glass, 2) + rr(53, 46, 12, 18, C.S[2], 2) + circ(36, 68, 4, C.cap[1]) + circ(84, 68, 4, C.cap[1]), '#fff4d6'),
  crane: () => icon(shadow(60, 72, 26) + rect(74, 20, 6, 52, C.gold) + `<path d="M74 20 L80 20 L80 72 L74 72 Z M74 30 L80 36 M74 42 L80 48 M74 54 L80 60" fill="none" stroke="${K}" stroke-width="${SW}"/>` + rr(30, 14, 60, 7, C.gold, 2) + line(36, 21, 36, 40, K, 2) + rr(30, 40, 12, 10, C.O[0], 2) + rr(68, 60, 18, 12, C.cap[0], 2) + line(80, 14, 92, 24, K, 2), '#eaf3ff'),
  survey: () => icon(shadow(60, 70, 26) + rr(28, 24, 52, 40, '#fff8e1', 3) + `<path d="M34 54 L46 40 L56 50 L70 32" fill="none" stroke="${C.O[1]}" stroke-width="3" stroke-linecap="round"/>` + circ(72, 50, 13, C.glass) + line(81, 59, 92, 70, K, 5) + line(81, 59, 92, 70, C.grey[1], 2), '#eef2fb'),
  headhunt: () => icon(shadow(60, 70, 24) + rr(40, 50, 40, 22, C.O[1], 6) + poly('56,50 64,50 60,62', '#ff5e8a') + rr(56, 44, 8, 8, C.skin[0], 2) + circ(60, 32, 14, C.skin[0]) + path('M46 30 q14 -18 28 0 q-4 -6 -14 -6 q-10 0 -14 6z', '#5c3a22') + circ(55, 33, 1.6, K, false) + circ(65, 33, 1.6, K, false) + path('M56 39 q4 3 8 0', 'none'), '#eef2fb'),
  audit: () => icon(shadow(60, 70, 22) + rr(38, 18, 44, 50, C.white, 3) + rr(50, 12, 20, 10, C.grey[1], 3) + [30, 42, 54].map((y, i) => rr(44, y - 2, 8, 8, i < 2 ? C.C[0] : C.white, 2) + rect(56, y, 20, 3, C.grey[1], 1.5)).join('') + path('M46 30 l2 2 l4 -5', 'none') + path('M46 42 l2 2 l4 -5', 'none'), '#eefbf0'),
  presale: () => icon(shadow(60, 70, 26) + rr(30, 28, 60, 36, C.R[0]) + windows(32, 34, 56, 20, 3, 1) + rr(22, 22, 76, 8, C.R[2], 3) + rr(44, 12, 40, 18, C.white, 3, 'transform="rotate(-8 64 21)"') + `<text x="64" y="25" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="#ff5e8a" transform="rotate(-8 64 21)">SOLD!</text>` + circ(94, 56, 8, C.gold) + `<text x="94" y="60" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="${K}">$</text>`, '#ffecef'),
  demolish: () => icon(shadow(60, 72, 28) + rr(30, 40, 50, 30, C.grey[0]) + windows(32, 46, 46, 16, 3, 1) + `<path d="M34 40 l8 -10 l10 6 l8 -12 l10 8 l10 -4 v12 h-46z" fill="${C.grey[1]}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` + line(84, 14, 100, 30, K, 3) + circ(92, 22, 10, C.cap[0]) + `<path d="M36 26 l-6 -6 M28 34 l-8 -2 M44 20 l-2 -8" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`, '#fff4d6'),
  tunnel: () => icon(shadow(60, 72, 30) + rr(26, 44, 24, 26, C.R[0]) + rr(70, 44, 24, 26, C.O[0]) + windows(28, 50, 20, 12, 2, 1) + windows(72, 50, 20, 12, 2, 1) + `<path d="M38 70 q0 10 10 10 h24 q10 0 10 -10" fill="none" stroke="${K}" stroke-width="3" stroke-dasharray="4 3"/>` + `<path d="M50 30 h20 M64 24 l6 6 l-6 6 M56 24 l-6 6 l6 6" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` + circ(60, 72, 7, C.gold) + circ(60, 72, 3, K, false), '#eaf3ff'),
  poach: () => icon(shadow(60, 70, 24) + rr(36, 26, 36, 44, C.white, 3) + rr(40, 20, 36, 44, C.panel || '#fff', 3) + rr(44, 14, 36, 44, C.R[0], 3) + windows(48, 22, 28, 20, 2, 2) + `<path d="M22 50 q14 -16 28 -4" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M44 42 l6 4 l-8 2z" fill="${K}"/>` + rr(14, 46, 14, 10, C.skin[0], 4), '#ffecef'),
  unionhall: () => icon(shadow(60, 72, 30) + rr(26, 30, 68, 40, '#c97b4a') + rect(26, 30, 68, 4, '#e09a66') + rr(22, 24, 76, 8, '#8d5a3b', 3) + rr(52, 48, 16, 22, '#5c3a22', 3) + windows(28, 38, 22, 10, 2, 1) + windows(70, 38, 22, 10, 2, 1) + rr(40, 10, 40, 12, C.gold, 3) + `<text x="60" y="19" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="8" fill="${K}">UNION</text>` + line(60, 22, 60, 30, K, 2), '#fff4d6'),
  designstudio: () => icon(shadow(60, 72, 30) + rr(28, 26, 64, 44, C.white) + rect(28, 26, 64, 4, C.grey[0]) + rr(22, 20, 76, 8, C.R[2], 3) + rr(34, 36, 52, 26, '#fff8e1', 2) + `<path d="M40 56 L52 42 L62 52 L78 38" fill="none" stroke="${C.O[1]}" stroke-width="2.5" stroke-linecap="round"/><path d="M40 44 h38 M40 50 h38" stroke="${C.grey[1]}" stroke-width="1" stroke-dasharray="2 2"/>` + rr(54, 60, 12, 10, C.R[2], 2) + `<rect x="80" y="10" width="6" height="22" rx="2" fill="${C.gold}" stroke="${K}" stroke-width="${SW}" transform="rotate(30 83 21)"/><polygon points="80,32 86,32 83,38" fill="${K}" transform="rotate(30 83 21)"/>`, '#ffecef'),
  pressoffice: () => icon(shadow(60, 72, 30) + rr(26, 32, 68, 38, C.O[0]) + rect(26, 32, 68, 4, C.O[1]) + rr(22, 26, 76, 8, C.O[2], 3) + windows(28, 40, 64, 10, 4, 1) + rr(52, 56, 16, 14, C.O[2], 2) + rr(34, 6, 52, 22, C.white, 3) + `<rect x="38" y="10" width="18" height="12" rx="1.5" fill="${C.grey[1]}"/><path d="M60 11 h22 M60 15 h22 M60 19 h14" stroke="${C.grey[2]}" stroke-width="2"/>` + `<rect x="30" y="2" width="60" height="7" rx="2" fill="${K}"/><text x="60" y="8" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="6" fill="#fff">MEGACITY TIMES</text>`, '#eaf3ff'),
  glassworks: () => icon(shadow(60, 72, 34) + rr(22, 28, 76, 42, C.glass) + rect(22, 28, 76, 5, C.white) + `<path d="M22 70 L98 28 M40 70 L98 44 M22 50 L62 28" stroke="${K}" stroke-width="1" opacity=".35"/>` + rr(18, 22, 84, 8, C.O[2], 3) + `<rect x="30" y="38" width="60" height="26" fill="none" stroke="${K}" stroke-width="${SW}"/><path d="M30 51 h60 M60 38 v26" stroke="${K}" stroke-width="${SW}"/>` + rr(52, 58, 16, 12, C.O[2], 2) + circ(100, 18, 9, C.sun), '#eaf3ff'),
  heritage: () => icon(shadow(60, 72, 34) + poly('22,34 60,12 98,34', C.grey[1]) + rr(26, 34, 68, 36, C.grey[0]) + [0, 1, 2, 3].map(i => rr(32 + i * 15, 40, 8, 24, C.white, 3)).join('') + rr(22, 64, 76, 6, C.grey[1], 2) + rr(40, 30, 40, 6, C.grey[2], 2) + circ(60, 24, 5, C.gold) + `<text x="60" y="27" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="7" fill="${K}">★</text>` + rr(6, 44, 14, 20, '#8d5a3b', 2) + `<text x="13" y="57" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="7" fill="${C.gold}">1890</text>`, '#f3eee4'),
  lobbyist: () => icon(shadow(60, 70, 24) + rr(40, 50, 40, 22, '#1f2335', 6) + poly('56,50 64,50 60,62', C.gold) + rr(56, 44, 8, 8, C.skin[1], 2) + circ(60, 32, 14, C.skin[1]) + path('M46 30 q14 -14 28 0 q-4 -4 -14 -4 q-10 0 -14 4z', '#3a2a22') + circ(55, 33, 1.6, K, false) + circ(65, 33, 1.6, K, false) + path('M55 40 q5 -2 10 0', 'none') + rr(78, 40, 18, 26, '#8d5a3b', 3) + rr(80, 44, 14, 6, C.gold, 1.5) + `<path d="M24 30 l-6 6 l6 6 M20 36 h18" stroke="${K}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`, '#fff4d6'),
  inspect: () => icon(shadow(60, 70, 22) + rr(38, 18, 44, 50, C.white, 3) + rr(50, 12, 20, 10, C.grey[1], 3) + [30, 42, 54].map(y => rr(44, y - 2, 8, 8, C.white, 2) + rect(56, y, 20, 3, C.grey[1], 1.5)).join('') + path('M46 28 l4 4 M50 28 l-4 4', 'none') + path('M46 40 l4 4 M50 40 l-4 4', 'none') + circ(78, 60, 10, '#ff5e8a') + `<text x="78" y="65" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="13" fill="${C.white}">!</text>`, '#ffecef'),
  zoning: () => icon(shadow(60, 70, 24) + rr(34, 56, 52, 10, '#8d5a3b', 3) + rr(40, 24, 24, 16, '#8d5a3b', 4, 'transform="rotate(-30 52 32)"') + line(58, 40, 76, 58, K, 7) + line(58, 40, 76, 58, '#b47a52', 3.5) + circ(86, 26, 11, '#ff5e8a') + line(80, 20, 92, 32, C.white, 3), '#ffecef'),
};

// ---------- developer portraits (120x120 bust) ----------
function bust(skin, hair, outfit, extras) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="56" fill="${extras.bg || '#eef2fb'}" stroke="${K}" stroke-width="${SW}"/>
  <clipPath id="c${extras.id}"><circle cx="60" cy="60" r="55"/></clipPath>
  <g clip-path="url(#c${extras.id})">
    ${outfit}
    <rect x="52" y="70" width="16" height="14" fill="${skin[1]}"/>
    <ellipse cx="60" cy="52" rx="22" ry="25" fill="${skin[0]}" stroke="${K}" stroke-width="${SW}"/>
    ${hair}
    ${extras.face || ''}
    <circle cx="51" cy="54" r="2.4" fill="${K}"/><circle cx="69" cy="54" r="2.4" fill="${K}"/>
    <circle cx="52" cy="53" r=".8" fill="#fff"/><circle cx="70" cy="53" r=".8" fill="#fff"/>
    <path d="M54 65 q6 5 12 0" fill="none" stroke="${K}" stroke-width="${SW}" stroke-linecap="round"/>
    <ellipse cx="46" cy="61" rx="4" ry="2.5" fill="rgba(255,120,120,.35)"/><ellipse cx="74" cy="61" rx="4" ry="2.5" fill="rgba(255,120,120,.35)"/>
    ${extras.over || ''}
  </g></svg>`;
}
const devs = {
  harlow: () => bust(C.skin.slice(0, 2),
    `<path d="M38 50 q0 -22 22 -24 q22 2 22 24 l-4 -2 q-4 -14 -18 -14 q-14 0 -18 14z" fill="#5c3a22" stroke="${K}" stroke-width="${SW}"/><path d="M80 48 q10 12 4 30" fill="none" stroke="#5c3a22" stroke-width="7" stroke-linecap="round"/><path d="M80 48 q10 12 4 30" fill="none" stroke="${K}" stroke-width="${SW}"/>`,
    `<path d="M20 120 v-22 q0 -16 18 -18 l22 -2 l22 2 q18 2 18 18 v22z" fill="#ff8a3d" stroke="${K}" stroke-width="${SW}"/><rect x="30" y="92" width="60" height="6" fill="#f3f3b0"/><rect x="30" y="104" width="60" height="6" fill="#f3f3b0"/><rect x="50" y="80" width="20" height="40" fill="#fff" stroke="${K}" stroke-width="${SW}"/>`,
    { id: 'h', bg: '#ffe8d6', over: `<path d="M34 42 q0 -20 26 -22 q26 2 26 22 z" fill="${C.gold}" stroke="${K}" stroke-width="${SW}"/><rect x="30" y="40" width="60" height="7" rx="3" fill="#e0a500" stroke="${K}" stroke-width="${SW}"/><rect x="40" y="26" width="8" height="12" rx="3" fill="rgba(255,255,255,.5)"/>` }),
  kessler: () => bust([C.skin[0], C.skin[1]],
    `<path d="M38 46 q2 -20 22 -20 q20 0 22 20 q-6 -10 -22 -10 q-16 0 -22 10z" fill="#c9ccd8" stroke="${K}" stroke-width="${SW}"/>`,
    `<path d="M18 120 v-20 q0 -18 22 -20 l20 -2 l20 2 q22 2 22 20 v20z" fill="#2f3b63" stroke="${K}" stroke-width="${SW}"/><path d="M48 78 l12 10 l12 -10 l-6 42 h-12z" fill="#fff" stroke="${K}" stroke-width="${SW}"/><path d="M57 88 h6 l3 8 l-6 24 l-6 -24z" fill="#ff5e8a" stroke="${K}" stroke-width="${SW}"/>`,
    { id: 'k', bg: '#e3ecff', face: `<rect x="42" y="47" width="15" height="12" rx="5" fill="rgba(191,233,255,.6)" stroke="${K}" stroke-width="${SW}"/><rect x="63" y="47" width="15" height="12" rx="5" fill="rgba(191,233,255,.6)" stroke="${K}" stroke-width="${SW}"/><line x1="57" y1="52" x2="63" y2="52" stroke="${K}" stroke-width="${SW}"/><path d="M50 72 q10 4 20 0" fill="none" stroke="#c9ccd8" stroke-width="4" stroke-linecap="round"/>` }),
  okafor: () => bust([C.skin[2], C.skin[3]],
    `<path d="M38 48 q0 -22 22 -22 q22 0 22 22 q-2 -12 -22 -12 q-20 0 -22 12z" fill="#1d1a22" stroke="${K}" stroke-width="${SW}"/>`,
    `<path d="M18 120 v-20 q0 -18 22 -20 l20 -2 l20 2 q22 2 22 20 v20z" fill="#2f8f45" stroke="${K}" stroke-width="${SW}"/><path d="M44 80 q16 14 32 0 l-4 10 q-12 8 -24 0z" fill="${C.gold}" stroke="${K}" stroke-width="${SW}"/><rect x="70" y="92" width="26" height="30" rx="3" fill="#6fb4ff" stroke="${K}" stroke-width="${SW}" transform="rotate(-12 83 107)"/><path d="M74 100 h16 M74 106 h12 M74 112 h16" stroke="#fff" stroke-width="2" transform="rotate(-12 83 107)"/>`,
    { id: 'o', bg: '#e4f7e7', face: `<path d="M48 48 q3 -3 7 0 M65 48 q3 -3 7 0" fill="none" stroke="${K}" stroke-width="${SW}" stroke-linecap="round"/>` }),
};

// ---------- towers (isometric cartoon) ----------
function lookDetail(b, y) {
  const L = 8, R = 52, M = 30, F = 13, win = b.type === 'H' ? '#fff1c1' : C.glass;
  if (b.look === 'glass') {
    // continuous glazing band on both faces
    return `<polygon points="${L + 2},${y - 2} ${M - 2},${y + 6} ${M - 2},${y - 5} ${L + 2},${y - 11}" fill="${win}" opacity=".9"/><polygon points="${M + 2},${y + 6} ${R - 2},${y - 2} ${R - 2},${y - 11} ${M + 2},${y - 5}" fill="${win}" opacity=".7"/><line x1="${L + 2}" y1="${y - 6.5}" x2="${M - 2}" y2="${y + 0.5}" stroke="${K}" stroke-width=".8" opacity=".5"/><line x1="${M + 2}" y1="${y + 0.5}" x2="${R - 2}" y2="${y - 6.5}" stroke="${K}" stroke-width=".8" opacity=".5"/>`;
  }
  if (b.look === 'brick') {
    let s = '';
    for (let k = 1; k <= 3; k++) { const yy = y - F + k * (F / 4); s += `<line x1="${L + 1}" y1="${yy}" x2="${M - 1}" y2="${yy + 8.2}" stroke="${K}" stroke-width=".7" opacity=".35"/><line x1="${M + 1}" y1="${yy + 8.2}" x2="${R - 1}" y2="${yy}" stroke="${K}" stroke-width=".7" opacity=".35"/>`; }
    s += `<polygon points="${L + 4},${y - 3} ${L + 9},${y - 1} ${L + 9},${y - 7} ${L + 4},${y - 9}" fill="${win}"/><polygon points="${M - 9},${y + 1} ${M - 4},${y + 3} ${M - 4},${y - 3} ${M - 9},${y - 5}" fill="${win}"/><polygon points="${M + 4},${y + 3} ${M + 9},${y + 1} ${M + 9},${y - 5} ${M + 4},${y - 3}" fill="${win}" opacity=".8"/><polygon points="${R - 9},${y - 1} ${R - 4},${y - 3} ${R - 4},${y - 9} ${R - 9},${y - 7}" fill="${win}" opacity=".8"/>`;
    return s;
  }
  // stone: big blocks, arched windows
  return `<line x1="${L + 1}" y1="${y - F / 2}" x2="${M - 1}" y2="${y - F / 2 + 8.2}" stroke="${K}" stroke-width="1" opacity=".3"/><line x1="${M + 1}" y1="${y - F / 2 + 8.2}" x2="${R - 1}" y2="${y - F / 2}" stroke="${K}" stroke-width="1" opacity=".3"/><line x1="${(L + M) / 2}" y1="${y - F + 3.5}" x2="${(L + M) / 2}" y2="${y - F / 2 + 3.5}" stroke="${K}" stroke-width="1" opacity=".3"/><line x1="${(M + R) / 2}" y1="${y - F + 3.5}" x2="${(M + R) / 2}" y2="${y - F / 2 + 3.5}" stroke="${K}" stroke-width="1" opacity=".3"/>` +
    `<path d="M${L + 4} ${y - 2} v-5 q2.5 -3 5 0 v7 z" fill="${win}"/><path d="M${M - 9} ${y + 2} v-5 q2.5 -3 5 0 v7 z" fill="${win}"/><path d="M${M + 4} ${y + 4} v-5 q2.5 -3 5 0 v3 z" fill="${win}" opacity=".8"/><path d="M${R - 9} ${y} v-5 q2.5 -3 5 0 v3 z" fill="${win}" opacity=".8"/>`;
}
const CHARM_ICON = {
  lease: `<text x="10" y="14" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${K}">$</text>`,
  architect: `<text x="10" y="14" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${K}">★</text>`,
  foreman: `<path d="M5 13 l5 -5 M9 7 l4 4 M12 5 l3 3" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`,
  variance: `<text x="10" y="14" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${K}">§</text>`,
  expedite: `<path d="M11 4 l-5 7 h4 l-1 5 l5 -7 h-4z" fill="${K}"/>`,
};
const ZONE_GLYPH = {
  resi: `<path d="M4 11 L11 4 L18 11 M6 10 v7 h10 v-7" fill="#fff" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><rect x="9.5" y="12" width="3" height="5" fill="${K}"/>`,
  comm: `<rect x="4" y="8" width="14" height="9" rx="1.5" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M8 8 V5 h6 v3" fill="none" stroke="${K}" stroke-width="2"/><path d="M4 12 h14" stroke="${K}" stroke-width="2"/>`,
  low: `<path d="M4 5 h14" stroke="${K}" stroke-width="2.5"/><text x="11" y="18" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="${K}">3</text>`,
  landmark: `<polygon points="11,3 13.4,8.4 19,9 14.8,12.8 16,18.5 11,15.6 6,18.5 7.2,12.8 3,9 8.6,8.4" fill="#fff" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>`,
  transit: `<rect x="5" y="4" width="12" height="11" rx="3" fill="#fff" stroke="${K}" stroke-width="2"/><rect x="7.5" y="6.5" width="7" height="4" fill="${K}"/><circle cx="8.5" cy="13" r="1.2" fill="${K}"/><circle cx="13.5" cy="13" r="1.2" fill="${K}"/><path d="M6 18 l2 -3 M16 18 l-2 -3" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`,
};
const ZONE_TINT = { resi: '#ff8a65', comm: '#6fb4ff', low: '#ff5e8a', landmark: '#c78bff', transit: '#4cc264' };
function zoneGlyph(z) { if (!ZONE_GLYPH[z]) return ''; return `<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="10.5" fill="${ZONE_TINT[z]}" stroke="${K}" stroke-width="1.6"/>${ZONE_GLYPH[z]}</svg>`; }
function charmBadge(k) { return `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="${C.gold}" stroke="${K}" stroke-width="2"/>${CHARM_ICON[k] || ''}</svg>`; }
function lookBadge(l) { const f = { glass: C.glass, brick: C.R[1], stone: C.grey[1] }[l] || C.grey[0]; return `<svg viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4" fill="${f}" stroke="${K}" stroke-width="2"/>${l === 'brick' ? `<path d="M2 8h16M2 13h16M8 8v5M12 2v6M12 13v5" stroke="${K}" stroke-width="1.2" opacity=".6"/>` : l === 'stone' ? `<path d="M2 10h16M10 2v8" stroke="${K}" stroke-width="1.4" opacity=".5"/>` : `<path d="M5 15 l10 -10" stroke="#fff" stroke-width="2" opacity=".9"/>`}</svg>`; }
function psBadge() { return `<svg viewBox="0 0 20 20"><polygon points="10,1 19,10 10,19 1,10" fill="${C.H[0]}" stroke="${K}" stroke-width="2"/><polygon points="10,6 14,10 10,14 6,10" fill="#fff"/></svg>`; }
function tierBadge(t) { return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${t >= 4 ? C.gold : t >= 2 ? C.H[0] : t >= 1 ? C.O[0] : C.grey[1]}" stroke="${K}" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12" fill="#fff">${t}</text></svg>`; }
function blockDiagram(p) {
  const W = 300, H = 44, colW = 50, F = 5, base = 36;
  let d = `<line x1="0" y1="${base + 1}" x2="${W}" y2="${base + 1}" stroke="${K}" stroke-width="1.5"/>`;
  p.plots.forEach((pl, i) => {
    const x = i * colW + 10, w = colW - 20;
    pl.blocks.forEach((b, j) => { const c = C[b.type] || C.grey; d += `<rect x="${x}" y="${base - F * (j + 1)}" width="${w}" height="${F - 1}" rx="1" fill="${c[0]}" stroke="${K}" stroke-width="1"/>`; });
    const top = base - F * pl.blocks.length;
    if (pl.cap) d += `<polygon points="${x - 2},${top} ${x + w / 2},${top - 7} ${x + w + 2},${top}" fill="${C.cap[1]}" stroke="${K}" stroke-width="1.2" stroke-linejoin="round"/>`;
    if (pl.crane) d += `<line x1="${x + w + 4}" y1="${base}" x2="${x + w + 4}" y2="${Math.min(top - 10, base - 14)}" stroke="${C.gold}" stroke-width="2"/>`;
    if (!pl.blocks.length) d += `<rect x="${x}" y="${base - 3}" width="${w}" height="3" rx="1" fill="${C.ground[1]}" stroke="${K}" stroke-width="1"/>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
}
function tower(pl) {
  const F = 13, L = 8, R = 52, M = 30, D = 9, BASE = 84, H = 100;
  const col = t => C[t] || C.grey;
  let d = `<ellipse cx="30" cy="${BASE + 4}" rx="24" ry="6" fill="rgba(35,38,58,.15)"/>`;
  d += `<polygon points="${L},${BASE} ${M},${BASE + D} ${R},${BASE} ${M},${BASE - D}" fill="${C.ground[0]}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;

  pl.blocks.forEach((b, j) => {
    const y = BASE - F * j, c = col(b.type), ch = b.charms && b.charms.length;
    d += `<g>` +
      `<polygon points="${L},${y} ${M},${y + D} ${M},${y + D - F} ${L},${y - F}" fill="${c[1]}" stroke="${ch ? C.gold : K}" stroke-width="${ch ? 2.6 : 2}" stroke-linejoin="round"/>` +
      `<polygon points="${M},${y + D} ${R},${y} ${R},${y - F} ${M},${y + D - F}" fill="${c[2]}" stroke="${ch ? C.gold : K}" stroke-width="${ch ? 2.6 : 2}" stroke-linejoin="round"/>` +
      `<polygon points="${L},${y - F} ${M},${y + D - F} ${R},${y - F} ${M},${y - D - F}" fill="${c[0]}" stroke="${ch ? C.gold : K}" stroke-width="${ch ? 2.6 : 2}" stroke-linejoin="round"/>` +
      lookDetail(b, y) + `</g>`;
  });
  const top = BASE - F * pl.blocks.length;
  if (pl.cap) {
    const y = top - D, k = pl.cap.key;
    if (k === 'garden') d += `<circle cx="22" cy="${y + 2}" r="6" fill="${C.C[1]}" stroke="${K}" stroke-width="2"/><circle cx="34" cy="${y - 2}" r="7" fill="${C.C[0]}" stroke="${K}" stroke-width="2"/><circle cx="42" cy="${y + 4}" r="5" fill="${C.C[1]}" stroke="${K}" stroke-width="2"/>`;
    else if (k === 'spire') d += `<polygon points="${M - 8},${y + 4} ${M},${y - 22} ${M + 8},${y + 4}" fill="${C.grey[0]}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><circle cx="${M}" cy="${y - 24}" r="3" fill="${C.gold}" stroke="${K}" stroke-width="2"/>`;
    else if (k === 'helipad') d += `<ellipse cx="${M}" cy="${y}" rx="16" ry="7" fill="${C.cap[1]}" stroke="${K}" stroke-width="2"/><ellipse cx="${M}" cy="${y}" rx="11" ry="4.5" fill="none" stroke="#fff" stroke-width="1.5"/><text x="${M}" y="${y + 3}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="8" fill="#fff">H</text>`;
    else if (k === 'penthouse') d += `<polygon points="${L + 6},${y + 2} ${M},${y + 8} ${R - 6},${y + 2} ${M},${y - 4}" fill="${C.glass}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><polygon points="${L + 6},${y - 4} ${M},${y + 2} ${R - 6},${y - 4} ${M},${y - 10}" fill="${C.gold}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
    else if (k === 'deck') d += `<polygon points="${L},${y} ${M},${y + D} ${R},${y} ${M},${y - D}" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="3 2"/><line x1="${M}" y1="${y}" x2="${M}" y2="${y - 10}" stroke="${K}" stroke-width="2.5"/><circle cx="${M}" cy="${y - 12}" r="3" fill="${C.grey[2]}" stroke="${K}" stroke-width="2"/>`;
    else if (k === 'skybridge') d += `<rect x="${R - 4}" y="${y - 10}" width="16" height="8" rx="4" fill="${C.glass}" stroke="${K}" stroke-width="2"/>`;
    else d += `<polygon points="${L},${y} ${M},${y + D} ${R},${y} ${M},${y - D}" fill="${C.cap[0]}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><rect x="${M - 6}" y="${y - 7}" width="7" height="5" fill="${C.grey[1]}" stroke="${K}" stroke-width="1.5"/>`;
  }
  if (pl.crane) {
    const y = Math.min(top - 18, 14);
    d += `<g><line x1="56" y1="${BASE + 2}" x2="56" y2="${y}" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/><line x1="56" y1="${BASE + 2}" x2="56" y2="${y}" stroke="${K}" stroke-width="1.2"/><line x1="36" y1="${y}" x2="60" y2="${y}" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/><line x1="36" y1="${y}" x2="60" y2="${y}" stroke="${K}" stroke-width="1.2"/><line x1="40" y1="${y}" x2="40" y2="${y + 12}" stroke="${K}" stroke-width="1.5"/><rect x="36" y="${y + 12}" width="8" height="5" rx="1.5" fill="${C.O[0]}" stroke="${K}" stroke-width="1.5"/></g>`;
  }
  return `<svg viewBox="0 -6 60 ${H + 6}" xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
}

// ---------- title skyline (cartoon, two parallax layers) ----------
function skyline(w, h, seed, muted) {
  let s = seed || 11; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const types = ['R', 'O', 'S', 'H', 'C', 'O', 'R'];
  let x = -6, d = '';
  while (x < w) {
    const bw = 22 + Math.floor(rnd() * 30), bh = 40 + Math.floor(rnd() * (h - 60)); const c = C[types[Math.floor(rnd() * types.length)]];
    const fill = muted ? 'rgba(35,38,58,.18)' : c[0];
    d += `<rect x="${x}" y="${h - bh}" width="${bw}" height="${bh + 10}" rx="4" fill="${fill}" ${muted ? '' : `stroke="${K}" stroke-width="2.5"`}/>`;
    if (!muted) { d += `<rect x="${x + bw - 7}" y="${h - bh}" width="7" height="${bh + 10}" rx="3" fill="${c[1]}"/>`; for (let yy = h - bh + 8; yy < h - 6; yy += 11) for (let xx = x + 5; xx < x + bw - 10; xx += 9) if (rnd() > 0.25) d += `<rect x="${xx}" y="${yy}" width="5" height="6" rx="1.5" fill="${C.glass}"/>`; if (rnd() > 0.5) d += `<rect x="${x + bw / 2 - 2}" y="${h - bh - 12}" width="4" height="12" fill="${K}"/><circle cx="${x + bw / 2}" cy="${h - bh - 13}" r="3" fill="${C.gold}" stroke="${K}" stroke-width="2"/>`; }
    x += bw + 6 + Math.floor(rnd() * 6);
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
}
function cloudSvg() { return `<svg viewBox="-10 -14 46 26" xmlns="http://www.w3.org/2000/svg">${cloud(0, 0, 1)}</svg>`; }
function lockSvg() { return `<svg viewBox="0 0 40 40"><rect x="8" y="18" width="24" height="18" rx="4" fill="${C.gold}" stroke="${K}" stroke-width="2.2"/><path d="M13 18 v-5 a7 7 0 0 1 14 0 v5" fill="none" stroke="${K}" stroke-width="3"/><circle cx="20" cy="27" r="2.5" fill="${K}"/></svg>`; }

function card(c) {
  if (c.kind === 'block' && blocks[c.key]) return blocks[c.key]();
  if (c.kind === 'cap' && caps[c.key]) return caps[c.key]();
  if (ops[c.key]) return ops[c.key]();
  return icon('');
}
return { zoneGlyph, ZONE_TINT, card, dev: id => devs[id](), tower, blockDiagram, skyline, cloudSvg, lockSvg, charmBadge, lookBadge, psBadge, tierBadge, C };
})();
