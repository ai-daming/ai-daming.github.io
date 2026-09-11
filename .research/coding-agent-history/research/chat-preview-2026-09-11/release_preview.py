from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
import json,mimetypes
ROOT=Path(__file__).resolve().parent;SITE=ROOT.parents[3]
m=json.loads((ROOT/'release-manifest.json').read_text());routes={}
for f in m['files']:
 path='/'+f['path'];routes[path]=SITE/f['path']
 if path.endswith('/index.html'):routes[path[:-10]]=SITE/f['path']
 elif path.endswith('.html'):routes[path[:-5]]=SITE/f['path']
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  target=routes.get(urlsplit(self.path).path)
  if target is None:self.send_error(404);return
  data=target.read_bytes();self.send_response(200);self.send_header('Content-Type',(mimetypes.guess_type(target)[0] or 'application/octet-stream')+'; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def log_message(self,*a):pass
print('Production-path preview: http://127.0.0.1:8772/agents-history/',flush=True)
ThreadingHTTPServer(('127.0.0.1',8772),Handler).serve_forever()
