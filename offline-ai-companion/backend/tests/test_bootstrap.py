import json
import subprocess
import sys
import unittest


class BootstrapTests(unittest.TestCase):
    def run_child(self, payload):
        return subprocess.run(
            [sys.executable, "-m", "backend.bootstrap"],
            input=json.dumps(payload) + "\n", text=True, capture_output=True,
            timeout=15, check=False,
        )

    def test_invalid_bootstrap_exits_cleanly_without_exposing_secret(self):
        response = self.run_child({"token": "do-not-print-this-secret"})
        self.assertEqual(response.returncode, 2)
        self.assertIn("INVALID_BOOTSTRAP", response.stdout)
        self.assertNotIn("do-not-print", response.stdout + response.stderr)

    def test_malformed_input_exits_without_traceback(self):
        response = self.run_child({"bad": "value"})
        self.assertEqual(response.returncode, 2)
        self.assertNotIn("Traceback", response.stderr)
