#!/usr/bin/env python3
"""Skin an nbconvert HTML export so it belongs to the site.

nbconvert emits its own stylesheet (white page, its own font stack). The
notebook is linked straight from an essay, so landing on it should not feel
like leaving the site. This injects the site's webfonts and a short override
block -- cream paper, navy ink, marigold accents -- plus a link back.

It only ever appends a <style> to <head>, so re-running nbconvert and then
re-running this is safe and idempotent.

    python3 skin_notebook_html.py gaza-casualty-demographics.html
"""
import re
import sys
from pathlib import Path

MARKER = "<!-- site-skin -->"

SKIN = """<!-- site-skin -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Roboto+Slab:wght@700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --paper: #FCF5E4; --card: #FFFBF0; --panel: #F5ECD6;
    --navy: #12305C; --muted: #5C6779; --line: #E5DAC0;
    --marigold: #F2C230; --blue: #2A6DB0; --brick: #BE3C2C;
  }
  body, .jp-Notebook { background: var(--paper) !important; color: var(--navy) !important; }
  body, .jp-Notebook, .jp-RenderedHTMLCommon {
    font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    color: var(--navy) !important;
  }
  .jp-RenderedHTMLCommon h1, .jp-RenderedHTMLCommon h2,
  .jp-RenderedHTMLCommon h3, .jp-RenderedHTMLCommon h4 {
    font-family: "Roboto Slab", Roboto, Georgia, serif !important;
    font-weight: 700 !important; color: var(--navy) !important;
  }
  .jp-RenderedHTMLCommon a { color: var(--blue) !important; }
  .jp-RenderedHTMLCommon a:hover { color: var(--brick) !important; }
  /* code cells sit on the lighter card surface, like the site's chart boxes */
  .jp-InputArea-editor, .jp-Cell .highlight, .jp-RenderedText {
    background: var(--card) !important; border: 1px solid var(--line) !important;
  }
  .jp-InputArea-editor, .jp-RenderedText, code, pre {
    font-family: "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace !important;
  }
  .jp-InputPrompt, .jp-OutputPrompt { color: var(--muted) !important; }
  /* tables: same treatment as the site's .data tables */
  .jp-RenderedHTMLCommon table { border-collapse: collapse; font-size: 14px; }
  .jp-RenderedHTMLCommon thead th {
    border-bottom: 2px solid var(--navy) !important; color: var(--muted) !important;
    text-transform: uppercase; letter-spacing: .6px; font-size: 11px;
  }
  .jp-RenderedHTMLCommon tbody td, .jp-RenderedHTMLCommon tbody th {
    border-bottom: 1px solid var(--line) !important;
    font-variant-numeric: tabular-nums;
  }
  .jp-RenderedHTMLCommon tbody tr:nth-child(even) { background: transparent !important; }
  .jp-RenderedHTMLCommon tbody tr:hover { background: var(--panel) !important; }
  .jp-RenderedHTMLCommon img { background: transparent; }

  .site-bar {
    max-width: 60rem; margin: 0 auto; padding: 18px 20px 14px;
    border-bottom: 5px solid var(--marigold);
    font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase;
  }
  .site-bar a { color: var(--navy); text-decoration: none; font-weight: 500; }
  .site-bar a:hover { color: var(--brick); }
  .site-bar b { font-family: "Roboto Slab", Roboto, serif; font-size: 20px;
                letter-spacing: -.5px; text-transform: none; margin-right: 18px; }
</style>
"""

BAR = """<div class="site-bar">
  <b><a href="../">David Zeff</a></b>
  <a href="../posts/gaza-casualty-demographics.html">&larr; Back to the essay</a>
</div>
"""


def skin(path: Path) -> None:
    html = path.read_text()
    if MARKER in html:
        html = re.sub(r"<!-- site-skin -->.*?</style>\n?", "", html, flags=re.S)
        html = html.replace(BAR, "")
    head_end = html.index("</head>")
    html = html[:head_end] + SKIN + html[head_end:]
    body_open = re.search(r"<body[^>]*>", html)
    html = html[:body_open.end()] + "\n" + BAR + html[body_open.end():]
    path.write_text(html)
    print(f"skinned {path.name} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    targets = sys.argv[1:] or ["gaza-casualty-demographics.html"]
    for t in targets:
        skin(Path(t))
