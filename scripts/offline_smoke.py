"""Offline foundation check with TCP/DNS/UDP guards in this Python process only.

Child processes and native libraries can bypass these Python hooks. Full spoken offline
acceptance still requires an OS/firewall-isolated run with actual prepared local models.
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

if __package__:
    from .offline_guard import OfflineGuard
else:
    from offline_guard import OfflineGuard


with OfflineGuard() as audit:
    suite = unittest.defaultTestLoader.discover("backend/tests")
    result = unittest.TextTestRunner(verbosity=2).run(suite)

print("Unexpected external attempts blocked in guarded test process:", len(audit.blocked))
print("Scope: Python tests only; real LLM/STT/TTS/Live2D and system-wide isolation unverified.")
sys.exit(0 if result.wasSuccessful() and not audit.blocked else 1)
