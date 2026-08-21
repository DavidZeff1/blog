/* ------------------------------------------------------------------
   data.js - every OECD number used on this site lives here.

   GENERATED FILE. Do not hand-edit.
   Produced by analysis/israel-cost-of-living.ipynb, which pulls the
   series from the IMF DataMapper API and asserts that every figure
   quoted in the essay still reproduces. Re-run that notebook to
   regenerate.

   Source: IMF World Economic Outlook, 2026 projections, indicators
   NGDPDPC and PPPPC, OECD member countries only (38).

   nominal = GDP per capita, current US$
   ppp     = GDP per capita, current international $ (PPP)

   Price level is DERIVED below: nominal / ppp * 100. That ratio is the
   implied PPP conversion factor over the market exchange rate -- i.e.
   the comparative price level, US = 100.
   ------------------------------------------------------------------ */

const OECD = {
  "Luxembourg":     [158733, 156719],
  "Ireland":        [140186, 159129],
  "Switzerland":    [126177, 105680],
  "Iceland":        [110048,  82730],
  "Norway":         [105877, 115548],
  "United States":  [ 94430,  94430],
  "Denmark":        [ 83445,  89667],
  "Netherlands":    [ 79918,  87773],
  "Australia":      [ 75648,  74755],
  "Sweden":         [ 70676,  77094],
  "Israel":         [ 69804,  59095],
  "Austria":        [ 67761,  78334],
  "Germany":        [ 65303,  76747],
  "Belgium":        [ 65112,  78607],
  "United Kingdom": [ 61056,  67585],
  "Canada":         [ 60305,  70006],
  "Finland":        [ 60130,  68861],
  "France":         [ 52083,  68567],
  "New Zealand":    [ 52023,  58308],
  "Italy":          [ 46505,  65761],
  "Spain":          [ 41563,  59187],
  "Slovenia":       [ 40630,  60664],
  "Czechia":        [ 39795,  63550],
  "Estonia":        [ 37718,  51653],
  "Korea":          [ 37412,  68624],
  "Lithuania":      [ 36545,  61052],
  "Japan":          [ 35703,  59207],
  "Portugal":       [ 35434,  52841],
  "Poland":         [ 31336,  59792],
  "Slovakia":       [ 31242,  49466],
  "Greece":         [ 29696,  47175],
  "Latvia":         [ 28913,  45840],
  "Hungary":        [ 28430,  50570],
  "Costa Rica":     [ 20299,  34157],
  "Chile":          [ 20240,  37336],
  "Türkiye":        [ 19018,  46672],
  "Mexico":         [ 15779,  26643],
  "Colombia":       [ 10104,  23576]
};
/* ---- derived series, computed once at load ---- */

const NAMES = Object.keys(OECD);

const PRICE_LEVEL = Object.fromEntries(
  NAMES.map(n => [n, +(OECD[n][0] / OECD[n][1] * 100).toFixed(1)])
);

const RANK_NOMINAL = Object.fromEntries(
  [...NAMES].sort((a, b) => OECD[b][0] - OECD[a][0]).map((n, i) => [n, i + 1])
);

const RANK_PPP = Object.fromEntries(
  [...NAMES].sort((a, b) => OECD[b][1] - OECD[a][1]).map((n, i) => [n, i + 1])
);

const OECD_AVG_PRICE_LEVEL =
  +(NAMES.reduce((s, n) => s + PRICE_LEVEL[n], 0) / NAMES.length).toFixed(1);

/* Illustrative household arithmetic from the essay — not measured data.
   Roughly tracks an average Israeli net monthly wage. */
const HOUSEHOLD = {
  income: 12000,
  now:    { rent: 4800, food: 2600, transport: 1400, utilities: 1200 },
  after:  { rent: 4000, food: 2100, transport: 1200, utilities: 1200 }
};

/* Exposed deliberately: the essay invites readers to check the arithmetic,
   so open the console and do it. */
Object.assign(window, {
  OECD, NAMES, PRICE_LEVEL, RANK_NOMINAL, RANK_PPP, OECD_AVG_PRICE_LEVEL, HOUSEHOLD
});
