import asyncio
import tempfile
import unittest
from pathlib import Path

from backend.core.conversation import Conversation
from backend.llm.ollama import OllamaProvider
from backend.llm.provider import ProviderError
from backend.memory.sqlite_store import MemoryStore


class FixtureProvider:
    def __init__(self, values=None, error=None, wait=False):
        self.values = values if values is not None else ["Kumusta", " ka?"]
        self.error = error
        self.closed = False
        self.wait = wait
        self.prompt = None

    async def stream(self, messages, model):
        self.prompt = messages
        try:
            for value in self.values:
                yield value
                if self.wait:
                    await asyncio.sleep(60)
            if self.error:
                raise self.error
        finally:
            self.closed = True


class ConversationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.store = MemoryStore(Path(self.directory.name) / "assistant.sqlite")

    def tearDown(self):
        self.directory.cleanup()

    async def test_stream_persists_complete_reply_with_protected_persona(self):
        provider = FixtureProvider()
        conversation = Conversation(self.store, provider)
        events = [event async for event in conversation.turn("Hello", "qwen3.5:0.8b")]
        self.assertEqual(events[0]["state"], "THINKING")
        self.assertEqual(events[-1]["state"], "IDLE")
        self.assertEqual("".join(e.get("text", "") for e in events), "Kumusta ka?")
        self.assertEqual(provider.prompt[0]["role"], "system")
        self.assertTrue(provider.closed)
        self.assertEqual(self.store.recent(self.store.session())[-1]["role"], "assistant")
        self.assertEqual(self.store.list_memories(), [])

    async def test_cancel_closes_provider_without_saving_partial_answer(self):
        provider = FixtureProvider(wait=True)
        conversation = Conversation(self.store, provider)
        stream = conversation.turn("Hello", "qwen3.5:0.8b")
        await stream.__anext__()  # thinking
        await stream.__anext__()  # first delta
        pending = asyncio.create_task(stream.__anext__())
        await asyncio.sleep(0.01)
        pending.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await pending
        await stream.aclose()
        self.assertTrue(provider.closed)
        self.assertEqual([m["role"] for m in self.store.recent(self.store.session())], ["user"])
        self.assertFalse(conversation.busy.locked())

    async def test_provider_error_and_empty_reply_do_not_persist_assistant(self):
        for provider in (FixtureProvider(error=ProviderError("model missing")), FixtureProvider(values=[])):
            conversation = Conversation(self.store, provider)
            with self.assertRaises(ProviderError):
                _ = [event async for event in conversation.turn("Hello", "qwen3.5:0.8b")]
            self.assertTrue(provider.closed)
        self.assertNotIn("assistant", [m["role"] for m in self.store.recent(self.store.session())])

    async def test_cloud_and_arbitrary_model_names_rejected_before_network(self):
        provider = OllamaProvider()
        for model in ("gpt:cloud", "qwen3.5:4b-cloud", "http://remote/model", "unknown"):
            with self.assertRaises(ProviderError):
                _ = [text async for text in provider.stream([], model)]
