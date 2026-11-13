"""Validated runtime configuration; no remote endpoints or implicit downloads."""
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RuntimeConfig:
    data_dir: Path
    offline: bool = True
    microphone_enabled: bool = False
    retain_audio: bool = False
    llm_model: str = "qwen3.5:0.8b"

    def __post_init__(self):
        if not self.offline:
            raise ValueError("Online mode is not implemented")
        if self.microphone_enabled or self.retain_audio:
            raise ValueError("Audio capture is not implemented; it must stay disabled")
