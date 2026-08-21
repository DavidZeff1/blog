/* ------------------------------------------------------------------
   charts.js — plain SVG, no dependencies.
   Every chart measures its container and re-renders on resize so that
   1 SVG unit == 1 CSS pixel and label sizes stay honest at any width.
   ------------------------------------------------------------------ */

/* Flags are an enhancement, not a dependency: if flags.js is missing the
   charts still draw, just without them. */
const flag = (typeof FLAG === 'function') ? FLAG : () => '';
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
  const narrow = W < 520;
  const row = narrow ? 12.5 : 15;
  const padT = narrow ? 46 : 54;
  const padB = 26;
  const H = padT + row * 37 + padB;

  const fw = narrow ? 12 : 16;            // flag width; height follows at 3:2
  const labelW = narrow ? 70 : 150;
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

  let lines = '', marks = '', names = '', flags = '';

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
      /* left column reads  name flag <dot, right column  dot> flag name */
      flags += flag(n, x1 - 9 - fw, y(a) - fw / 3, fw)
             + flag(n, x2 + 9, y(b) - fw / 3, fw);
      names += t(x1 - 14 - fw, y(a) + 3.5, `${a} ${short(n)}`, lc, 'end')
             + t(x2 + 14 + fw, y(b) + 3.5, `${b} ${short(n)}`, lc, 'start');
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
    head + lines + marks + flags + names);
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
  const fw = narrow ? 12 : 15;
  const gut = narrow ? 111 : 136;
  /* Three names won't fit beside a flag on a phone, and the flag is
     already doing the identifying, so shorten just those three. */
  const SHORT = { 'United Kingdom': 'UK', 'United States': 'USA', 'New Zealand': 'N. Zealand' };
  const label = n => narrow ? (SHORT[n] || n) : n;
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
       + flag(n, gut - 8 - fw, yy + row / 2 - fw / 3, fw)
       + t(gut - 13 - fw, yy + row / 2 + 2.5, label(n), `bar-name${isr ? ' is-israel' : ''}`, 'end')
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
      if (ww > (narrow ? 46 : 52)) {   // 52 lets "Utilities" get a label at a 40rem column
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

/* =================================================================
   5-7. GAZA CASUALTY DEMOGRAPHY
   These draw nothing until assets/gaza-data.js holds real counts.
   An empty frame reads as "no deaths in this band"; a printed notice
   reads as "not measured yet", which is the true state.
   ================================================================= */
function dataReady(el, what) {
  if (typeof GAZA !== 'undefined' && GAZA.ready && GAZA.ready()) return true;
  el.innerHTML = `<p class="chart-missing"><b>${esc(what)} not loaded.</b>
    Fill in the counts in <code>assets/gaza-data.js</code> and set
    <code>loaded: true</code>. Nothing is estimated for you.</p>`;
  return false;
}

/* 5. Back-to-back pyramid: share of population vs share of the dead. */
function pyramidChart(el) {
  const W = Math.max(el.clientWidth, 280);
  if (!dataReady(el, 'Population and casualty counts')) return;
  const narrow = W < 520;
  const n = GAZA.bands.length;
  const row = narrow ? 19 : 23;
  const padT = 58, padB = 32;
  const H = padT + n * row + padB;
  const gut = narrow ? 46 : 58;
  const half = (W - gut) / 2;
  const xL = half, xR = half + gut;

  const dm = GAZA.share('deaths', 'm'), df = GAZA.share('deaths', 'f');
  const pm = GAZA.share('pop', 'm'),    pf = GAZA.share('pop', 'f');
  const max = Math.max(...dm, ...df, ...pm, ...pf) * 1.08 || 1;
  const w = v => v / max * half;

  let g = t(xL, padT - 34, 'MALE', 'axis-title', 'end')
        + t(xR, padT - 34, 'FEMALE', 'axis-title', 'start')
        + `<rect x="${xL - 96}" y="${padT - 24}" width="9" height="9" class="pyr-pop"/>`
        + t(xL - 83, padT - 16, 'share of population', 'axis-lab', 'start')
        + `<rect x="${xR + 4}" y="${padT - 24}" width="9" height="9" class="pyr-death"/>`
        + t(xR + 17, padT - 16, 'share of the dead', 'axis-lab', 'start');

  GAZA.bands.forEach((b, i) => {
    const y = padT + i * row, hp = row - 4, hd = Math.round((row - 4) * .56);
    const yd = y + (hp - hd) / 2;
    g += `<rect x="${xL - w(pm[i])}" y="${y}" width="${w(pm[i])}" height="${hp}" class="pyr-pop"/>`
       + `<rect x="${xR}" y="${y}" width="${w(pf[i])}" height="${hp}" class="pyr-pop"/>`
       + `<rect x="${xL - w(dm[i])}" y="${yd}" width="${w(dm[i])}" height="${hd}" class="pyr-death"/>`
       + `<rect x="${xR}" y="${yd}" width="${w(df[i])}" height="${hd}" class="pyr-death"/>`
       + t(xL + gut / 2, y + hp / 2 + 3.5, b, 'axis-lab', 'middle');
  });
  g += t(xL, H - padB + 16, `${max.toFixed(0)}%`, 'axis-lab', 'start')
     + t(xR, H - padB + 16, `${max.toFixed(0)}%`, 'axis-lab', 'end');

  el.innerHTML = svgWrap(W, H,
    'Population pyramid of Gaza compared with the age and sex distribution of named deaths.', g);
}

/* 6. Male deaths per female death, by age band. */
function sexRatioChart(el) {
  const W = Math.max(el.clientWidth, 280);
  if (!dataReady(el, 'Casualty counts')) return;
  const H = W < 520 ? 260 : 300;
  const L = 42, R = 14, T = 26, B = 52;
  const r = GAZA.sexRatio();
  const top = Math.max(3.5, Math.ceil(Math.max(...r.filter(v => v !== null)) * 1.15));
  const n = GAZA.bands.length;
  const sx = i => L + (i + .5) * (W - L - R) / n;
  const sy = v => T + (1 - v / top) * (H - T - B);

  let g = '';
  for (let v = 0; v <= top; v += 1)
    g += `<line x1="${L}" y1="${sy(v)}" x2="${W - R}" y2="${sy(v)}" class="rule-h"/>`
       + t(L - 7, sy(v) + 3.5, v.toFixed(0), 'axis-lab', 'end');

  /* The same ratio in the living population -- what a flat, indiscriminate
     line would sit on. Drawn from the data rather than assumed, so the
     reference cannot drift away from the counts it is compared against. */
  const pr = GAZA.popSexRatio();
  g += `<path d="${pr.map((v, i) => (i ? 'L' : 'M') + sx(i) + ' ' + sy(v)).join(' ')}"
         class="rule-avg" fill="none"/>`
     + t(L + 6, sy(pr[0]) + 14, 'ratio in the living population', 'axis-lab', 'start');

  let d = '', open = false;
  r.forEach((v, i) => {
    if (v === null) { open = false; return; }
    d += (open ? ' L' : ' M') + sx(i) + ' ' + sy(v); open = true;
    g += `<circle cx="${sx(i)}" cy="${sy(v)}" r="3.2" class="dot"/>`;
  });
  g = `<path d="${d.trim()}" class="ratio-line" fill="none"/>` + g;

  GAZA.bands.forEach((b, i) => {
    if (i % (W < 520 ? 2 : 1) === 0) g += t(sx(i), H - B + 18, b, 'axis-lab', 'middle');
  });
  g += t(L, T - 10, 'MALE DEATHS PER FEMALE DEATH', 'axis-title')
     + t(W - R, H - B + 38, 'AGE BAND →', 'axis-title', 'end');

  el.innerHTML = svgWrap(W, H,
    'Ratio of male to female named deaths by age band, against the natural birth ratio of 1.05.', g);
}

/* 7. Deaths a group would hold if the dead were drawn at random from
      the living, against the deaths it actually holds. */
function expectedChart(el) {
  const W = Math.max(el.clientWidth, 280);
  if (!dataReady(el, 'Population and casualty counts')) return;
  /* Same four groups as the notebook figure, in the same order, so the
     essay and the analysis show the reader the same comparison. */
  const GROUPS = [
    { lab: 'Under 15',      from: 0, to: 2,  sex: null },
    { lab: 'Males 15-59',   from: 3, to: 11, sex: 'm' },
    { lab: 'Males 25-54',   from: 5, to: 10, sex: 'm' },
    { lab: 'Females 25-54', from: 5, to: 10, sex: 'f' }
  ].map(q => ({ ...q, ...GAZA.expected(q.from, q.to, q.sex) }));

  const H = 74 + GROUPS.length * 62;
  const L = W < 520 ? 96 : 118, R = 58;
  const max = Math.max(...GROUPS.flatMap(q => [q.expected, q.actual])) * 1.06 || 1;
  const bw = v => v / max * (W - L - R);

  let g = `<rect x="${L}" y="26" width="9" height="9" class="bar-exp"/>`
        + t(L + 13, 34, 'expected if deaths were drawn at random', 'axis-lab', 'start')
        + `<rect x="${L}" y="40" width="9" height="9" class="bar-act"/>`
        + t(L + 13, 48, 'actual', 'axis-lab', 'start');

  GROUPS.forEach((q, i) => {
    const y = 74 + i * 62;
    g += t(L - 9, y + 22, q.lab, 'bar-name', 'end')
       + `<rect x="${L}" y="${y}" width="${bw(q.expected)}" height="17" class="bar-exp"/>`
       + t(L + bw(q.expected) + 6, y + 13, Math.round(q.expected).toLocaleString(), 'bar-val', 'start')
       + `<rect x="${L}" y="${y + 21}" width="${bw(q.actual)}" height="17" class="bar-act"/>`
       + t(L + bw(q.actual) + 6, y + 34, Math.round(q.actual).toLocaleString(), 'bar-val', 'start')
       + t(L, y + 54, `${q.popShare.toFixed(1)}% of the population`, 'axis-lab', 'start');
  });

  el.innerHTML = svgWrap(W, H,
    'Deaths expected in each group if the dead were a random draw from the living, against actual deaths.', g);
}

/* ---- mount + responsive redraw ---- */
const MOUNTS = [
  ['[data-chart="slope"]',  slopeChart],
  ['[data-chart="prices"]', priceLevelChart],
  ['[data-chart="scatter"]', scatterChart],
  ['[data-chart="budget"]', budgetChart],
  ['[data-chart="pyramid"]', pyramidChart],
  ['[data-chart="sexratio"]', sexRatioChart],
  ['[data-chart="expected"]', expectedChart]
];

function drawAll() {
  for (const [sel, fn] of MOUNTS)
    document.querySelectorAll(sel).forEach(el => { try { fn(el); } catch (e) { console.error(e); } });
}

let tmr;
window.addEventListener('resize', () => { clearTimeout(tmr); tmr = setTimeout(drawAll, 160); });
document.addEventListener('DOMContentLoaded', drawAll);
