"""Local-only Ollama text adapter; cloud tags and implicit model pulls are forbidden."""
import asyncio
import math

from backend.llm.ndjson import read_packets
from backend.llm.provider import ProviderError

MODELS = {"qwen3.5:0.8b", "qwen3.5:4b", "qwen3.5:9b"}
ENDPOINT = "http://127.0.0.1:11434/api/chat"


class OllamaProvider:
    def __init__(self, timeout_s=90):
        if not isinstance(timeout_s, (int, float)) or not math.isfinite(
                timeout_s) or timeout_s <= 0:
            raise ValueError("Inference timeout must be a positive finite number")
        self.timeout_s = timeout_s

    async def stream(self, messages, model="qwen3.5:0.8b"):
        if model not in MODELS:
            raise ProviderError("Select a supported local model; cloud inference is disabled.")
        try:
            import httpx
        except ImportError as error:
            raise ProviderError("HTTP dependencies are missing. Run setup first.") from error
        try:
            # No environment proxies, redirects, remote URLs, tools or auto-pull endpoint.
            async with httpx.AsyncClient(
                trust_env=False, follow_redirects=False,
                timeout=httpx.Timeout(self.timeout_s, connect=2),
            ) as client:
                deadline = asyncio.get_running_loop().time() + self.timeout_s
                request = client.build_request("POST", ENDPOINT, json={
                    "model": model, "messages": messages, "stream": True, "think": False,
                    "keep_alive": "30s", "options": {"num_ctx": 4096, "num_predict": 512},
                })
                response = await asyncio.wait_for(client.send(request, stream=True), self.timeout_s)
                try:
                    if response.status_code == 404:
                        raise ProviderError(
                            "Local model not found. Install it separately in Ollama.")
                    if response.status_code != 200:
                        raise ProviderError(
                            "Ollama could not run the model. Check local RAM and model setup.")
                    async for packet in read_packets(response.aiter_bytes(), deadline):
                        if packet.get("error"):
                            raise ProviderError(
                                "Local inference failed. Check model setup and available memory.")
                        if not isinstance(packet.get("done"), bool):
                            raise ProviderError(
                                "Local inference returned an invalid completion state.")
                        message = packet.get("message")
                        if not isinstance(message, dict):
                            raise ProviderError("Local inference returned an invalid message.")
                        content = message.get("content", "")
                        if not isinstance(content, str):
                            raise ProviderError("Local inference returned invalid text.")
                        if content:
                            yield content
                        if packet["done"]:
                            return
                    raise ProviderError("Local inference ended before completing its reply.")
                finally:
                    await response.aclose()
        except asyncio.TimeoutError as error:
            raise ProviderError(
                "Local inference timed out. Stop and retry with a smaller local model.") from error
        except httpx.HTTPError as error:
            raise ProviderError(
                "Ollama is unavailable at 127.0.0.1:11434. No online fallback is used.") from error
