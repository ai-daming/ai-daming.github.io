"""Prepare the approved static release. Does not deploy or push."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib,shutil,subprocess,sys
ROOT=Path(__file__).resolve().parent;SITE=ROOT.parents[3];PUB=SITE/'agents-history';DEPLOY=ROOT.parents[1]/'deployment'
subprocess.run([sys.executable,str(ROOT/'build.py')],check=True)
registry=json.loads((ROOT.parent/'interactive-scroll-design/route-manifest.json').read_text())
routes=json.loads((ROOT/'routes.json').read_text());preview=ROOT/'site'
files={};readers=[]
def production_text(s):
 s=s.replace("fetch('/reading'+u.pathname,", "fetch('/agents-history/reading/'+u.pathname.slice('/agents-history/'.length),")
 return s.replace('/preview-assets/','/agents-history/chat-assets/')
# Original routes and original rendering assets.
for rel in registry['files']:
 source=preview/'agents-history'/rel
 if rel=='sitemap.xml':source=PUB/rel
 raw=source.read_bytes()
 if source.suffix in ('.html','.js','.css'):raw=production_text(raw.decode()).encode()
 files[rel]=raw
# Overlay resources, excluding obsolete experiments and every research dataset.
for url,rel in routes.items():
 if url.startswith('/preview-assets/'):
  dest='chat-assets/'+url.removeprefix('/preview-assets/');raw=(preview/rel).read_bytes()
  if Path(rel).suffix in ('.html','.js','.css','.md'):raw=production_text(raw.decode()).encode()
  files[dest]=raw
for route in registry['routes']:
 suffix=route['path'].removeprefix('/agents-history/')
 dest='reading/'+route['file'];source=preview/'reading/agents-history'/route['file'];html=source.read_text()
 html=html.replace('<html>', '<html lang="'+('en' if route['locale']=='en' else 'zh-CN')+'">')
 html=html.replace('</head>','<meta name="robots" content="noindex,follow"><link rel="canonical" href="https://daming.ai'+route['path']+'"></head>')
 files[dest]=production_text(html).encode();readers.append({'path':'/agents-history/reading/'+suffix,'file':dest})
 # Market evidence remains readable in each canonical page even without scripts.
 extra=re.search(r'<!--market-reading-start-->(.*?)<!--market-reading-end-->',html,re.S)
 if extra and extra[1]:
  text=files[route['file']].decode();needle='</div>\n<main id="main">'
  assert needle in text
  text=text.replace(needle,'<!--agents-history-market-start-->'+extra[1]+'<!--agents-history-market-end-->'+needle,1)
  files[route['file']]=text.encode()
class Links(HTMLParser):
 def __init__(self,s):super().__init__();self.urls=[];self.feed(s)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag in ('script','link'):
   u=attrs.get('src') or attrs.get('href')
   if u and u.startswith('/'):self.urls.append(u)
assert len(registry['routes'])==218 and len(readers)==218
for rel,raw in files.items():
 assert not any(x in raw for x in [b'/Users/',b'.agent-reach',b'.wxview',b'yinwm',b'local-context-test-key',b'local-preview-test-key',b'__contextTest',b'__chatTest']),rel
 if rel.endswith(('.html','.js','.css')):
  s=raw.decode();assert '/preview-assets/' not in s and "fetch('/reading'" not in s,rel
  if rel.endswith('.html'):
   for u in Links(s).urls:assert u.removeprefix('/agents-history/') in files,(rel,u)
for r in registry['routes']:
 text=files[r['file']].decode();assert text.count('id="chat"')==1 and text.count('/chat-assets/overlay.js')==1
 assert 'G-K1TQ51VBZB' in text and '<link rel="canonical" href="https://daming.ai'+r['path']+'">' in text
 assert 'noindex' not in text
for r in readers:assert 'noindex,follow' in files[r['file']].decode()
assert not any(n.endswith(('.json','.csv','.xlsx')) for n in files if n.startswith('chat-assets/'))
# Only now write the validated public files and isolated deployment stage.
stage=DEPLOY/'assets.next';stage.mkdir(parents=True,exist_ok=True)
if any(stage.iterdir()):shutil.rmtree(stage);stage.mkdir()
manifest=[]
for rel,raw in files.items():
 for base in [PUB,stage/'agents-history']:
  dst=base/rel;dst.parent.mkdir(parents=True,exist_ok=True);pending=dst.with_suffix(dst.suffix+'.pending');pending.write_bytes(raw);pending.replace(dst)
 manifest.append({'path':'agents-history/'+rel,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
previous=DEPLOY/'assets.previous'
if previous.exists():shutil.rmtree(previous)
if (DEPLOY/'assets').exists():(DEPLOY/'assets').rename(previous)
stage.rename(DEPLOY/'assets')
result={'worker':'daming-ai-agents-history','files':manifest,'routes':218,'readers':readers,'private_assets_included':False}
(DEPLOY/'manifest.json').write_text(json.dumps(result,indent=2));(ROOT/'release-manifest.json').write_text(json.dumps(result,indent=2))
print('Validated and staged',len(files),'public files;',len(readers),'noindex readers;',round(sum(len(v) for v in files.values())/1000000,1),'MB')
