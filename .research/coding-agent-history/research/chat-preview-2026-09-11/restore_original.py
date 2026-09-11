from pathlib import Path
import re,json,shutil
ROOT=Path(__file__).resolve().parent;SITE=ROOT.parents[3];OUT=ROOT/'site'
from market_build import build_market, reading_market
build_market()
manifest=json.loads((ROOT.parent/'interactive-scroll-design/route-manifest.json').read_text())
# Reuse original page, CSS, data and JS byte-for-byte. Overlay owns its own DOM only.
panel=(ROOT/'shell.html').read_text();panel=panel[panel.index('<button id="chat-launch"'):panel.index('</body>')]
def strip_addons(text):
 return re.sub(r'<!--agents-history-(addon|market)-start-->.*?<!--agents-history-\1-end-->','',text,flags=re.S)
for r in manifest['routes']:
 source=strip_addons((SITE/'agents-history'/r['file']).read_text())
 injection='<link rel="stylesheet" href="/preview-assets/overlay.css"><link rel="stylesheet" href="/preview-assets/markdown.css"><script defer src="/preview-assets/marked.umd.js"></script><script defer src="/preview-assets/markdown.js"></script><link rel="stylesheet" href="/preview-assets/context.css"><script defer src="/preview-assets/context.js"></script><link rel="stylesheet" href="/preview-assets/market.css"><script defer src="/preview-assets/market.js"></script><script defer src="/preview-assets/overlay.js"></script>'
 result=source.replace('</head>','<!--agents-history-addon-start-->'+injection+'<!--agents-history-addon-end--></head>').replace('</body>','<!--agents-history-addon-start-->'+panel+'<!--agents-history-addon-end--></body>')
 target=OUT/'agents-history'/r['file'];target.parent.mkdir(parents=True,exist_ok=True);target.write_text(result)
for f in manifest['files']:
 if f.startswith('assets/'):
  p=OUT/'agents-history'/f;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(SITE/'agents-history'/f,p)
# Reading-only pages are a separate, non-database source for Chat, not a replacement UI.
routes={r['path']:'agents-history/'+r['file'] for r in manifest['routes']}
for route,rel in list(routes.items()):
 if not route.startswith('/agents-history/'):continue
 source=strip_addons((SITE/rel).read_text());m=re.search(r'<div id="static-content">(.*?)</div>\s*<main id="main">',source,re.S)
 assert m,route
 target=OUT/'reading'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_text('<!doctype html><html><head><meta charset="utf-8"><title>阅读资料</title></head><body><main id="paper">'+m[1]+'<!--market-reading-start-->'+reading_market(route,'en' if '/agents-history/en/' in route else 'zh')+'<!--market-reading-end--></main></body></html>')
 routes['/reading'+route]='reading/'+rel
for f in manifest['files']:
 if f.startswith('assets/'):routes['/agents-history/'+f]='agents-history/'+f
for name in ['overlay.js','overlay.css','marked.umd.js','markdown.js','marked-LICENSE.md','markdown.css','context.js','context.css','market.js','market.css']:
 target=OUT/'preview-assets'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text((ROOT/name).read_text());routes['/preview-assets/'+name]='preview-assets/'+name
for language in ['zh','en']:routes['/preview-assets/market-'+language+'.html']='preview-assets/market-'+language+'.html'
(ROOT/'routes.json').write_text(json.dumps(routes,ensure_ascii=False))
print('Restored original pages and assets; Chat is an additive overlay.')
