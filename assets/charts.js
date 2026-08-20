/* ------------------------------------------------------------------
   charts.js — plain SVG, no dependencies.
   Every chart measures its container and re-renders on resize so that
   1 SVG unit == 1 CSS pixel and label sizes stay honest at any width.
   ------------------------------------------------------------------ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = n => '$' + Math.round(n).toLocaleString('en-US');

function svgWrap(w, h, label, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}"
    role="img" aria-label="${esc(label)}"
    xmlns="http://www.w3.org/2000/svg" class="chart-svg">${inner}</svg>`;
}

/* text helper */
function t(x, y, str, cls, anchor = 'start') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(str)}</text>`;
}

/* =================================================================
   1. RANK SLOPE — nominal rank vs PPP rank, OECD members
   ================================================================= */
function slopeChart(el, opts = {}) {
  const W = Math.max(el.clientWidth, 280);
  const narrow = W < 620;
  const row = narrow ? 12.5 : 15;
  const padT = narrow ? 46 : 54;
  const padB = 26;
  const H = padT + row * 37 + padB;

  const labelW = narrow ? 58 : 128;
  const x1 = labelW;
  const x2 = W - labelW;
  const y = r => padT + (r - 1) * row;

  /* On phones full country names would run outside the frame, so shorten. */
  const CODE = {
    'Israel': 'ISR', 'Korea': 'KOR', 'New Zealand': 'NZL', 'Ireland': 'IRL',
    'United States': 'USA', 'Luxembourg': 'LUX', 'Switzerland': 'CHE',
    'Japan': 'JPN', 'Poland': 'POL'
  };
  const short = n => narrow ? (CODE[n] || n.slice(0, 3).toUpperCase()) : n;

  /* who gets a name printed */
  const called = new Set(opts.label || (narrow
    ? ['Israel', 'Korea', 'New Zealand', 'Ireland', 'United States']
    : ['Israel', 'Korea', 'Poland', 'New Zealand', 'Ireland',
       'Luxembourg', 'United States', 'Japan', 'Switzerland']));

  let lines = '', marks = '', names = '';

  for (const n of NAMES) {
    const a = RANK_NOMINAL[n], b = RANK_PPP[n];
    const isr = n === 'Israel';
    const hit = called.has(n);
    const cls = isr ? 'slope-line is-israel' : hit ? 'slope-line is-named' : 'slope-line';
    const d = `M ${x1} ${y(a)} L ${x2} ${y(b)}`;
    const seg = `<path d="${d}" class="${cls}" fill="none"/>`;
    if (isr) lines += seg; else lines = seg + lines;   // Israel drawn last = on top

    if (hit) {
      const c = isr ? 'slope-dot is-israel' : 'slope-dot';
      marks += `<circle cx="${x1}" cy="${y(a)}" r="${isr ? 3.6 : 2.6}" class="${c}"/>`
             + `<circle cx="${x2}" cy="${y(b)}" r="${isr ? 3.6 : 2.6}" class="${c}"/>`;
      const lc = isr ? 'slope-name is-israel' : 'slope-name';
      names += t(x1 - 8, y(a) + 3.5, `${a} ${short(n)}`, lc, 'end')
             + t(x2 + 8, y(b) + 3.5, `${b} ${short(n)}`, lc, 'start');
    }
  }

  /* Headers hug the outer edges on phones so they cannot overrun the frame. */
  const head = narrow
    ? t(0, padT - 26, 'MARKET $', 'slope-head', 'start')
      + t(0, padT - 14, 'nominal', 'slope-sub', 'start')
      + t(W, padT - 26, 'WHAT IT BUYS', 'slope-head', 'end')
      + t(W, padT - 14, 'PPP', 'slope-sub', 'end')
    : t(x1, padT - 26, 'MARKET DOLLARS', 'slope-head', 'end')
      + t(x1, padT - 14, 'nominal GDP per person', 'slope-sub', 'end')
      + t(x2, padT - 26, 'WHAT IT BUYS', 'slope-head', 'start')
      + t(x2, padT - 14, 'PPP GDP per person', 'slope-sub', 'start');

  el.innerHTML = svgWrap(W, H,
    'Slope chart of 38 OECD countries ranked by nominal GDP per person versus ' +
    'PPP GDP per person. Israel falls from 11th to 26th, the largest drop in the OECD.',
    head + lines + marks + names);

  /* Draw Israel's line on. The dash properties are stripped once the
     transition ends so a stalled animation can never leave a broken line. */
  if (!REDUCED) {
    const p = el.querySelector('path.is-israel');
    const len = p && p.getTotalLength ? p.getTotalLength() : 0;
    if (len > 0) {
      const clear = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = ''; };
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.addEventListener('transitionend', clear, { once: true });
      setTimeout(clear, 2200);                       // belt and braces
      requestAnimationFrame(() => {
        p.style.transition = 'stroke-dashoffset 1.15s cubic-bezier(.4,0,.2,1) .25s';
        p.style.strokeDashoffset = 0;
      });
    }
  }
}

/* =================================================================
   2. PRICE LEVEL — horizontal bars, US = 100
   ================================================================= */
function priceLevelChart(el) {
  const W = Math.max(el.clientWidth, 280);
  const narrow = W < 560;
  const order = [...NAMES].sort((a, b) => PRICE_LEVEL[b] - PRICE_LEVEL[a]);
  const row = narrow ? 15 : 17;
  const padT = 34, padB = 30;
  const H = padT + row * order.length + padB;
  const gut = narrow ? 94 : 116;
  const right = narrow ? 40 : 52;
  const max = 140;
  const sx = v => gut + (v / max) * (W - gut - right);

  let g = '';
  /* reference rules at 50 / 100 */
  for (const v of [50, 100]) {
    g += `<line x1="${sx(v)}" y1="${padT - 8}" x2="${sx(v)}" y2="${padT + row * order.length}" class="rule-v"/>`
       + t(sx(v), padT - 14, v === 100 ? 'US = 100' : '50', 'axis-lab', 'middle');
  }
  /* OECD average marker */
  const ax = sx(OECD_AVG_PRICE_LEVEL);
  g += `<line x1="${ax}" y1="${padT - 8}" x2="${ax}" y2="${padT + row * order.length}" class="rule-avg"/>`
     + t(ax, padT + row * order.length + 18, `OECD avg ${OECD_AVG_PRICE_LEVEL}`, 'axis-lab', 'middle');

  order.forEach((n, i) => {
    const yy = padT + i * row;
    const v = PRICE_LEVEL[n];
    const isr = n === 'Israel';
    g += `<rect x="${gut}" y="${yy + 2}" width="${Math.max(sx(v) - gut, 1)}" height="${row - 5}"
           class="bar ${isr ? 'is-israel' : v > 100 ? 'is-high' : ''}" rx="1"/>`
       + t(gut - 8, yy + row / 2 + 2.5, n, `bar-name${isr ? ' is-israel' : ''}`, 'end')
       + t(sx(v) + 6, yy + row / 2 + 2.5, v.toFixed(1), `bar-val${isr ? ' is-israel' : ''}`, 'start');
  });

  el.innerHTML = svgWrap(W, H,
    `Comparative price level of 38 OECD countries, United States = 100. Israel is third
     highest at ${PRICE_LEVEL['Israel']}, against an OECD average of ${OECD_AVG_PRICE_LEVEL}.`, g);
}

/* =================================================================
   3. SCATTER — output per person vs price level, with OLS trend
   ================================================================= */
function scatterChart(el) {
  const W = Math.max(el.clientWidth, 280);
  const narrow = W < 560;
  const H = narrow ? 340 : 400;
  const L = narrow ? 40 : 52, R = 16, T = 22, B = 46;

  const pts = NAMES.map(n => ({ n, x: OECD[n][1], y: PRICE_LEVEL[n] }))
                   .filter(p => p.x < 130000);          // drop LU/IE outliers, noted in caption

  const xmin = 20000, xmax = 120000, ymin = 35, ymax = 140;
  const sx = v => L + (v - xmin) / (xmax - xmin) * (W - L - R);
  const sy = v => T + (1 - (v - ymin) / (ymax - ymin)) * (H - T - B);

  /* OLS over the plotted set */
  const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const b = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) /
            pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const a = my - b * mx;
  const fit = x => a + b * x;

  let g = '';
  for (const v of [40, 60, 80, 100, 120, 140]) {
    g += `<line x1="${L}" y1="${sy(v)}" x2="${W - R}" y2="${sy(v)}" class="rule-h"/>`
       + t(L - 7, sy(v) + 3.5, v, 'axis-lab', 'end');
  }
  for (const v of [40000, 60000, 80000, 100000]) {
    g += t(sx(v), H - B + 18, '$' + v / 1000 + 'k', 'axis-lab', 'middle');
  }

  g += `<line x1="${sx(xmin)}" y1="${sy(fit(xmin))}" x2="${sx(xmax)}" y2="${sy(fit(xmax))}" class="trend"/>`;

  /* Israel's distance from the line */
  const isr = pts.find(p => p.n === 'Israel');
  g += `<line x1="${sx(isr.x)}" y1="${sy(fit(isr.x))}" x2="${sx(isr.x)}" y2="${sy(isr.y)}" class="gap-line"/>`;

  for (const p of pts) {
    const me = p.n === 'Israel';
    g += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${me ? 6 : 3.4}"
           class="dot${me ? ' is-israel' : ''}"><title>${esc(p.n)} — ${money(p.x)}, price level ${p.y}</title></circle>`;
  }

  const gap = Math.round((isr.y / fit(isr.x) - 1) * 100);

  g += t(sx(isr.x) + 11, sy(isr.y) - 3, 'ISRAEL', 'pt-name is-israel')
     + t(sx(isr.x) + 11, sy(isr.y) + 9, `+${gap}% above the line`, 'pt-note')
     + t(L, T - 8, 'PRICE LEVEL  (US = 100)', 'axis-title')
     + t(W - R, H - B + 34, 'OUTPUT PER PERSON, PPP →', 'axis-title', 'end');

  el.innerHTML = svgWrap(W, H,
    'Scatter plot of OECD countries: output per person against price level. Israel sits ' +
    `furthest above the trend line of any OECD country, about ${gap} percent above what its ` +
    'output per person would predict.', g);
}

/* =================================================================
   4. HOUSEHOLD — where a salary goes, before and after
   ================================================================= */
function budgetChart(el) {
  const W = Math.max(el.clientWidth, 280);
  const narrow = W < 560;
  const H = narrow ? 250 : 230;
  const T = 40, B = 44, L = narrow ? 8 : 20;
  const barH = narrow ? 52 : 58, gap = narrow ? 34 : 30;
  const inc = HOUSEHOLD.income;
  const w = W - L * 2;
  const sw = v => v / inc * w;

  const keys = [['rent', 'Rent'], ['food', 'Food'], ['transport', 'Transport'], ['utilities', 'Utilities']];
  let g = '';

  [['now', 'TODAY', T], ['after', 'AFTER A 15% CUT IN PRICES', T + barH + gap]].forEach(([k, lab, y0]) => {
    const set = HOUSEHOLD[k];
    let x = L;
    g += t(L, y0 - 9, lab, 'bud-head');
    keys.forEach(([kk, nice], i) => {
      const ww = sw(set[kk]);
      g += `<rect x="${x}" y="${y0}" width="${ww}" height="${barH}" class="bud bud-${i}"/>`;
      if (ww > (narrow ? 46 : 58)) {
        g += t(x + ww / 2, y0 + barH / 2 - 2, nice, 'bud-lab', 'middle')
           + t(x + ww / 2, y0 + barH / 2 + 12, '₪' + set[kk].toLocaleString(), 'bud-num', 'middle');
      }
      x += ww;
    });
    const left = inc - Object.values(set).reduce((s, v) => s + v, 0);
    g += `<rect x="${x}" y="${y0}" width="${sw(left)}" height="${barH}" class="bud bud-left"/>`
       + t(x + sw(left) / 2, y0 + barH / 2 - 2, 'LEFT OVER', 'bud-lab is-left', 'middle')
       + t(x + sw(left) / 2, y0 + barH / 2 + 12, '₪' + left.toLocaleString(), 'bud-num is-left', 'middle');
  });

  g += t(L, H - 14, 'Same ₪12,000 salary. Nobody got a raise. ₪1,500 appeared.', 'bud-foot');

  el.innerHTML = svgWrap(W, H,
    'Two bars showing a 12,000 shekel monthly salary. Today 2,000 shekels are left after ' +
    'essentials; after a 15 percent fall in prices, 3,500 shekels are left — a 75 percent increase.', g);
}

/* ---- mount + responsive redraw ---- */
const MOUNTS = [
  ['[data-chart="slope"]',  slopeChart],
  ['[data-chart="prices"]', priceLevelChart],
  ['[data-chart="scatter"]', scatterChart],
  ['[data-chart="budget"]', budgetChart]
];

function drawAll() {
  for (const [sel, fn] of MOUNTS)
    document.querySelectorAll(sel).forEach(el => { try { fn(el); } catch (e) { console.error(e); } });
}

let tmr;
window.addEventListener('resize', () => { clearTimeout(tmr); tmr = setTimeout(drawAll, 160); });
document.addEventListener('DOMContentLoaded', drawAll);
