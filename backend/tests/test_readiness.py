import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch
from unittest.mock import AsyncMock

from backend.llm.readiness import installed_models, require_installed
from backend.llm.provider import ProviderError


class CatalogHandler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def do_GET(self):
        self.server.paths.append(self.path)
        self.send_response(self.server.status)
        if self.server.status == 302:
            self.send_header("Location", "/unexpected")
        data = json.dumps(self.server.catalog).encode()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


class ReadinessTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_remote_and_unverified_weights_cannot_switch(self):
        for models in ([], [{"name": "gemma3:1b", "compatible": False}]):
            with patch("backend.llm.readiness.installed_models", AsyncMock(return_value={"available": True, "models": models})):
                with self.assertRaises(ProviderError) as caught:
                    await require_installed("gemma3:1b")
                self.assertEqual(caught.exception.code, "MODEL_NOT_INSTALLED")
        catalog = {"available": True, "models": [{"name": "gemma3:1b", "compatible": True}]}
        for details in ({"details": {"format": "gguf"}, "remote_host": "external"}, {"details": {}}, {"details": None}):
            with patch("backend.llm.readiness.installed_models", AsyncMock(return_value=catalog)), patch(
                    "backend.llm.readiness.metadata", AsyncMock(return_value=details)):
                with self.assertRaises(ProviderError) as caught:
                    await require_installed("gemma3:1b")
                self.assertEqual(caught.exception.code, "MODEL_UNVERIFIED")

    async def test_installed_local_gguf_passes_without_inference_or_pull(self):
        with patch("backend.llm.readiness.installed_models", AsyncMock(return_value={"available": True,
                "models": [{"name": "gemma3:1b", "compatible": True}]})), patch(
                "backend.llm.readiness.metadata", AsyncMock(return_value={"details": {"format": "gguf"}})) as call:
            await require_installed("gemma3:1b")
            call.assert_awaited_once_with("show", {"model": "gemma3:1b"})
    async def catalog(self, data, status=200):
        server = ThreadingHTTPServer(("127.0.0.1", 0), CatalogHandler)
        server.catalog, server.status, server.paths = data, status, []
        thread = threading.Thread(target=server.serve_forever,
                                  kwargs={"poll_interval": 0.01}, daemon=True)
        thread.start()
        try:
            with patch("backend.llm.readiness.ENDPOINT",
                       f"http://127.0.0.1:{server.server_port}/api/tags"):
                result = await installed_models()
            return result, server.paths
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    async def test_reads_local_catalog_without_pull_and_filters_cloud_names(self):
        result, paths = await self.catalog({"models": [
            {"name": "qwen3.5:4b", "size": 3000000000}, {"name": "model:cloud", "size": 0}]})
        self.assertTrue(result["available"])
        self.assertEqual(result["models"], [{"name": "qwen3.5:4b", "size_bytes": 3000000000,
                                              "compatible": True, "min_free_gib": 6}])
        self.assertEqual(paths, ["/api/tags"])

    async def test_redirects_and_malformed_metadata_fail_closed(self):
        for data, status in (({}, 302), ([], 200), ({"models": [None]}, 200),
                             ({"models": [{"name": "test", "size": -1}]}, 200)):
            result, paths = await self.catalog(data, status)
            self.assertFalse(result["available"])
            self.assertEqual(result["models"], [])
            self.assertEqual(paths, ["/api/tags"])

    async def test_no_installed_weights_is_distinct_from_missing_service(self):
        result, _ = await self.catalog({"models": []})
        self.assertTrue(result["available"])
        self.assertEqual(result["models"], [])
