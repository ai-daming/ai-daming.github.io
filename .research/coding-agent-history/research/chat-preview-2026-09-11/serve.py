from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
import json,mimetypes
ROOT=Path(__file__).resolve().parent;SITE=ROOT/'site'
ROUTES=json.loads((ROOT/'routes.json').read_text());ROUTES.update({'/':'agents-history/index.html'})
class Server(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.headers.get('Host','').split(':')[0] not in ('127.0.0.1','localhost'):self.send_error(403);return
  path=urlsplit(self.path).path
  if path not in ROUTES:self.send_error(404);return
  p=SITE/ROUTES[path];data=p.read_bytes();self.send_response(200);self.send_header('Content-Type',(mimetypes.guess_type(p)[0] or 'application/octet-stream')+'; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
print('Local reading/chat preview: http://127.0.0.1:8771/agents-history/',flush=True)
ThreadingHTTPServer(('127.0.0.1',8771),Server).serve_forever()
