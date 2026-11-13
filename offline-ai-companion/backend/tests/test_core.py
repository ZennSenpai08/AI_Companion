import unittest
from pathlib import Path

from backend.core.config import RuntimeConfig
from backend.core.security import authorized, trusted_peer, valid_token


class SecurityTests(unittest.TestCase):
    def test_authorization_requires_exact_valid_secret(self):
        secret = "a" * 64
        self.assertTrue(authorized("Bearer " + secret, secret))
        for value in ("", "bearer " + secret, "Bearer " + secret + " ", "Bearer " + "b" * 64):
            self.assertFalse(authorized(value, secret))
        self.assertFalse(authorized("Bearer short", "short"))
        self.assertFalse(authorized("Bearer é", secret))

    def test_invalid_token_and_remote_clients_fail_closed(self):
        for token in ("short", "g" * 64, "a" * 63, "a" * 65, "a" * 64 + "\n"):
            self.assertFalse(valid_token(token))
        for host in ("localhost", "0.0.0.0", "192.168.1.2", "127.0.0.1.evil"):
            self.assertFalse(trusted_peer(host))
        self.assertTrue(trusted_peer("127.0.0.1"))

    def test_runtime_cannot_silently_enable_network_or_audio(self):
        config = RuntimeConfig(Path("data"))
        self.assertTrue(config.offline)
        self.assertFalse(config.microphone_enabled)
        for option in ({"offline": False}, {"microphone_enabled": True}, {"retain_audio": True}):
            with self.assertRaises(ValueError):
                RuntimeConfig(Path("data"), **option)
