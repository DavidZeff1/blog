/* ------------------------------------------------------------------
   gaza-data.js - counts behind the casualty-demography essay.

   GENERATED FILE. Do not hand-edit.
   Produced by analysis/gaza-casualty-demographics.ipynb; re-run that
   notebook to regenerate. Every number below is a count, not an
   estimate: `deaths` tallies named records in ONE published Gaza MoH
   list, `pop` is a published PCBS population figure. The age bands of
   the two match exactly, which is what makes the shares comparable.
   ------------------------------------------------------------------ */

const GAZA = {
  loaded: true,

  source:    'Gaza MoH named list, 2025-07-31, n = 60,199',
  popSource: 'PCBS Gaza Strip, 2023, via OCHA/UNFPA COD cod-ps-pse',
  excluded:  0,    // records dropped for missing/unparseable age or sex

  bands: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34',
          '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+'],

  deaths: {
    m: [  2503,   2545,   3104,   4453,   4730,   4984,   5109,   3833,   2529,   1824,   1423,   1197,    965,   1791],
    f: [  2241,   2277,   2154,   1832,   1579,   1704,   1619,   1170,    890,    775,    657,    638,    536,   1137]
  },
  pop: {
    m: [171595, 145276, 141660, 120553,  98073,  97192,  87562,  64156,  49109,  41317,  31260,  28753,  20588,  30832],
    f: [165462, 139182, 135532, 115384,  93854,  94657,  85986,  64356,  49977,  41214,  30876,  27135,  19882,  35121]
  }
};
/* --- derived, computed only when the counts are actually present --- */
GAZA.ready = () => GAZA.loaded
  && [GAZA.deaths.m, GAZA.deaths.f, GAZA.pop.m, GAZA.pop.f]
       .every(a => Array.isArray(a) && a.length === GAZA.bands.length
                   && a.every(v => typeof v === 'number' && isFinite(v) && v >= 0));

GAZA.totals = () => {
  const sum = a => a.reduce((s, v) => s + v, 0);
  return {
    deaths: sum(GAZA.deaths.m) + sum(GAZA.deaths.f),
    pop:    sum(GAZA.pop.m)    + sum(GAZA.pop.f)
  };
};

/* Share of the whole, as a percentage, per band and sex. */
GAZA.share = (which, sex) => {
  const t = GAZA.totals()[which === 'deaths' ? 'deaths' : 'pop'];
  return GAZA[which][sex].map(v => t ? v / t * 100 : 0);
};

/* Male deaths per female death, per band. Null where there are no
   female deaths in a band, so the chart breaks the line rather than
   drawing a fabricated point. */
GAZA.sexRatio = () =>
  GAZA.bands.map((_, i) => GAZA.deaths.f[i] ? GAZA.deaths.m[i] / GAZA.deaths.f[i] : null);

/* The same ratio in the living population -- the honest reference line.
   This is what the death ratio would sit on at every age if nothing about
   being male or female changed your chance of being killed. */
GAZA.popSexRatio = () =>
  GAZA.bands.map((_, i) => GAZA.pop.f[i] ? GAZA.pop.m[i] / GAZA.pop.f[i] : null);

/* Deaths a band would hold if the dead were drawn at random from the
   living, against the deaths it actually holds. */
GAZA.expected = (fromBand, toBand, sex) => {
  const t = GAZA.totals();
  const idx = GAZA.bands.map((_, i) => i).filter(i => i >= fromBand && i <= toBand);
  const sexes = sex ? [sex] : ['m', 'f'];
  const pop    = idx.reduce((s, i) => s + sexes.reduce((q, k) => q + GAZA.pop[k][i], 0), 0);
  const actual = idx.reduce((s, i) => s + sexes.reduce((q, k) => q + GAZA.deaths[k][i], 0), 0);
  return { expected: t.pop ? pop / t.pop * t.deaths : 0, actual, popShare: t.pop ? pop / t.pop * 100 : 0 };
};

if (typeof window !== 'undefined') Object.assign(window, { GAZA });
if (typeof module !== 'undefined') module.exports = { GAZA };
