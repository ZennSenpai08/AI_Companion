"""Lifecycle TEST FIXTURE only. Never used as the production assistant."""
import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.core.lifecycle import start_parent_watch

mode = sys.argv[1] if len(sys.argv) > 1 else "ready"
secret = json.loads(sys.stdin.readline())["token"]
if mode == "timeout":
    sys.stdin.readline()
    sys.exit(0)
if mode == "fatal":
    print(json.dumps({"type": "fatal", "code": "DEPENDENCIES_MISSING"}), flush=True)
    sys.exit(3)
if mode in {"null", "array"}:
    print("null" if mode == "null" else "[]", flush=True)
    sys.stdin.readline()
    sys.exit(1)
if mode == "junk":
    print("x" * 9000, flush=True)
    sys.stdin.readline()
    sys.exit(1)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def do_GET(self):
        if self.headers.get("Authorization") != "Bearer " + secret:
            self.send_response(401)
            self.end_headers()
            return
        result = {"service": "mika-assistant", "protocol": 1, "status": "ok", "offline": True}
        if mode == "bad-health":
            result["offline"] = False
        data = json.dumps(result).encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


server = HTTPServer(("127.0.0.1", 0), Handler)
print(json.dumps({"type": "ready", "port": server.server_port, "protocol": 1}), flush=True)


if mode == "stubborn":
    start_parent_watch(threading.Event().wait, force_exit_after=0.2)
else:
    start_parent_watch(server.shutdown)
if mode == "crash":
    threading.Thread(target=lambda: (time.sleep(0.5), server.shutdown()), daemon=True).start()
server.serve_forever(poll_interval=0.02)
server.server_close()
