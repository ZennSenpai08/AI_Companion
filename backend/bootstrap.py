"""Supervised service entry point. Credentials arrive only on anonymous stdin pipe.

The parent keeps stdin open. EOF requests shutdown even if Electron was killed. No
subprocesses are spawned and no reload/multiworker mode is used.
"""
import importlib.util
import json
import socket
import sys

from backend.core.lifecycle import start_parent_watch
from backend.core.security import valid_token


def emit(event):
    print(json.dumps(event), flush=True)


def main():
    try:
        bootstrap = json.loads(sys.stdin.buffer.readline(4097))
        token = bootstrap["token"]
        if not isinstance(token, str) or not valid_token(token):
            raise ValueError("Invalid credential")
    except (ValueError, KeyError, TypeError):
        emit({"type": "fatal", "code": "INVALID_BOOTSTRAP"})
        return 2

    missing = [name for name in ("fastapi", "uvicorn") if not importlib.util.find_spec(name)]
    if missing:
        emit({"type": "fatal", "code": "DEPENDENCIES_MISSING", "packages": missing})
        return 3

    import uvicorn

    from backend.api.app import create_app

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
    sock.bind(("127.0.0.1", 0))
    sock.listen(64)
    port = sock.getsockname()[1]

    def ready():
        emit({"type": "ready", "port": port, "protocol": 1})
    server = uvicorn.Server(
        uvicorn.Config(
            create_app(
                token,
                ready,
                data_dir=bootstrap.get(
                    "dataDir",
                    "data")),
            host="127.0.0.1",
            port=port,
            access_log=False,
            log_level="warning",
            workers=1,
            timeout_graceful_shutdown=3,
        ))

    def request_shutdown():
        server.should_exit = True

    start_parent_watch(request_shutdown)
    try:
        server.run(sockets=[sock])
    finally:
        sock.close()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Do not print tracebacks containing credentials or user data over IPC.
        emit({"type": "fatal", "code": "STARTUP_FAILED"})
        sys.exit(1)
