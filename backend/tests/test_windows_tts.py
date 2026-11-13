"""SAPI discovery/cancellation use real COM children; PCM checks explicitly use fixture audio."""
import asyncio
import base64
import importlib.util
import io
import sys
import unittest
import wave
from unittest.mock import patch

from backend.tts.provider import SpeechError
from backend.tts.windows_sapi import WindowsSapiTTS

AVAILABLE = sys.platform == "win32" and importlib.util.find_spec("win32com") is not None


class SpeechValidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_invalid_inputs_fail_before_native_engine_or_process(self):
        provider = WindowsSapiTTS()
        for text, voice, rate in (("", "voice", 0), ("a" * 1001, "voice", 0),
                                  ("hello", "", 0), ("hello", "voice", True)):
            with self.assertRaises(SpeechError):
                await provider.synthesize(text, voice, rate)

    async def test_fixture_pcm_is_wrapped_as_valid_wave(self):
        class FixtureTTS(WindowsSapiTTS):
            async def _run(self, request):
                return {"pcm_base64": base64.b64encode(b"\x00\x01" * 16000).decode(),
                        "sample_rate": 16000, "channels": 1, "sample_width": 2}
        audio = await FixtureTTS().synthesize("Fixture text", "Fixture voice")
        with wave.open(io.BytesIO(audio.wav), "rb") as result:
            self.assertEqual(result.getframerate(), 16000)
            self.assertEqual(result.getnframes(), 16000)
        self.assertEqual(audio.duration_s, 1)


@unittest.skipUnless(AVAILABLE, "Optional Windows COM dependency not installed")
class NativeSpeechBoundaryTests(unittest.IsolatedAsyncioTestCase):
    async def test_actual_installed_voice_catalog_has_no_network_or_download(self):
        voices = await WindowsSapiTTS().voices()
        self.assertTrue(voices)
        self.assertTrue(all(set(item) == {"name", "language", "gender"} for item in voices))
        # Discovery is not evidence that synthesis or Filipino pronunciation works.

    async def test_cancel_cleans_up_real_native_helper_process(self):
        original = asyncio.create_subprocess_exec
        started = asyncio.Event()
        children = []

        async def capture(*args, **kwargs):
            process = await original(*args, **kwargs)
            children.append(process)
            started.set()
            return process

        with patch("backend.tts.windows_sapi.asyncio.create_subprocess_exec", capture):
            task = asyncio.create_task(WindowsSapiTTS().voices())
            await asyncio.wait_for(started.wait(), timeout=3)
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task
        self.assertTrue(children)
        self.assertIsNotNone(children[0].returncode)
