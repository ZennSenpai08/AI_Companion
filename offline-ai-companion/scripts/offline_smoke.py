"""Foundation offline core check, NOT the full spoken offline acceptance test.

Blocks external sockets in this Python process. Does not alter system firewall settings.
Run OS/firewall-isolated end-to-end tests separately after provisioning real local models.
"""
import socket
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

original_connect = socket.socket.connect


def local_connect(self, address):
    if not isinstance(address, tuple) or address[0] not in ("127.0.0.1", "::1"):
        raise OSError("Offline test blocked non-loopback connection")
    return original_connect(self, address)


socket.socket.connect = local_connect
suite = unittest.defaultTestLoader.discover("backend/tests")
result = unittest.TextTestRunner(verbosity=2).run(suite)
print("Scope: Python foundation only; no real STT/TTS/LLM/Live2D/offline speech verified.")
sys.exit(0 if result.wasSuccessful() else 1)
