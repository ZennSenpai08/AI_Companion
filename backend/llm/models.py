"""One versioned local compatibility/admission policy shared with Electron."""
import json
from pathlib import Path

POLICY = json.loads(Path(__file__).with_name("model_policy.json").read_text(encoding="utf-8"))
MODELS = frozenset(POLICY["models"])
DEFAULT_MODEL = POLICY["default_model"]


def validate_model(value):
    if not isinstance(value, str) or value not in MODELS:
        raise ValueError("Select a supported installed local model")
    return value
