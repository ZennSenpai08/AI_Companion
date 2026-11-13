"""User settings persisted locally; engines must validate readiness before activation."""
import json
from datetime import datetime, timezone

DEFAULTS = {"model": "qwen3.5:0.8b", "language": "auto", "volume": 0.8,
            "animation_intensity": 0.5, "cursor_tracking": True}
MODELS = {"qwen3.5:0.8b", "qwen3.5:4b", "qwen3.5:9b"}
LANGUAGES = {"auto", "en", "fil", "taglish"}


def validate_preferences(change):
    if not isinstance(change, dict) or set(change) - set(DEFAULTS):
        raise ValueError("Unknown settings")
    for name, value in change.items():
        if name == "model" and (not isinstance(value, str) or value not in MODELS):
            raise ValueError("Select a supported local model")
        if name == "language" and (not isinstance(value, str) or value not in LANGUAGES):
            raise ValueError("Unknown language preference")
        if name in {"volume", "animation_intensity"} and (
                isinstance(value, bool) or not isinstance(value, (int, float))
                or not 0 <= value <= 1):
            raise ValueError("Setting must be a finite number between zero and one")
        if name == "cursor_tracking" and not isinstance(value, bool):
            raise ValueError("Cursor tracking must be boolean")
    return change


class Preferences:
    def __init__(self, store):
        self.store = store
        with store.lock, store.connect() as db:
            db.execute("CREATE TABLE IF NOT EXISTS settings "
                       "(id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL, updated_at TEXT)")

    def read(self):
        with self.store.lock, self.store.connect() as db:
            row = db.execute("SELECT value FROM settings WHERE id=1").fetchone()
        try:
            value = validate_preferences(json.loads(row["value"])) if row else {}
        except (ValueError, TypeError):
            value = {}
        return {**DEFAULTS, **value}

    def update(self, change):
        validate_preferences(change)
        with self.store.lock:
            value = {**self.read(), **change}
            with self.store.connect() as db:
                db.execute("INSERT INTO settings VALUES(1,?,?) ON CONFLICT(id) DO UPDATE "
                           "SET value=excluded.value,updated_at=excluded.updated_at",
                           (json.dumps(value), datetime.now(timezone.utc).isoformat()))
        return value
