"""Actual Uvicorn/API/Ollama-adapter integration; only model inference is a fixture."""
import importlib.util
import json
import queue
import secrets
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

from backend.tests.ollama_fixture import OllamaFixture

AVAILABLE = all(importlib.util.find_spec(name) for name in ("fastapi", "uvicorn", "httpx"))
ROOT = Path(__file__).resolve().parents[2]


class BackendProcess:
    def __init__(self, directory, endpoint):
        self.directory = directory
        self.endpoint = endpoint
        self.token = secrets.token_hex(32)
        self.child = None

    def __enter__(self):
        import httpx

        # Test-only wrapper patches the provider endpoint. Production bootstrap has no
        # endpoint override and still binds only to loopback with stdin credentials.
        code = ("import sys; from backend.llm import ollama; "
                "ollama.ENDPOINT=sys.argv[1]; from backend.bootstrap import main; "
                "raise SystemExit(main())")
        self.child = subprocess.Popen(
            [sys.executable, "-u", "-c", code, self.endpoint], cwd=ROOT,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, encoding="utf-8",
        )
        self.child.stdin.write(json.dumps({"token": self.token, "dataDir": self.directory}) + "\n")
        self.child.stdin.flush()
        messages = queue.Queue()
        threading.Thread(target=lambda: messages.put(self.child.stdout.readline()),
                         daemon=True).start()
        try:
            ready = json.loads(messages.get(timeout=12))
            if ready.get("type") != "ready":
                raise RuntimeError("Production bootstrap did not become ready")
            self.client = httpx.Client(base_url=f"http://127.0.0.1:{ready['port']}",
                                       headers={"Authorization": "Bearer " + self.token},
                                       trust_env=False, timeout=5)
            self.client.get("/health").raise_for_status()
            return self
        except Exception:
            self.__exit__()
            raise

    def __exit__(self, *_args):
        if hasattr(self, "client"):
            self.client.close()
        if self.child:
            if self.child.stdin and not self.child.stdin.closed:
                self.child.stdin.close()
            try:
                self.child.wait(timeout=8)
            except subprocess.TimeoutExpired:
                self.child.kill()
                self.child.wait(timeout=3)
            if self.child.stdout:
                self.child.stdout.close()


@unittest.skipUnless(AVAILABLE, "Supported API runtime is unavailable")
class RuntimeSocketTests(unittest.TestCase):
    def test_full_text_path_cancellation_restart_memory_and_error_recovery(self):
        with tempfile.TemporaryDirectory() as directory, OllamaFixture("happy") as model:
            with BackendProcess(directory, model.endpoint) as service:
                client = service.client
                fact = client.post("/memory", json={"operation": "remember",
                                   "text": "My favorite language is Taglish", "approved": True})
                self.assertEqual(fact.status_code, 200)
                response = client.post("/chat", json={"text": "favorite language?"})
                events = [json.loads(line) for line in response.text.splitlines()]
                self.assertEqual(events[-1]["state"], "IDLE")
                prompt = model.server.requests[0]["body"]["messages"]
                self.assertIn("You are Mika", prompt[0]["content"])
                self.assertTrue(any("My favorite language is Taglish" in item["content"]
                                    for item in prompt))

                model.server.mode = "cancel"
                with client.stream("POST", "/chat", json={"text": "Cancel this turn"}) as stream:
                    # Keep the iterator alive while checking concurrent health. Discarding
                    # it on break can itself close the HTTPX stream during garbage collection.
                    lines = stream.iter_lines()
                    for line in lines:
                        if line and json.loads(line)["type"] == "delta":
                            break
                    actual = client.get("/health").json()["state"]
                    self.assertEqual(actual, "THINKING")
                    self.assertEqual(client.post("/history-clear").status_code, 409)
                self.assertTrue(model.server.disconnected.wait(timeout=3))
                for _ in range(40):
                    state = client.get("/health").json()["state"]
                    if state == "INTERRUPTED":
                        break
                    time.sleep(0.025)
                self.assertEqual(state, "INTERRUPTED")
                messages = client.get("/messages").json()["messages"]
                self.assertEqual([item["role"] for item in messages], ["user", "assistant", "user"])

                model.server.mode = "model-error"
                response = client.post("/chat", json={"text": "Trigger model fixture error"})
                self.assertNotIn("private-sentinel", response.text)
                self.assertEqual(client.get("/health").json()["state"], "ERROR")
                model.server.mode = "happy"
                response = client.post("/chat", json={"text": "Recover now"})
                self.assertEqual(json.loads(response.text.splitlines()[-1])["state"], "IDLE")

            with BackendProcess(directory, model.endpoint) as restarted:
                facts = restarted.client.get("/memories").json()["memories"]
                self.assertEqual(facts[0]["id"], fact.json()["id"])
                self.assertGreater(len(restarted.client.get("/messages").json()["messages"]), 0)
                response = restarted.client.post("/memory", json={"operation": "forget",
                                                 "id": facts[0]["id"], "approved": True})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(restarted.client.get("/memories").json()["memories"], [])
                self.assertEqual(restarted.client.post("/history-clear").status_code, 200)
                self.assertEqual(restarted.client.get("/messages").json()["messages"], [])
