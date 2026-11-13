from typing import AsyncIterator, Protocol


class ProviderError(Exception):
    """User-safe provider error: never include request content or credentials."""


class LLMProvider(Protocol):
    def stream(self, messages: list, model: str) -> AsyncIterator[str]:
        ...
