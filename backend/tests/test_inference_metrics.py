"""Metric/protocol fixtures, never real-model performance evidence."""
import importlib.util
import unittest
from unittest.mock import patch

from backend.llm.metrics import completion_metrics
from backend.llm.ollama import OllamaProvider
from backend.llm.provider import ProviderError
from backend.tests.ollama_fixture import OllamaFixture


class MetricTests(unittest.TestCase):
    def test_only_valid_measurements_are_retained_and_ns_are_converted(self):
        values = completion_metrics({"load_duration": 2_000_000,
                                     "eval_duration": 500_000_000, "eval_count": 10,
                                     "prompt_eval_count": 15, "secret": "never-export"}, 1.5, .1)
        self.assertEqual(values["load_ms"], 2)
        self.assertEqual(values["wall_ms"], 1500)
        self.assertEqual(values["first_token_ms"], 100)
        self.assertEqual(values["tokens_per_second"], 20)
        self.assertNotIn("secret", values)

    def test_missing_invalid_and_zero_durations_do_not_fabricate_token_rates(self):
        for duration in (None, 0, -1, True, "500", float("nan"), 10**20):
            values = completion_metrics({"eval_duration": duration, "eval_count": 10}, 1, None)
            self.assertNotIn("tokens_per_second", values)
            self.assertNotIn("first_token_ms", values)


@unittest.skipUnless(importlib.util.find_spec("httpx"), "Supported HTTP runtime unavailable")
class MetricProtocolTests(unittest.IsolatedAsyncioTestCase):
    async def test_completed_metrics_are_cleared_before_a_failed_turn(self):
        provider = OllamaProvider()
        with OllamaFixture("happy") as fixture:
            with patch("backend.llm.ollama.ENDPOINT", fixture.endpoint):
                parts = [part async for part in provider.stream([], "qwen3.5:0.8b")]
        self.assertTrue(parts)
        self.assertGreaterEqual(provider.completion_metrics["wall_ms"], 0)
        self.assertIn("first_token_ms", provider.completion_metrics)
        # Fixture does not supply token counts: do not invent them.
        self.assertNotIn("eval_count", provider.completion_metrics)
        with OllamaFixture("missing") as fixture:
            with patch("backend.llm.ollama.ENDPOINT", fixture.endpoint):
                with self.assertRaises(ProviderError):
                    _ = [part async for part in provider.stream([], "qwen3.5:0.8b")]
        self.assertIsNone(provider.completion_metrics)

    async def test_http_read_timeout_is_not_misreported_as_service_unavailable(self):
        import httpx

        with patch("httpx.AsyncClient", side_effect=httpx.ReadTimeout("private-request-data")):
            with self.assertRaisesRegex(ProviderError, "timed out") as caught:
                _ = [part async for part in OllamaProvider().stream([], "qwen3.5:0.8b")]
        self.assertNotIn("private-request-data", str(caught.exception))

    async def test_connection_timeout_is_classified_as_unavailable(self):
        import httpx
        with patch("httpx.AsyncClient", side_effect=httpx.ConnectTimeout("private-data")):
            with self.assertRaises(ProviderError) as caught:
                _ = [part async for part in OllamaProvider().stream([], "qwen3.5:0.8b")]
        self.assertEqual(caught.exception.code, "OLLAMA_UNAVAILABLE")
        self.assertNotIn("private-data", str(caught.exception))
