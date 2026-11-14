"""Read installed Ollama metadata only; no pulls, remote hosts or inference."""
import json
import asyncio
from backend.llm.models import POLICY, MODELS, validate_model
from backend.llm.provider import ProviderError

ENDPOINT = "http://127.0.0.1:11434/api/tags"
MAX_CATALOG_BYTES = 1024 * 1024


async def installed_models():
    try:
        return await asyncio.wait_for(_installed_models(), 2)
    except asyncio.TimeoutError:
        return {"available": False, "models": [], "message": "Local Ollama catalog timed out. Retry."}


async def _installed_models():
    import httpx
    try:
        async with httpx.AsyncClient(trust_env=False, follow_redirects=False,
                                     timeout=httpx.Timeout(2.5, connect=1)) as client:
            async with client.stream("GET", ENDPOINT) as response:
                if response.status_code != 200:
                    return {"available": False, "models": [],
                            "message": "Local Ollama rejected catalog request."}
                raw = bytearray()
                async for chunk in response.aiter_bytes():
                    raw.extend(chunk)
                    if len(raw) > MAX_CATALOG_BYTES:
                        raise ValueError("Catalog too large")
                catalog = json.loads(raw)
                if not isinstance(catalog, dict) or not isinstance(catalog.get("models"), list):
                    raise ValueError("Invalid model catalog")
                models = []
                for entry in catalog["models"]:
                    if not isinstance(entry, dict):
                        raise ValueError("Invalid model entry")
                    name, size = entry.get("name"), entry.get("size")
                    if not isinstance(name, str) or not name or len(name) > 200:
                        raise ValueError("Invalid model name")
                    if not isinstance(size, int) or isinstance(size, bool) or size < 0:
                        raise ValueError("Invalid model size")
                    if "cloud" not in name.casefold():
                        models.append({"name": name, "size_bytes": size,
                                       "compatible": name in MODELS and not entry.get("remote_host")
                                       and not entry.get("remote_model"),
                                       "min_free_gib": POLICY["models"].get(name, {}).get("min_free_gib")})
                return {"available": True, "models": models,
                        "message": "Installed local model names; inference has not been tested."}
    except (httpx.HTTPError, ValueError):
        return {"available": False, "models": [],
                "message": "Ollama unavailable at 127.0.0.1:11434. No online fallback or download."}


async def require_installed(model):
    """Validate before changing selection/inference; never pull or follow a redirect."""
    validate_model(model)
    catalog = await installed_models()
    if not catalog["available"]:
        raise ProviderError(catalog["message"], "OLLAMA_UNAVAILABLE")
    if not any(m["name"] == model and m["compatible"] for m in catalog["models"]):
        raise ProviderError("Selected local model is not installed or compatible. Refresh local engines.",
                            "MODEL_NOT_INSTALLED")
    try:
        details = await metadata("show", {"model": model})
        if (details.get("remote_host") or details.get("remote_model") or
                not isinstance(details.get("details"), dict) or
                details["details"].get("format") != "gguf"):
            raise ValueError("Unverified local weights")
    except (OSError, ValueError, asyncio.TimeoutError) as error:
        raise ProviderError("Selected model could not be verified as local GGUF weights. Refresh local engines.",
                            "MODEL_UNVERIFIED") from error


async def metadata(endpoint, body=None):
    """Bounded fixed-loopback metadata with an absolute two-second deadline."""
    import httpx
    if endpoint not in {"show", "ps", "generate"}:
        raise ValueError("Unsupported metadata operation")

    async def read():
        async with httpx.AsyncClient(trust_env=False, follow_redirects=False,
                                     timeout=httpx.Timeout(1.5, connect=1)) as client:
            async with client.stream("POST" if body is not None else "GET",
                                     ENDPOINT.rsplit("/", 1)[0] + "/" + endpoint, json=body) as response:
                response.raise_for_status()
                raw = bytearray()
                async for chunk in response.aiter_bytes():
                    raw.extend(chunk)
                    if len(raw) > MAX_CATALOG_BYTES:
                        raise ValueError("Model metadata too large")
                value = json.loads(raw)
                if not isinstance(value, dict):
                    raise ValueError("Invalid metadata")
                return value
    try:
        return await asyncio.wait_for(read(), 2)
    except httpx.HTTPError as error:
        raise ValueError("Local Ollama metadata unavailable") from error


async def loaded_models():
    try:
        value = await metadata("ps")
        if not isinstance(value.get("models"), list):
            raise ValueError("Invalid loaded model list")
        models = []
        for item in value["models"]:
            if not isinstance(item, dict) or not isinstance(item.get("name"), str):
                raise ValueError("Invalid loaded model")
            numbers = {k: item.get(k) for k in ("size", "size_vram", "context_length")}
            if any(v is not None and (type(v) is not int or v < 0) for v in numbers.values()):
                raise ValueError("Invalid residency counters")
            models.append({"name": item["name"], **numbers})
        return {"available": True, "models": models}
    except (ValueError, asyncio.TimeoutError):
        return {"available": False, "models": []}


async def unload_model(model):
    await require_installed(model)
    await metadata("generate", {"model": model, "keep_alive": 0, "stream": False})
