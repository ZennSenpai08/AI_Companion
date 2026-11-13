"""Real FastAPI/httpx ASGI tests. Fixtures replace inference only, not the API stack."""
import importlib.util
import json
import tempfile
import unittest

AVAILABLE = all(importlib.util.find_spec(name) for name in ("fastapi", "uvicorn", "httpx"))


@unittest.skipUnless(AVAILABLE, "FastAPI/httpx/uvicorn not installed: integration not verified")
class ApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        import httpx

        from backend.api.app import create_app
        from backend.tests.test_conversation import FixtureProvider
        self.directory = tempfile.TemporaryDirectory()
        self.provider = FixtureProvider()
        self.app = create_app("a" * 64, data_dir=self.directory.name, provider=self.provider)
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app, client=("127.0.0.1", 12345)),
            base_url="http://127.0.0.1", trust_env=False,
        )
        self.headers = {"Authorization": "Bearer " + "a" * 64}

    async def asyncTearDown(self):
        await self.client.aclose()
        self.directory.cleanup()

    async def test_authenticated_health_and_diagnostics(self):
        response = await self.client.get("/health", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["offline"])
        self.assertEqual(response.json()["microphone"], "off")
        self.assertEqual(response.headers["cache-control"], "no-store")
        diagnostics = await self.client.get("/diagnostics", headers=self.headers)
        self.assertEqual(diagnostics.status_code, 200)
        self.assertEqual(diagnostics.json()["state"], "IDLE")

    async def test_bad_credentials_origin_and_host_rejected(self):
        self.assertEqual((await self.client.get("/health")).status_code, 401)
        response = await self.client.get("/health", headers={
            **self.headers, "Origin": "http://evil.test"})
        self.assertEqual(response.status_code, 401)
        response = await self.client.get("http://evil.test/health", headers=self.headers)
        self.assertEqual(response.status_code, 400)

    async def test_remote_peer_rejected_even_with_valid_secret(self):
        import httpx
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app, client=("192.0.2.1", 1234)),
            base_url="http://127.0.0.1", trust_env=False,
        ) as remote:
            self.assertEqual((await remote.get("/health", headers=self.headers)).status_code, 401)

    async def test_no_openapi_or_unexpected_routes(self):
        for route in ("/docs", "/openapi.json", "/shell", "/unknown"):
            self.assertEqual((await self.client.get(route, headers=self.headers)).status_code, 404)

    async def test_explicit_memory_api_and_history_deletion(self):
        result = await self.client.post("/memory", headers=self.headers, json={
            "operation": "remember", "text": "I prefer Taglish", "approved": True})
        self.assertEqual(result.status_code, 200)
        memory_id = result.json()["id"]
        response = await self.client.get("/memories", headers=self.headers)
        self.assertEqual(len(response.json()["memories"]), 1)
        response = await self.client.post("/memory", headers=self.headers, json={
            "operation": "remember", "text": "unapproved", "approved": False})
        self.assertEqual(response.status_code, 422)
        response = await self.client.post("/memory", headers=self.headers, json={
            "operation": "update", "id": memory_id, "text": "I prefer English", "approved": True})
        self.assertEqual(response.status_code, 200)
        exported = (await self.client.get("/memory-export", headers=self.headers)).json()
        self.assertEqual(exported["memories"][0]["text"], "I prefer English")
        response = await self.client.post("/memory", headers=self.headers, json={
            "operation": "forget", "id": memory_id, "approved": True})
        self.assertEqual(response.status_code, 200)
        self.assertEqual((await self.client.get("/memory-export",
                         headers=self.headers)).json()["memories"], [])
        self.assertEqual((await self.client.post("/history-clear",
                         headers=self.headers)).status_code, 200)

    async def test_cloud_model_and_unknown_request_fields_rejected(self):
        for body in ({"text": "Hello", "model": "gpt:cloud"},
                     {"text": "Hello", "shell": "whoami"}, {"text": " "}):
            response = await self.client.post("/chat", headers=self.headers, json=body)
            self.assertEqual(response.status_code, 422)
        self.assertIsNone(self.provider.prompt)

    async def test_actual_api_stream_persists_reply_and_clears_history(self):
        response = await self.client.post("/chat", headers=self.headers, json={
            "text": "Kamusta?", "language": "taglish"})
        self.assertEqual(response.status_code, 200)
        events = [json.loads(line) for line in response.text.splitlines()]
        self.assertEqual(events[0]["state"], "THINKING")
        self.assertEqual(events[-1]["state"], "IDLE")
        self.assertIn("Kumusta", "".join(event.get("text", "") for event in events))
        self.assertIn("You are Mika", self.provider.prompt[0]["content"])
        messages = (await self.client.get("/messages", headers=self.headers)).json()["messages"]
        self.assertEqual([item["role"] for item in messages], ["user", "assistant"])
        await self.client.post("/history-clear", headers=self.headers)
        self.assertEqual((await self.client.get("/messages", headers=self.headers)).json(),
                         {"messages": []})

    async def test_provider_failure_is_sanitized_and_leaves_error_state(self):
        from backend.llm.provider import ProviderError
        self.provider.error = ProviderError("Local model unavailable")
        response = await self.client.post("/chat", headers=self.headers, json={"text": "Hello"})
        events = [json.loads(line) for line in response.text.splitlines()]
        self.assertEqual(events[-1]["type"], "error")
        self.assertEqual((await self.client.get("/health", headers=self.headers)).json()["state"],
                         "ERROR")
        messages = (await self.client.get("/messages", headers=self.headers)).json()["messages"]
        self.assertEqual([item["role"] for item in messages], ["user"])

    async def test_memory_change_requires_exact_approval_and_operation_fields(self):
        for body in (
            {"operation": "remember", "text": "fact", "approved": 1},
            {"operation": "remember", "text": "fact", "approved": "true"},
            {"operation": "remember", "approved": True},
            {"operation": "update", "text": "fact", "approved": True},
            {"operation": "forget", "approved": True},
        ):
            response = await self.client.post("/memory", headers=self.headers, json=body)
            self.assertEqual(response.status_code, 422)
        response = await self.client.get("/memories", headers=self.headers)
        self.assertEqual(response.json()["memories"], [])

    async def test_preferences_persist_without_enabling_unavailable_engines(self):
        response = await self.client.post("/preferences", headers=self.headers,
                                          json={"language": "fil", "volume": 0.4})
        self.assertEqual(response.status_code, 200)
        self.assertEqual((await self.client.get("/preferences",
                         headers=self.headers)).json()["language"], "fil")
        response = await self.client.post("/preferences", headers=self.headers,
                                          json={"microphone_enabled": True})
        self.assertEqual(response.status_code, 422)
        self.assertEqual((await self.client.get("/health",
                         headers=self.headers)).json()["microphone"], "off")
