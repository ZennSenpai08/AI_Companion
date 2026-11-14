"""Authenticated loopback API for local text and explicit memory; no cloud fallback."""
import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend.core.conversation import Conversation
from backend.core.diagnostics import stage
from backend.core.preferences import Preferences
from backend.core.security import authorized, trusted_peer, valid_token
from backend.llm.ollama import OllamaProvider
from backend.llm.provider import ProviderError
from backend.llm.readiness import installed_models, require_installed, loaded_models, unload_model
from backend.llm.models import DEFAULT_MODEL, validate_model
from backend.memory.sqlite_store import MemoryStore


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=4000)
    model: str = DEFAULT_MODEL
    language: Literal["auto", "en", "fil", "taglish"] = "auto"

    @field_validator("model")
    @classmethod
    def local_model(cls, value):
        return validate_model(value)

    @field_validator("text")
    @classmethod
    def nonblank_text(cls, value):
        if not value.strip():
            raise ValueError("Message must contain non-whitespace text")
        return value


class MemoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    operation: Literal["remember", "update", "forget"]
    text: Optional[str] = Field(default=None, min_length=1, max_length=500)
    id: Optional[str] = Field(default=None, min_length=36, max_length=36)
    approved: Literal[True]

    @field_validator("approved", mode="before")
    @classmethod
    def explicit_approval(cls, value):
        if value is not True:
            raise ValueError("Explicit boolean approval required")
        return value

    @model_validator(mode="after")
    def operation_fields(self):
        if self.operation in {"remember", "update"} and (
                self.text is None or not self.text.strip()):
            raise ValueError("Memory text is required")
        if self.operation in {"update", "forget"} and self.id is None:
            raise ValueError("Memory identifier is required")
        return self


class ModelRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    model: str

    @field_validator("model")
    @classmethod
    def local_model(cls, value):
        return validate_model(value)


def create_app(token: str, on_ready=None, data_dir=None, provider=None) -> FastAPI:
    if not isinstance(token, str) or not valid_token(token):
        raise ValueError("A valid per-launch secret is required")
    store = MemoryStore(Path(data_dir or "data") / "assistant.sqlite")
    conversation = Conversation(store, provider or OllamaProvider())
    preferences = Preferences(store)

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
            "offline": True, "microphone": "off", "state": conversation.state,
            "capabilities": {"chat": True, "stt": False, "tts": False, "live2d": False},
        }

    @app.get("/diagnostics")
    async def diagnostics():
        return {
            "runtime": "local",
            "network_policy": "loopback-only",
            "state": conversation.state,
            "microphone": "off",
            "audio_retention": False,
            "providers": {
                "llm": "Ollama local adapter (model availability unverified)",
                "stt": "not installed",
                "tts": "not installed",
                "avatar": "not provisioned"},
            "message": ("Local text adapter available; model presence is unverified. "
                        "Speech and Live2D are not enabled."),
        }

    @app.get("/preferences")
    async def read_preferences():
        return preferences.read()

    @app.post("/preferences")
    async def update_preferences(change: dict):
        try:
            if "model" in change:
                if conversation.busy.locked():
                    raise HTTPException(409, "Stop the active reply before switching models")
                async with conversation.busy:
                    await require_installed(change["model"])
                    return preferences.update(change)
            return preferences.update(change)
        except ValueError as error:
            raise HTTPException(422, str(error)) from error
        except ProviderError as error:
            raise HTTPException(409, str(error)) from error

    @app.get("/models")
    async def models():
        catalog, loaded = await asyncio.gather(installed_models(), loaded_models())
        return {**catalog, "loaded": loaded}

    @app.post("/model-unload")
    async def model_unload(change: ModelRequest):
        if conversation.busy.locked():
            raise HTTPException(409, "Stop the active reply before unloading a model")
        try:
            async with conversation.busy:
                await unload_model(change.model)
            return {"ok": True}
        except (ProviderError, ValueError, asyncio.TimeoutError) as error:
            raise HTTPException(409, "Could not unload the selected local model. Refresh and retry.") from error

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
            stage("chat_received")
            try:
                if provider is None:
                    await require_installed(message.model)
                async for event in conversation.turn(message.text, message.model, message.language):
                    yield json.dumps(event, ensure_ascii=False) + "\n"
            except asyncio.CancelledError:
                raise
            except (ProviderError, ValueError) as error:
                yield json.dumps({"type": "error", "message": str(error), "state": "ERROR",
                                  "code": getattr(error, "code", "CONTEXT_REJECTED")}) + "\n"
            except Exception:
                yield json.dumps({
                    "type": "error",
                    "message": "Local conversation failed. Retry or open diagnostics.",
                    "state": "ERROR",
                }) + "\n"
        return StreamingResponse(events(), media_type="application/x-ndjson")

    return app
