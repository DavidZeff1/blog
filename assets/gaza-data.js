/* ------------------------------------------------------------------
   gaza-data.js — counts behind the casualty-demography essay.

   NOTHING IS FILLED IN. The charts will not draw until it is, and they
   will say so on the page rather than showing an empty frame. Every
   number below has to be computed from the Gaza Health Ministry's
   published lists and from a published population baseline. Do not
   estimate them, and do not let anyone else estimate them for you --
   the entire argument of the essay is that these particular numbers
   are checkable, so they have to actually be the numbers.

   HOW TO FILL IT IN
   -----------------
   deaths.m / deaths.f
     Count of named records per age band and sex, from ONE list. Say
     which list in `source` -- do not merge lists, because they revise
     and overlap. Age is (date of list) minus (date of birth). Records
     with a missing or unparseable DOB or sex go in `excluded`, and
     that number gets printed in the chart footnote.

   pop.m / pop.f
     Population by the SAME bands and the SAME sex split, from a
     published projection (PCBS or equivalent) for a stated date. Name
     it in `popSource`. The bands must match exactly or every share in
     the essay is wrong.

   Both arrays must be the same length as `bands`, in the same order.
   Set `loaded: true` only once all four arrays are real.
   ------------------------------------------------------------------ */

const GAZA = {
  loaded: false,

  source:    '',   // e.g. 'Gaza MoH named list, 31 March 2025, n = 60,199'
  popSource: '',   // e.g. 'PCBS projection, mid-2023'
  excluded:  0,    // records dropped for missing/unparseable age or sex

  bands: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34',
          '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+'],

  deaths: { m: [], f: [] },
  pop:    { m: [], f: [] }
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
