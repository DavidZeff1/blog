/* ------------------------------------------------------------------
   flags.js — the 38 OECD flags, drawn as inline SVG.

   No image files and no CDN: every flag is a handful of rects, circles
   and paths in a 3x2 unit box, so they scale cleanly, cost no requests
   and cannot break because someone else's server moved.

   They are deliberately simplified. At 17 pixels wide a coat of arms
   is three grey pixels, so the crests on Portugal, Mexico, Slovakia
   and Spain are reduced to the shape you'd actually recognise at that
   size. The colour layout is what does the identifying.

   FLAG(name, x, y, w) returns a nested <svg> positioned at x,y. Nested
   SVG clips to its own viewport, which is what keeps crescents and
   circles from spilling over the edge of the flag.
   ------------------------------------------------------------------ */

/* --- primitives, all in the 3-wide by 2-tall unit box --- */
const _bg = c => `<rect width="3" height="2" fill="${c}"/>`;
const _r  = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const _c  = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const _p  = (d, c) => `<path d="${d}" fill="${c}"/>`;

/* equal horizontal bands, top to bottom */
const _hz = cs => cs.map((c, i) => _r(0, i * 2 / cs.length, 3, 2 / cs.length + .004, c)).join('');
/* equal vertical bands, hoist to fly */
const _vt = cs => cs.map((c, i) => _r(i * 3 / cs.length, 0, 3 / cs.length + .004, 2, c)).join('');

/* Nordic cross: offset toward the hoist, optional outline band. */
const _nordic = (field, cross, edge) => _bg(field)
  + (edge ? _r(.83, 0, .62, 2, edge) + _r(0, .69, 3, .62, edge) : '')
  + _r(.98, 0, .32, 2, cross) + _r(0, .84, 3, .32, cross);

/* Union flag, reused inside the Australian and NZ cantons. */
const _union = () => _bg('#012169')
  + `<path d="M0 0 L3 2 M3 0 L0 2" stroke="#fff" stroke-width=".42" fill="none"/>`
  + `<path d="M0 0 L3 2 M3 0 L0 2" stroke="#C8102E" stroke-width=".2" fill="none"/>`
  + `<path d="M1.5 0 V2 M0 1 H3" stroke="#fff" stroke-width=".68" fill="none"/>`
  + `<path d="M1.5 0 V2 M0 1 H3" stroke="#C8102E" stroke-width=".38" fill="none"/>`;

/* a canton is just a smaller flag box in the corner */
const _canton = inner => `<svg x="0" y="0" width="1.5" height="1" viewBox="0 0 3 2">${inner}</svg>`;

/* One Korean trigram: three bars, solid or broken, stacked along the
   line pointing at the centre of the flag. Local +y is that line, so
   the rotation is simply the radius angle minus 90. */
const _trigram = (x, y, ang, rows) =>
  `<g transform="translate(${x} ${y}) rotate(${ang})">`
  + rows.map((solid, i) => {
      const dy = (i - 1) * .19 - .05;
      return solid ? _r(-.26, dy, .52, .1, '#000')
                   : _r(-.26, dy, .21, .1, '#000') + _r(.05, dy, .21, .1, '#000');
    }).join('')
  + `</g>`;

const FLAGS = {
  'Luxembourg':     () => _hz(['#ED2939', '#fff', '#00A1DE']),
  'Ireland':        () => _vt(['#169B62', '#fff', '#FF883E']),
  'Switzerland':    () => _bg('#D52B1E') + _r(1.28, .4, .44, 1.2, '#fff') + _r(.9, .78, 1.2, .44, '#fff'),
  'Iceland':        () => _nordic('#02529C', '#DC1E35', '#fff'),
  'Norway':         () => _nordic('#EF2B2D', '#002868', '#fff'),
  'United States':  () => _bg('#fff')
                        + [0, 2, 4, 6, 8, 10, 12].map(i => _r(0, i * 2 / 13, 3, 2 / 13 + .004, '#B22234')).join('')
                        + _r(0, 0, 1.2, 14 / 13, '#3C3B6E')
                        + [[.28, .22], [.62, .22], [.96, .22], [.45, .43], [.79, .43],
                           [.28, .64], [.62, .64], [.96, .64], [.45, .85], [.79, .85]]
                            .map(([x, y]) => _c(x, y, .075, '#fff')).join(''),
  'Denmark':        () => _nordic('#C60C30', '#fff', null),
  'Netherlands':    () => _hz(['#AE1C28', '#fff', '#21468B']),
  'Australia':      () => _bg('#012169') + _canton(_union())
                        + [[2.15, .5], [2.5, 1.15], [2.15, 1.6], [1.85, 1.05], [2.62, .82]]
                            .map(([x, y], i) => _c(x, y, i === 4 ? .09 : .13, '#fff')).join('')
                        + _c(.75, 1.62, .17, '#fff'),
  'Sweden':         () => _nordic('#006AA7', '#FECC00', null),
  'Israel':         () => _bg('#fff') + _r(0, .22, 3, .3, '#0038B8') + _r(0, 1.48, 3, .3, '#0038B8')
                        + `<path d="M1.5 .66 L1.79 1.17 L1.21 1.17 Z M1.5 1.34 L1.79 .83 L1.21 .83 Z"
                             fill="none" stroke="#0038B8" stroke-width=".085"/>`,
  'Austria':        () => _hz(['#ED2939', '#fff', '#ED2939']),
  'Germany':        () => _hz(['#000000', '#DD0000', '#FFCE00']),
  'Belgium':        () => _vt(['#000000', '#FDDA24', '#EF3340']),
  'United Kingdom': () => _union(),
  'Canada':         () => _bg('#fff') + _r(0, 0, .75, 2, '#D80621') + _r(2.25, 0, .75, 2, '#D80621')
                        + _p('M1.5 .48 L1.63 .83 L1.92 .74 L1.79 1.04 L2.02 1.08 L1.66 1.32 '
                           + 'L1.73 1.46 L1.5 1.41 L1.27 1.46 L1.34 1.32 L.98 1.08 L1.21 1.04 '
                           + 'L1.08 .74 L1.37 .83 Z', '#D80621'),
  'Finland':        () => _nordic('#fff', '#003580', null),
  'France':         () => _vt(['#002395', '#fff', '#ED2939']),
  'New Zealand':    () => _bg('#00247D') + _canton(_union())
                        + [[2.25, .52], [2.55, 1.02], [2.25, 1.52], [1.98, 1.02]]
                            .map(([x, y]) => _c(x, y, .13, '#C8102E')).join(''),
  'Italy':          () => _vt(['#009246', '#fff', '#CE2B37']),
  'Spain':          () => _bg('#AA151B') + _r(0, .5, 3, 1, '#F1BF00')
                        + _p('M.6 .72 L1.0 .72 L1.0 1.06 Q1.0 1.24 .8 1.32 Q.6 1.24 .6 1.06 Z', '#AA151B'),
  'Slovenia':       () => _hz(['#fff', '#0000A0', '#D50000'])
                        + _p('M.42 .26 L1.08 .26 L1.08 .74 Q1.08 .98 .75 1.1 Q.42 .98 .42 .74 Z', '#fff')
                        + _p('M.48 .32 L1.02 .32 L1.02 .73 Q1.02 .93 .75 1.03 Q.48 .93 .48 .73 Z', '#0000A0')
                        + _p('M.75 .46 L.95 .8 L.55 .8 Z', '#fff'),
  'Czechia':        () => _r(0, 0, 3, 1.004, '#fff') + _r(0, 1, 3, 1, '#D7141A')
                        + _p('M0 0 L1.3 1 L0 2 Z', '#11457E'),
  'Estonia':        () => _hz(['#0072CE', '#000000', '#fff']),
  'Korea':          () => _bg('#fff')
                        + _c(1.5, 1, .42, '#CD2E3A')
                        + _p('M1.08 1 A .42 .42 0 0 0 1.92 1 A .21 .21 0 0 0 1.5 1 A .21 .21 0 0 1 1.08 1 Z', '#0047A0')
                        + _trigram(.55, .45, -60, [1, 1, 1])     /* geon,  upper hoist */
                        + _trigram(2.45, .45, 60, [0, 1, 0])     /* gam,   upper fly   */
                        + _trigram(.55, 1.55, -120, [1, 0, 1])   /* ri,    lower hoist */
                        + _trigram(2.45, 1.55, 120, [0, 0, 0]),  /* gon,   lower fly   */
  'Lithuania':      () => _hz(['#FDB913', '#006A44', '#C1272D']),
  'Japan':          () => _bg('#fff') + _c(1.5, 1, .56, '#BC002D'),
  'Portugal':       () => _r(0, 0, 1.2, 2, '#006600') + _r(1.2, 0, 1.8, 2, '#FF0000')
                        + `<circle cx="1.2" cy="1" r=".37" fill="none" stroke="#FFE900" stroke-width=".13"/>`
                        + _c(1.2, 1, .17, '#fff') + _c(1.2, 1, .1, '#FF0000'),
  'Poland':         () => _hz(['#fff', '#DC143C']),
  'Slovakia':       () => _hz(['#fff', '#0B4EA2', '#EE1C25'])
                        + _p('M.62 .52 L1.28 .52 L1.28 1.14 L.95 1.44 L.62 1.14 Z', '#EE1C25')
                        + _r(.9, .7, .14, .56, '#fff') + _r(.76, .86, .42, .14, '#fff'),
  'Greece':         () => _bg('#fff')
                        + [0, 2, 4, 6, 8].map(i => _r(0, i * 2 / 9, 3, 2 / 9 + .004, '#0D5EAF')).join('')
                        + _r(0, 0, 10 / 9, 10 / 9, '#0D5EAF')
                        + _r(.42, 0, .32, 10 / 9, '#fff') + _r(0, .39, 10 / 9, .32, '#fff'),
  'Latvia':         () => _bg('#9E3039') + _r(0, .8, 3, .4, '#fff'),
  'Hungary':        () => _hz(['#CE2939', '#fff', '#477050']),
  'Costa Rica':     () => _bg('#002B7F')
                        + _r(0, 1 / 3, 3, 1 / 3 + .004, '#fff') + _r(0, 4 / 3, 3, 1 / 3 + .004, '#fff')
                        + _r(0, 2 / 3, 3, 2 / 3 + .004, '#CE1126'),
  'Chile':          () => _r(0, 0, 3, 1.004, '#fff') + _r(0, 1, 3, 1, '#D52B1E')
                        + _r(0, 0, 1, 1, '#0039A6') + _c(.5, .5, .21, '#fff'),
  'Türkiye':        () => _bg('#E30A17') + _c(1.16, 1, .46, '#fff') + _c(1.33, 1, .37, '#E30A17')
                        + _c(1.86, 1, .19, '#fff'),
  'Mexico':         () => _vt(['#006847', '#fff', '#CE1126']) + _c(1.5, 1, .19, '#8C6239'),
  'Colombia':       () => _bg('#FCD116') + _r(0, 1, 3, .5, '#003893') + _r(0, 1.5, 3, .5, '#CE1126')
};

/* Positioned flag, ready to drop into a chart's SVG. Height follows
   from the 3:2 box so the aspect never drifts. */
function FLAG(name, x, y, w) {
  const draw = FLAGS[name];
  if (!draw) return '';
  return `<svg x="${x}" y="${y}" width="${w}" height="${w * 2 / 3}" viewBox="0 0 3 2">`
       + draw()
       + `<rect width="3" height="2" fill="none" stroke="#16211B" stroke-opacity=".28" stroke-width=".1"/>`
       + `</svg>`;
}

if (typeof window !== 'undefined') Object.assign(window, { FLAG, FLAGS });
if (typeof module !== 'undefined') module.exports = { FLAG, FLAGS };
