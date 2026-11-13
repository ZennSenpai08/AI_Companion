"""Optional built-in Windows voice adapter, isolated from the API process."""
import asyncio
import base64
import io
import json
import math
import sys
import time
import wave
from pathlib import Path

from backend.tts.provider import SpeechAudio, SpeechError

ROOT = Path(__file__).resolve().parents[2]


class WindowsSapiTTS:
    def __init__(self):
        self.available = False

    async def _run(self, request):
        if sys.platform != "win32":
            raise SpeechError("Windows installed voices are unavailable on this platform.")
        process = await asyncio.create_subprocess_exec(
            sys.executable, "-u", "-m", "backend.tts.sapi_runner", cwd=ROOT,
            stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL, creationflags=0x08000000,
            limit=6 * 1024 * 1024,
        )
        try:
            process.stdin.write(json.dumps(request, ensure_ascii=False).encode("utf-8") + b"\n")
            await process.stdin.drain()
            # Keep stdin open: helper treats EOF as parent shutdown, even on a killed API.
            raw = await asyncio.wait_for(process.stdout.readline(), timeout=15)
            if len(raw) > 6 * 1024 * 1024:
                raise SpeechError("Local voice output exceeded the audio limit.")
            try:
                result = json.loads(raw)
            except ValueError as error:
                raise SpeechError(
                    "Local Windows voice is unavailable or synthesis failed.") from error
            process.stdin.close()
            await asyncio.wait_for(process.wait(), timeout=2)
            if result.get("error") == "ENGINE_ACCESS_DENIED":
                raise SpeechError(
                    "Windows speech synthesis was denied by the current process security context.")
            if process.returncode != 0:
                raise SpeechError("Local Windows voice is unavailable or synthesis failed.")
            return result
        except (asyncio.TimeoutError, NotImplementedError, OSError) as error:
            raise SpeechError("Local Windows speech timed out or could not start.") from error
        finally:
            if process.returncode is None:
                process.kill()
            await process.wait()
            if process.stdout:
                await process.stdout.read()
            if process.stdin and not process.stdin.is_closing():
                process.stdin.close()

    async def voices(self):
        result = await self._run({"operation": "voices"})
        voices = result.get("voices")
        if not isinstance(voices, list):
            raise SpeechError("Invalid installed voice catalog.")
        self.available = bool(voices)
        return voices

    async def synthesize(self, text, voice, rate=0):
        if not isinstance(text, str) or not text.strip() or len(text) > 1000:
            raise SpeechError("Voice preview requires 1–1000 characters.")
        if not isinstance(voice, str) or not voice or len(voice) > 200:
            raise SpeechError("Select an installed local voice.")
        if isinstance(rate, bool) or not isinstance(rate, int) or not -3 <= rate <= 3:
            raise SpeechError("Speech rate must be between -3 and 3.")
        start = time.monotonic()
        result = await self._run({"operation": "synthesize", "text": text,
                                  "voice": voice, "rate": rate})
        try:
            pcm = base64.b64decode(result["pcm_base64"], validate=True)
            if (result["sample_rate"], result["channels"], result["sample_width"]) != (16000, 1, 2):
                raise ValueError("Unsupported PCM format")
            if not pcm or len(pcm) > 3840000 or len(pcm) % 2:
                raise ValueError("Invalid PCM length")
        except (KeyError, TypeError, ValueError) as error:
            raise SpeechError("Invalid local speech data.") from error
        output = io.BytesIO()
        with wave.open(output, "wb") as audio:
            audio.setnchannels(1)
            audio.setsampwidth(2)
            audio.setframerate(16000)
            audio.writeframes(pcm)
        elapsed = time.monotonic() - start
        if not math.isfinite(elapsed):
            raise SpeechError("Invalid synthesis timing.")
        return SpeechAudio(output.getvalue(), voice, len(pcm) / 32000, elapsed, "windows-sapi")
