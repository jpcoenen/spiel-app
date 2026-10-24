# The BoardGameGeek catalogue for "Add a game": every ranked game (id, name, year, rank), from the daily snapshot of
# BGG's rankings at github.com/beefsack/bgg-ranking-historicals. The app searches it as you type.
# bgg.json  {from, g: [[id, name, year, rank]]}, best ranked first
# bggimg.json  {from, t: ["a|b|c"]}: small box pictures for the first N games of bgg.json (GitHub copy only; claude.ai
# blocks outside pictures), as the three varying parts of cf.geekdo-images.com/{a}__micro/img/{b}=/fit-in/64x64/filters:strip_icc()/{c}
import csv, json, re, sys, gzip, os
src, outdir = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 10000
rows = []
for r in csv.DictReader(open(src, encoding='utf-8')):
    m = re.match(r'https://cf\.geekdo-images\.com/([^/]+)__micro/img/([^/]+)=/fit-in/64x64/filters:strip_icc\(\)/(.+)$', r['Thumbnail'] or '')
    rows.append([int(r['ID']), r['Name'].strip(), int(r['Year'] or 0), int(r['Rank']), '|'.join(m.groups()) if m else ''])
rows.sort(key=lambda x: x[3])
day = os.path.basename(src)[:10]
for name, data in (('bgg.json', {'from': day, 'g': [r[:4] for r in rows]}), ('bggimg.json', {'from': day, 't': [r[4] for r in rows[:N]]})):
    s = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    open(os.path.join(outdir, name), 'w').write(s)
    print(name, len(data.get('g', data.get('t'))), 'entries |', len(s.encode()) // 1024, 'KB |', len(gzip.compress(s.encode())) // 1024, 'KB gzipped')
