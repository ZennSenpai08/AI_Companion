"""Read installed Ollama metadata only; no pulls, remote hosts or inference."""
import json

ENDPOINT = "http://127.0.0.1:11434/api/tags"
MAX_CATALOG_BYTES = 1024 * 1024


async def installed_models():
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
                        models.append({"name": name, "size_bytes": size})
                return {"available": True, "models": models,
                        "message": "Installed local model names; inference has not been tested."}
    except (httpx.HTTPError, ValueError):
        return {"available": False, "models": [],
                "message": "Ollama unavailable at 127.0.0.1:11434. No online fallback or download."}
