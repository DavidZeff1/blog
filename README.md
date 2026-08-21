# david-zeff-blog

Essays on economics, policy and data. Static HTML, no build step, no dependencies.

**Live:** _(add your Vercel URL here once deployed)_

---

## Running it locally

There is nothing to install and nothing to compile.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

---

## How it's put together

```
index.html                              home + essay list
about.html
posts/
  israel-cost-of-living.html            Essay 001
  gaza-casualty-demographics.html       Essay 002
assets/
  styles.css                            design tokens + all styling
  data.js                               OECD income and price numbers
  gaza-data.js                          GENERATED — casualty and population counts
  charts.js                             SVG chart renderers
analysis/
  gaza-casualty-demographics.ipynb      the notebook that writes gaza-data.js
  gaza-casualty-demographics.html       an executed render of it, for readers
  data/                                 small public reference datasets
vercel.json                             cache headers
```

Some data files are **generated**, not typed. `assets/gaza-data.js` is written by
`analysis/gaza-casualty-demographics.ipynb` and carries a `GENERATED FILE` header saying so;
edit the notebook and re-run it, never the file. See [`analysis/README.md`](analysis/README.md)
for how to run it and what the raw inputs are.

The Gaza Ministry of Health's named casualty lists are not redistributed in this repository —
`gaza data/` is gitignored. Download them from
[gazadeaths.org](https://www.gazadeaths.org/en/sources) to reproduce that essay.

Three files carry the whole design system:

- **`styles.css`** — the palette and type scale live in `:root` at the top. Change a token
  there and it propagates everywhere, charts included, because the SVG reads the same
  CSS variables.
- **`data.js`** — the dataset. Nominal and PPP GDP per capita for all 38 OECD members.
  Rankings, price levels and the OECD average are *derived* at load time, never typed
  in by hand, so they cannot drift out of sync with the source numbers.
- **`charts.js`** — four chart functions, plain SVG, no library. Each one measures its
  container and re-renders on resize, so one SVG unit is always one CSS pixel and labels
  stay legible from 320px up.

### Checking the arithmetic

The essay invites readers to verify the numbers, so the dataset is exposed on `window`.
Open the console on any page:

```js
PRICE_LEVEL['Israel']        // 118.1
RANK_NOMINAL['Israel']       // 11
RANK_PPP['Israel']           // 26
OECD_AVG_PRICE_LEVEL         // 77.7
```

---

## Adding an essay

1. Copy `posts/israel-cost-of-living.html` to `posts/your-slug.html`.
2. Replace the content inside `<div class="prose">`. Update `<title>`, the meta
   description, and the `og:` tags.
3. Add an entry to the `.postlist` in `index.html` and bump the essay number.
4. If it needs charts, add the data to `data.js`, write a render function in
   `charts.js`, register it in the `MOUNTS` array, and drop a
   `<div data-chart="yourname"></div>` where you want it.

Useful classes already available: `.lede` (drop cap), `.pull` (pull quote),
`.note` (sourcing / caveat box), `.keylist` (the key-numbers strip),
`.figure--wide` (breaks out of the reading column), `em.term` (defined term).

---

## Deploying

Vercel detects this as a static site. No framework preset, no build command,
no output directory — import the repo and deploy.

To switch to extensionless URLs later, add `"cleanUrls": true` to `vercel.json`
and drop the `.html` from the internal links.

---

## Sources

Income and price figures are IMF *World Economic Outlook*, April 2026 (2026 projections).
Rankings are computed across the 38 OECD member countries so the comparison group stays
consistent between the nominal and PPP columns.

Comparative price level is derived as nominal GDP per capita ÷ PPP GDP per capita,
indexed to the United States at 100.

Qualitative claims about trade barriers, product-market regulation, food-retail
concentration and administrative burden come from the OECD *Economic Survey of
Israel, 2025*.

### Essay 002 — Gaza casualty demography

Casualty counts are the Gaza Ministry of Health's own published named lists, archived at
[gazadeaths.org](https://www.gazadeaths.org/en/sources). Ten files, nine distinct lists (two
are byte-identical), January 2024 to July 2025.

Population shares use Palestinian Central Bureau of Statistics figures for the Gaza Strip,
reference year 2023, published as the OCHA/UNFPA Common Operational Dataset
[`cod-ps-pse`](https://data.humdata.org/dataset/cod-ps-pse), collapsed from 17 five-year bands
to the 14 the casualty counts use so that numerator and denominator carry identical cut-offs.

Corrections welcome — open an issue.

---

© 2026 David Zeff
