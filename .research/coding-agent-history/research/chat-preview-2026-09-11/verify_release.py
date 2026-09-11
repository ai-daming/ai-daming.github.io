from pathlib import Path
import json,sys,hashlib,subprocess,concurrent.futures,argparse,urllib.parse
ROOT=Path(__file__).resolve().parent;SITE=ROOT.parents[3];DEPLOY=ROOT.parents[1]/'deployment'
p=argparse.ArgumentParser();p.add_argument('--origin',default='https://daming.ai');p.add_argument('--version',required=True);p.add_argument('--retry-failed',action='store_true');args=p.parse_args()
manifest=json.loads((ROOT/'release-manifest.json').read_text());routes=json.loads((ROOT.parent/'interactive-scroll-design/route-manifest.json').read_text())['routes']
checks=[(r['path'],SITE/'agents-history'/r['file'],200) for r in routes]
checks += [(r['path'],SITE/'agents-history'/r['file'],200) for r in manifest['readers']]
checks += [('/'+r['path'],SITE/r['path'],200) for r in manifest['files'] if '/chat-assets/' in r['path'] or '/assets/' in r['path'] or r['path'].endswith('sitemap.xml')]
checks += [(p,None,404) for p in ['/agents-history/not-a-page','/agents-history/reading/objects/not-real','/agents-history/chat-assets/sample.json','/agents-history/.research/README.md']]
if args.origin=='https://daming.ai':checks += [('/',DEPLOY/'home-before.html',200),('/about/',DEPLOY/'about-before.html',200)]
old=None
report_path=DEPLOY/('chat-market-live-verification.json' if args.origin=='https://daming.ai' else 'chat-market-local-verification.json')
if args.retry_failed:
 old=json.loads(report_path.read_text());assert old['version']==args.version and old['origin']==args.origin
 failed={r['path'] for r in old['checks'] if not r['ok']}
 checks=[c for c in checks if c[0] in failed]
def check(item):
 path,reference,code=item
 proc=subprocess.run(['curl','--compressed','--silent','--show-error','--location','--max-time','60','--write-out','\n%{http_code}',args.origin+path],capture_output=True)
 if proc.returncode:return {'path':path,'ok':False,'error':proc.stderr.decode(errors='replace')}
 body,status=proc.stdout.rsplit(b'\n',1);status=int(status)
 match=reference is None or hashlib.sha256(body).digest()==hashlib.sha256(reference.read_bytes()).digest()
 return {'path':path,'status':status,'hash_matches':match,'ok':status==code and match}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(check,checks))
if old:
 replacements={r['path']:r for r in results}
 results=[replacements.get(r['path'],r) for r in old['checks']]
report={'version':args.version,'origin':args.origin,'checked':len(results),'all_passed':all(r['ok'] for r in results),'checks':results}
(DEPLOY/('chat-market-live-verification.json' if args.origin=='https://daming.ai' else 'chat-market-local-verification.json')).write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='checks'}));bad=[r for r in results if not r['ok']]
if bad:print(json.dumps(bad));raise SystemExit(1)
