"""Local Ollama HTTP protocol fixture. Never a production model or inference demo."""
import json
import socket
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *_args):
        pass

    def do_POST(self):
        self.close_connection = True
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        self.server.requests.append({"path": self.path, "body": json.loads(body)})
        mode = self.server.mode
        if mode in ("redirect", "missing", "failure"):
            self.send_response({"redirect": 302, "missing": 404, "failure": 500}[mode])
            if mode == "redirect":
                self.send_header("Location", "/capture")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson")
        self.send_header("Transfer-Encoding", "chunked")
        self.end_headers()

        def chunk(data):
            self.wfile.write(f"{len(data):x}\r\n".encode() + data + b"\r\n")
            self.wfile.flush()

        try:
            if mode == "happy":
                raw = (json.dumps({"message": {"content": "Kumusta, José?"}, "done": False},
                                  ensure_ascii=False) + "\n").encode()
                split = raw.index("é".encode()) + 1
                chunk(raw[:split])
                chunk(raw[split:])
                chunk(b'{"message":{"content":" Ayos!"},"done":true}\n')
            elif mode == "stall":
                while True:
                    chunk(b'{"message":{"content":""},"done":false}\n')
                    time.sleep(0.01)
            elif mode == "cancel":
                chunk(b'{"message":{"content":"first"},"done":false}\n')
                self.connection.settimeout(3)
                try:
                    if self.connection.recv(1) == b"":
                        self.server.disconnected.set()
                except (OSError, socket.timeout):
                    pass
                return
            else:
                values = {
                    "invalid-json": b'not json\n',
                    "list": b'[]\n',
                    "null-message": b'{"message":null,"done":true}\n',
                    "invalid-done": b'{"message":{"content":"text"},"done":"yes"}\n',
                    "model-error": b'{"error":"private-sentinel-do-not-echo"}\n',
                    "eof": b'{"message":{"content":"partial"},"done":false}\n',
                    "oversized-line": b'x' * 70000 + b'\n',
                }
                chunk(values[mode])
            self.wfile.write(b"0\r\n\r\n")
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass


class OllamaFixture:
    def __init__(self, mode):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.server.mode = mode
        self.server.requests = []
        self.server.disconnected = threading.Event()
        self.thread = threading.Thread(target=self.server.serve_forever,
                                       kwargs={"poll_interval": 0.01}, daemon=True)

    @property
    def endpoint(self):
        return f"http://127.0.0.1:{self.server.server_port}/api/chat"

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *_args):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
