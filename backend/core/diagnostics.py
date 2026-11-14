"""Opt-in development stage facts. Never emit prompts, replies, credentials or paths."""
import json
import os
import sys
from datetime import datetime, timezone

STAGES = {"chat_received", "context_ready", "ollama_request", "ollama_headers",
          "ollama_first_delta", "ollama_done", "ollama_timeout", "ollama_error"}


def stage(name):
    if os.environ.get("MIKA_DIAGNOSTICS") == "1" and name in STAGES:
        print("MIKA_STAGE " + json.dumps({"stage": name,
              "at": datetime.now(timezone.utc).isoformat()}), file=sys.stderr, flush=True)
