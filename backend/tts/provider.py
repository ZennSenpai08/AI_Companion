from dataclasses import dataclass
from typing import Protocol


class SpeechError(Exception):
    """Safe local speech error; no user content or file paths in messages."""


@dataclass(frozen=True)
class SpeechAudio:
    wav: bytes
    voice: str
    duration_s: float
    generation_s: float
    engine: str


class TTSProvider(Protocol):
    async def voices(self) -> list:
        ...

    async def synthesize(self, text: str, voice: str, rate: int = 0) -> SpeechAudio:
        ...
