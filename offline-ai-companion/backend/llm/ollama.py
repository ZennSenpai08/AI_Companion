"""Local-only Ollama text adapter; cloud tags and implicit model pulls are forbidden."""
import json

from backend.llm.provider import ProviderError

MODELS = {"qwen3.5:0.8b", "qwen3.5:4b", "qwen3.5:9b"}
ENDPOINT = "http://127.0.0.1:11434/api/chat"


class OllamaProvider:
    async def stream(self, messages, model="qwen3.5:0.8b"):
        if model not in MODELS:
            raise ProviderError("Select a supported local model; cloud inference is disabled.")
        try:
            import httpx
        except ImportError as error:
            raise ProviderError("HTTP dependencies are missing. Run setup first.") from error
        try:
            # No environment proxies, redirects, remote URLs, tools or auto-pull endpoint.
            async with httpx.AsyncClient(trust_env=False, follow_redirects=False,
                                         timeout=httpx.Timeout(90, connect=2)) as client:
                async with client.stream("POST", ENDPOINT, json={
                    "model": model, "messages": messages, "stream": True, "think": False,
                    "keep_alive": "30s", "options": {"num_ctx": 4096, "num_predict": 512},
                }) as response:
                    if response.status_code == 404:
                        raise ProviderError("Local model not found. Install it separately in Ollama.")
                    if response.status_code != 200:
                        raise ProviderError("Ollama could not run the model. Check local RAM and model setup.")
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        if len(line) > 65536:
                            raise ProviderError("Local model response exceeded the protocol limit.")
                        try:
                            packet = json.loads(line)
                        except ValueError as error:
                            raise ProviderError("Ollama returned an invalid stream.") from error
                        if packet.get("error"):
                            raise ProviderError("Local inference failed. Check model setup and available memory.")
                        content = packet.get("message", {}).get("content", "")
                        if not isinstance(content, str):
                            raise ProviderError("Local inference returned invalid text.")
                        if content:
                            yield content
                        if packet.get("done"):
                            return
                    raise ProviderError("Local inference ended before completing its reply.")
        except httpx.HTTPError as error:
            raise ProviderError("Ollama is unavailable at 127.0.0.1:11434. No online fallback is used.") from error
