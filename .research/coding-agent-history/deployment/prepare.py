from pathlib import Path
import hashlib,json,shutil,subprocess,sys
here=Path(__file__).resolve().parent
# The confirmed release now includes Chat/readers and market HTML.
publisher=here.parent/'research/chat-preview-2026-09-11/publish.py'
if publisher.exists():
 subprocess.run([sys.executable,str(publisher)],check=True)
 raise SystemExit(0)
site=here.parent.parent.parent
root=here.parent/'research/interactive-scroll-design';src=root/'src'
for check in ['check_backfill.py','check_presentation.py','check_entities.py','check_routes.py']:
 subprocess.run([sys.executable,str(src/check)],check=True,cwd=site)
registry=json.loads((root/'route-manifest.json').read_text())
stage=here/'assets.next'
if stage.exists():shutil.rmtree(stage)
files=[]
for rel in registry['files']:
 assert '..' not in Path(rel).parts and not Path(rel).is_absolute()
 source=site/'agents-history'/rel;dest=stage/'agents-history'/rel
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
 files.append({'path':'agents-history/'+rel,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
assets=here/'assets';previous=here/'assets.previous'
if previous.exists():shutil.rmtree(previous)
if assets.exists():assets.rename(previous)
stage.rename(assets)
manifest={'worker':'daming-ai-agents-history','files':files,'routes':len(registry['routes']),'private_assets_included':False}
(here/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Staged',len(files),'files;',len(registry['routes']),'static routes;',sum(f['bytes'] for f in files),'bytes')
