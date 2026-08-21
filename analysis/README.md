# analysis

Notebooks that produce the numbers behind the essays. Each one is the *source* of a data
file in `assets/`, not a commentary on it — re-running the notebook regenerates the file the
published charts read, so the essay and the analysis cannot drift apart.

| Notebook | Produces | Essay |
|---|---|---|
| `gaza-casualty-demographics.ipynb` | `assets/gaza-data.js` | [Not Indiscriminate: What Hamas's Own Numbers Show](../posts/gaza-casualty-demographics.html) |

A rendered, already-executed copy of each notebook sits beside it as `.html`, so the analysis is
readable on the live site without running anything.

---

## Running the Gaza notebook

The Ministry of Health's named casualty lists are **not redistributed in this repository**.
Download them yourself:

1. Go to [gazadeaths.org/en/sources](https://www.gazadeaths.org/en/sources).
2. Put the CSVs in a folder called `gaza data/` at the repository root — beside `analysis/`,
   not inside it. That folder is gitignored.
3. Keep the published filenames. The notebook reads the list date out of the
   `MoH-YYYY-MM-DD-…csv` filename, and hashes the bytes to detect files that are the same
   export saved twice.

The population denominator **is** in the repository, at `data/pse_admpop_adm1_2023.csv`. It is
Gaza Strip population by five-year age band and sex — Palestinian Central Bureau of Statistics
figures for reference year 2023, published as the OCHA/UNFPA Common Operational Dataset
[`cod-ps-pse`](https://data.humdata.org/dataset/cod-ps-pse). Row `PS02` is the Gaza Strip.

Then:

```bash
pip install jupyter pandas numpy matplotlib scipy
cd analysis
jupyter lab gaza-casualty-demographics.ipynb        # or: jupyter notebook
```

Run all cells. The last two write `../assets/gaza-data.js` and assert that the file it just
wrote reproduces the headline figures.

To regenerate the rendered HTML as well:

```bash
jupyter nbconvert --to notebook --execute --inplace gaza-casualty-demographics.ipynb
jupyter nbconvert --to html --embed-images gaza-casualty-demographics.ipynb
python3 skin_notebook_html.py gaza-casualty-demographics.html
```

That last step matters. nbconvert ships its own white-page stylesheet, and this notebook is
linked straight from an essay — landing on it should not feel like leaving the site.
`skin_notebook_html.py` injects the site's webfonts, the cream/navy/marigold palette and a
link back. It strips any skin it already applied before re-applying, so running it twice is
harmless.

The figures inside the notebook use the same palette, defined at the top of the setup cell.
They deliberately do **not** ask for Roboto: whether a machine has a usable upright Roboto
installed varies, and matplotlib will happily match an italic-only install and render every
figure in italics. The site's pages get real Roboto from Google Fonts; the figures use a
neutral grotesque that renders the same everywhere.

---

## House rules for these notebooks

- **State the cleaning rule once, apply it everywhere, print what it drops.** Every table that
  reports an *n* also reports how many records were excluded to get there.
- **Never merge lists.** The Ministry revises its lists — names are removed between releases,
  not only added — so a merged list is a list that never existed. Report one release at a time.
- **The denominator's bands must match the numerator's exactly.** If they don't, every share is
  wrong. The Gaza notebook asserts that collapsing the source's 17 bands into 14 loses nobody.
- **Nothing is estimated, smoothed, or imputed.** If a number cannot be computed from a source,
  it does not appear.
- **The notebook writes the site's data file, not the other way round.** Files in `assets/`
  generated this way carry a `GENERATED FILE` header naming the notebook that produced them.

The rendered `.html` is a build artefact, but it is committed on purpose: readers of the essay
should be able to check the arithmetic without installing Python.
