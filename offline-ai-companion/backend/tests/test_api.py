"""Real ASGI integration tests: explicitly skipped when dependencies are unavailable."""
import importlib.util
import unittest
import tempfile

AVAILABLE = all(importlib.util.find_spec(name) for name in ("fastapi", "uvicorn", "httpx"))


@unittest.skipUnless(AVAILABLE, "FastAPI/httpx/uvicorn not installed: integration not verified")
class ApiTests(unittest.TestCase):
    def setUp(self):
        from fastapi.testclient import TestClient
        from backend.api.app import create_app
        self.directory = tempfile.TemporaryDirectory()
        self.client = TestClient(create_app("a" * 64, data_dir=self.directory.name), client=("127.0.0.1", 12345))
        self.headers = {"Authorization": "Bearer " + "a" * 64}

    def tearDown(self):
        self.client.close()
        self.directory.cleanup()

    def test_authenticated_health_and_diagnostics(self):
        response = self.client.get("http://127.0.0.1/health", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["offline"])
        self.assertEqual(response.json()["microphone"], "off")
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertEqual(self.client.get("http://127.0.0.1/diagnostics", headers=self.headers).status_code, 200)

    def test_bad_credentials_origin_and_host_rejected(self):
        self.assertEqual(self.client.get("http://127.0.0.1/health").status_code, 401)
        self.assertEqual(self.client.get("http://127.0.0.1/health", headers={
            **self.headers, "Origin": "http://evil.test"}).status_code, 401)
        self.assertEqual(self.client.get("http://evil.test/health", headers=self.headers).status_code, 400)

    def test_no_openapi_or_unexpected_routes(self):
        for route in ("/docs", "/openapi.json", "/shell", "/unknown"):
            self.assertEqual(self.client.get("http://127.0.0.1" + route, headers=self.headers).status_code, 404)

    def test_explicit_memory_api_and_history_deletion(self):
        base = "http://127.0.0.1"
        result = self.client.post(base + "/memory", headers=self.headers,
                                  json={"operation": "remember", "text": "I prefer Taglish", "approved": True})
        self.assertEqual(result.status_code, 200)
        memory_id = result.json()["id"]
        self.assertEqual(len(self.client.get(base + "/memories", headers=self.headers).json()["memories"]), 1)
        self.assertEqual(self.client.post(base + "/memory", headers=self.headers,
            json={"operation": "remember", "text": "unapproved", "approved": False}).status_code, 422)
        self.assertEqual(self.client.post(base + "/memory", headers=self.headers,
            json={"operation": "forget", "id": memory_id, "approved": True}).status_code, 200)
        self.assertEqual(self.client.get(base + "/memory-export", headers=self.headers).json()["memories"], [])
        self.assertEqual(self.client.post(base + "/history-clear", headers=self.headers).status_code, 200)

    def test_cloud_model_requests_rejected(self):
        response = self.client.post("http://127.0.0.1/chat", headers=self.headers,
                                    json={"text": "Hello", "model": "gpt:cloud", "language": "auto"})
        self.assertEqual(response.status_code, 422)
