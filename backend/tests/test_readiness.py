import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

from backend.llm.readiness import installed_models


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
        self.assertEqual(result["models"], [{"name": "qwen3.5:4b", "size_bytes": 3000000000}])
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
