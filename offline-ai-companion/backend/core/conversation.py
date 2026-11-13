"""Bounded local text turn. Inference cancellation closes the async provider stream."""
import asyncio
import uuid

from backend.llm.provider import ProviderError
from backend.personality.persona import PersonaManager


class Conversation:
    def __init__(self, store, provider, persona=None):
        self.store = store
        self.provider = provider
        self.persona = persona or PersonaManager()
        self.busy = asyncio.Lock()

    async def turn(self, text, model, language="auto"):
        if self.busy.locked():
            raise ProviderError("A reply is already active. Stop it before sending another.")
        if not isinstance(text, str) or not text.strip() or len(text) > 4000:
            raise ValueError("Message must contain 1–4000 characters")
        async with self.busy:
            turn_id = str(uuid.uuid4())
            session = self.store.session()
            prompt = self.persona.assemble(self.store.recent(session), self.store.recall(text),
                                           text, language)
            self.store.append(session, "user", text)
            yield {"type": "state", "state": "THINKING", "turn_id": turn_id}
            answer = ""
            stream = self.provider.stream(prompt, model)
            try:
                async for delta in stream:
                    if not isinstance(delta, str) or len(answer) + len(delta) > 16000:
                        raise ProviderError("Reply exceeded the local text limit.")
                    answer += delta
                    yield {"type": "delta", "text": delta, "turn_id": turn_id}
                if not answer.strip():
                    raise ProviderError("Local model returned an empty reply.")
                self.store.append(session, "assistant", answer)
                yield {"type": "done", "turn_id": turn_id}
                yield {"type": "state", "state": "IDLE", "turn_id": turn_id}
            except asyncio.CancelledError:
                # Partial assistant text is not treated as a durable fact or completed reply.
                raise
            finally:
                await stream.aclose()
