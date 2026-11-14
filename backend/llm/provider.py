from typing import AsyncIterator, Protocol


class ProviderError(Exception):
    """User-safe provider error: never include request content or credentials."""

    def __init__(self, message, code="INFERENCE_ERROR"):
        super().__init__(message)
        self.code = code


class LLMProvider(Protocol):
    def stream(self, messages: list, model: str) -> AsyncIterator[str]:
        ...
