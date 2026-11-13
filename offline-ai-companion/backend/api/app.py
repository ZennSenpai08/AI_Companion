"""Authenticated loopback API for local text and explicit memory; no cloud fallback."""
from contextlib import asynccontextmanager
from typing import Literal, Optional
from pathlib import Path
import asyncio
import json

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field

from backend.core.conversation import Conversation
from backend.llm.ollama import OllamaProvider
from backend.llm.provider import ProviderError
from backend.memory.sqlite_store import MemoryStore
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend.core.security import authorized, trusted_peer


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=4000)
    model: Literal["qwen3.5:0.8b", "qwen3.5:4b", "qwen3.5:9b"] = "qwen3.5:0.8b"
    language: Literal["auto", "en", "fil", "taglish"] = "auto"


class MemoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    operation: Literal["remember", "update", "forget"]
    text: Optional[str] = Field(default=None, min_length=1, max_length=500)
    id: Optional[str] = Field(default=None, min_length=36, max_length=36)
    approved: Literal[True]


def create_app(token: str, on_ready=None, data_dir=None, provider=None) -> FastAPI:
    store = MemoryStore(Path(data_dir or "data") / "assistant.sqlite")
    conversation = Conversation(store, provider or OllamaProvider())
    @asynccontextmanager
    async def lifespan(_app):
        if on_ready:
            on_ready()
        yield

    app = FastAPI(
        title="Mika local assistant", docs_url=None, redoc_url=None,
        openapi_url=None, lifespan=lifespan,
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost"])

    @app.middleware("http")
    async def authenticate(request: Request, call_next):
        origin: Optional[str] = request.headers.get("origin")
        if (not request.client or not trusted_peer(request.client.host)
                or origin is not None
                or not authorized(request.headers.get("authorization", ""), token)):
            return JSONResponse({"error": "Unauthorized local request"}, status_code=401)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.get("/health")
    async def health():
        return {
            "service": "mika-assistant", "protocol": 1, "status": "ok",
            "offline": True, "microphone": "off", "state": "IDLE",
            "capabilities": {"chat": True, "stt": False, "tts": False, "live2d": False},
        }

    @app.get("/diagnostics")
    async def diagnostics():
        return {
            "runtime": "local", "network_policy": "loopback-only",
            "microphone": "off", "audio_retention": False,
            "providers": {"llm": "Ollama local adapter (model availability unverified)", "stt": "not installed",
                          "tts": "not installed", "avatar": "not provisioned"},
            "message": "Local text adapter available; model presence is unverified. Speech and Live2D are not enabled.",
        }

    @app.get("/messages")
    async def messages():
        return {"messages": store.recent(store.session(), limit=50)}

    @app.get("/memories")
    async def memories():
        return {"memories": store.list_memories()}

    @app.get("/memory-export")
    async def memory_export():
        return json.loads(store.export_memories())

    @app.post("/memory")
    async def memory_change(change: MemoryRequest):
        try:
            if change.operation == "remember":
                memory_id = store.remember(change.text, approved=change.approved)
                return {"id": memory_id}
            if change.operation == "update":
                store.update_memory(change.id, change.text)
            elif change.operation == "forget":
                store.forget(change.id)
        except ValueError as error:
            raise HTTPException(400, str(error)) from error
        except KeyError as error:
            raise HTTPException(404, "Memory not found") from error
        return {"ok": True}

    @app.post("/history-clear")
    async def history_clear():
        if conversation.busy.locked():
            raise HTTPException(409, "Stop the active reply before deleting history")
        store.clear_history()
        return {"ok": True}

    @app.post("/chat")
    async def chat(message: ChatRequest):
        async def events():
            try:
                async for event in conversation.turn(message.text, message.model, message.language):
                    yield json.dumps(event, ensure_ascii=False) + "\n"
            except asyncio.CancelledError:
                raise
            except (ProviderError, ValueError) as error:
                yield json.dumps({"type": "error", "message": str(error), "state": "ERROR"}) + "\n"
            except Exception:
                yield json.dumps({"type": "error", "message": "Local conversation failed. Retry or open diagnostics.",
                                  "state": "ERROR"}) + "\n"
        return StreamingResponse(events(), media_type="application/x-ndjson")

    return app
