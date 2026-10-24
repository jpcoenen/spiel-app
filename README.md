# spielplan

Unofficial companion for SPIEL Essen 2026, served by GitHub Pages: https://jpcoenen.github.io/spiel-app/

`index.html` is the whole app; data files sit next to it (`data.json`, `maps.json`, `maps/`, `covers/`).

`bgg.json` and `bggimg.json` hold BoardGameGeek's ranked games (names, years, ranks, small box pictures) for the
search and for adding games that are not at SPIEL. The workflow in `.github/workflows/bgg-list.yml` rebuilds them every
Monday from the newest snapshot at https://github.com/beefsack/bgg-ranking-historicals with `tools/bgg_catalog.py`;
"Run workflow" on the Actions tab does it at once.
