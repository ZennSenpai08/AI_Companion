import tempfile
import unittest
from pathlib import Path

from backend.core.preferences import DEFAULTS, Preferences, validate_preferences
from backend.memory.sqlite_store import MemoryStore


class PreferenceTests(unittest.TestCase):
    def test_defaults_updates_restart_and_history_delete_keep_preferences(self):
        with tempfile.TemporaryDirectory() as directory:
            filename = Path(directory) / "assistant.sqlite"
            store = MemoryStore(filename)
            preferences = Preferences(store)
            self.assertEqual(preferences.read(), DEFAULTS)
            preferences.update({"language": "taglish", "model": "qwen3.5:4b", "volume": 0.5})
            store.clear_history()
            restarted = Preferences(MemoryStore(filename))
            self.assertEqual(restarted.read()["language"], "taglish")
            self.assertEqual(restarted.read()["model"], "qwen3.5:4b")
            self.assertEqual(restarted.read()["volume"], 0.5)

    def test_unknown_network_audio_and_invalid_values_are_refused(self):
        for value in ({"cloud_url": "https://example.invalid"}, {"microphone_enabled": True},
                      {"model": "gpt:cloud"}, {"model": []}, {"language": "unknown"},
                      {"volume": float("nan")}, {"volume": 2}, {"volume": True},
                      {"cursor_tracking": 1}, {"animation_intensity": float("inf")}):
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_preferences(value)

    def test_invalid_persisted_values_recover_to_safe_defaults(self):
        with tempfile.TemporaryDirectory() as directory:
            store = MemoryStore(Path(directory) / "settings.sqlite")
            preferences = Preferences(store)
            with store.connect() as db:
                db.execute("INSERT INTO settings VALUES(1,?,?)",
                           ('{"microphone_enabled":true}', "fixture"))
            self.assertEqual(preferences.read(), DEFAULTS)
