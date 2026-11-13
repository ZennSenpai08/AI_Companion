"""Real httpx and socket tests against a fixture; no real LLM output is claimed."""
import importlib.util
import os
import unittest
from unittest.mock import patch

from backend.llm.ollama import ENDPOINT, OllamaProvider
from backend.llm.provider import ProviderError
from backend.tests.ollama_fixture import OllamaFixture


@unittest.skipUnless(importlib.util.find_spec("httpx"), "httpx not installed")
class OllamaHttpTests(unittest.IsolatedAsyncioTestCase):
    async def collect(self, fixture):
        with patch("backend.llm.ollama.ENDPOINT", fixture.endpoint):
            return [part async for part in OllamaProvider().stream(
                [{"role": "system", "content": "Original Mika fixture profile"},
                 {"role": "user", "content": "Kamusta?"}], "qwen3.5:0.8b")]

    async def test_real_chunked_unicode_stream_and_local_request_contract(self):
        self.assertEqual(ENDPOINT, "http://127.0.0.1:11434/api/chat")
        with OllamaFixture("happy") as fixture:
            pieces = await self.collect(fixture)
            self.assertEqual("".join(pieces), "Kumusta, José? Ayos!")
            request = fixture.server.requests[0]
            self.assertEqual(request["path"], "/api/chat")
            self.assertEqual(request["body"]["model"], "qwen3.5:0.8b")
            self.assertIs(request["body"]["stream"], True)
            self.assertIs(request["body"]["think"], False)
            self.assertNotIn("tools", request["body"])

    async def test_environment_proxies_are_not_used(self):
        with OllamaFixture("happy") as fixture, patch.dict(os.environ, {
            "HTTP_PROXY": "http://127.0.0.1:9", "ALL_PROXY": "http://127.0.0.1:9", "NO_PROXY": "",
        }):
            self.assertTrue(await self.collect(fixture))

    async def test_redirect_is_not_followed_and_no_pull_is_attempted(self):
        with OllamaFixture("redirect") as fixture:
            with self.assertRaises(ProviderError):
                await self.collect(fixture)
            self.assertEqual(len(fixture.server.requests), 1)
            self.assertEqual(fixture.server.requests[0]["path"], "/api/chat")

    async def test_missing_model_and_inference_failure_are_safe(self):
        for mode in ("missing", "failure", "model-error"):
            with self.subTest(mode=mode), OllamaFixture(mode) as fixture:
                with self.assertRaises(ProviderError) as caught:
                    await self.collect(fixture)
                self.assertNotIn("private-sentinel", str(caught.exception))

    async def test_malformed_packets_raise_provider_error(self):
        for mode in ("invalid-json", "list", "null-message", "invalid-done", "oversized-line"):
            with self.subTest(mode=mode), OllamaFixture(mode) as fixture:
                with self.assertRaises(ProviderError):
                    await self.collect(fixture)

    async def test_incomplete_reply_cannot_report_success(self):
        with OllamaFixture("eof") as fixture:
            with self.assertRaisesRegex(ProviderError, "before completing"):
                await self.collect(fixture)

    async def test_closing_generator_closes_real_http_connection(self):
        with OllamaFixture("cancel") as fixture:
            with patch("backend.llm.ollama.ENDPOINT", fixture.endpoint):
                stream = OllamaProvider().stream([], "qwen3.5:0.8b")
                self.assertEqual(await stream.__anext__(), "first")
                await stream.aclose()
                self.assertTrue(fixture.server.disconnected.wait(timeout=3))

    async def test_overall_deadline_stops_an_endless_empty_stream(self):
        with OllamaFixture("stall") as fixture:
            with patch("backend.llm.ollama.ENDPOINT", fixture.endpoint):
                with self.assertRaisesRegex(ProviderError, "timed out"):
                    provider = OllamaProvider(timeout_s=0.12)
                    _ = [part async for part in provider.stream([], "qwen3.5:0.8b")]

    def test_nonfinite_timeout_is_rejected(self):
        for value in (0, -1, float("nan"), float("inf"), "90"):
            with self.assertRaises(ValueError):
                OllamaProvider(timeout_s=value)
