"""Local-only Ollama text adapter; cloud tags and implicit model pulls are forbidden."""
import asyncio
import math

from backend.llm.ndjson import read_packets
from backend.llm.metrics import completion_metrics
from backend.llm.provider import ProviderError
from backend.core.diagnostics import stage
from backend.llm.models import DEFAULT_MODEL, MODELS

ENDPOINT = "http://127.0.0.1:11434/api/chat"
BASE_OPTIONS = {"num_ctx": 4096, "num_predict": 512}


def generation_options(overrides=None):
    """Narrow sampling overrides for controlled diagnostics, never host/tool controls."""
    if overrides is not None and not isinstance(overrides, dict):
        raise ValueError("Sampling options must be an object")
    options = dict(BASE_OPTIONS)
    for name, value in (overrides or {}).items():
        if name == "seed":
            valid = isinstance(value, int) and not isinstance(value, bool) and 0 <= value < 2**32
        else:
            bounds = {"temperature": (0, 2), "top_p": (0, 1), "presence_penalty": (-2, 2)}
            valid = (name in bounds and isinstance(value, (int, float)) and
                     not isinstance(value, bool) and math.isfinite(value) and
                     bounds[name][0] <= value <= bounds[name][1])
        if not valid:
            raise ValueError("Unsupported generation option")
        options[name] = value
    return options


class OllamaProvider:
    def __init__(self, timeout_s=90, sampling=None):
        if not isinstance(timeout_s, (int, float)) or not math.isfinite(
                timeout_s) or timeout_s <= 0:
            raise ValueError("Inference timeout must be a positive finite number")
        self.timeout_s = timeout_s
        self.completion_metrics = None
        self.options = generation_options(sampling)

    async def stream(self, messages, model=DEFAULT_MODEL):
        # Clear at admission so a failed/cancelled turn never reuses old timings.
        self.completion_metrics = None
        started = asyncio.get_running_loop().time()
        first_token_s = None
        headers_received = False
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
                    "keep_alive": "30s", "options": self.options,
                })
                stage("ollama_request")
                response = await asyncio.wait_for(client.send(request, stream=True), self.timeout_s)
                headers_received = True
                stage("ollama_headers")
                try:
                    if response.status_code == 404:
                        raise ProviderError(
                            "Local model not found. Install it separately in Ollama.", "MODEL_NOT_INSTALLED")
                    if response.status_code != 200:
                        raise ProviderError(
                            "Ollama could not run the model. Check local RAM and model setup.", "MODEL_LOAD_FAILED")
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
                            if first_token_s is None:
                                first_token_s = asyncio.get_running_loop().time() - started
                                stage("ollama_first_delta")
                            yield content
                        if packet["done"]:
                            self.completion_metrics = completion_metrics(
                                packet, asyncio.get_running_loop().time() - started,
                                first_token_s)
                            stage("ollama_done")
                            return
                    raise ProviderError("Local inference ended before completing its reply.")
                finally:
                    await response.aclose()
        except asyncio.TimeoutError as error:
            stage("ollama_timeout")
            raise ProviderError(
                "Local inference timed out. Check the last Ollama stage before retrying.",
                "INFERENCE_TIMEOUT" if headers_received else "MODEL_RESPONSE_TIMEOUT") from error
        except httpx.ConnectTimeout as error:
            stage("ollama_error")
            raise ProviderError(
                "Ollama is unavailable at 127.0.0.1:11434. No online fallback is used.", "OLLAMA_UNAVAILABLE") from error
        except httpx.TimeoutException as error:
            stage("ollama_timeout")
            raise ProviderError(
                "Local inference timed out. Check the last Ollama stage before retrying.",
                "INFERENCE_TIMEOUT" if headers_received else "MODEL_RESPONSE_TIMEOUT") from error
        except httpx.HTTPError as error:
            stage("ollama_error")
            raise ProviderError(
                "Ollama is unavailable at 127.0.0.1:11434. No online fallback is used.", "OLLAMA_UNAVAILABLE") from error
