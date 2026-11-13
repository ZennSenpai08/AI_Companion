"""Bounded streaming JSON parser with a shared absolute inference deadline."""
import asyncio
import json

from backend.llm.provider import ProviderError

MAX_LINE_BYTES = 65536
MAX_STREAM_BYTES = 4 * 1024 * 1024


def parse_packet(raw):
    if len(raw) > MAX_LINE_BYTES:
        raise ProviderError("Local model response exceeded the protocol limit.")
    try:
        packet = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeError) as error:
        raise ProviderError("Ollama returned an invalid stream.") from error
    if not isinstance(packet, dict):
        raise ProviderError("Ollama returned an invalid packet.")
    return packet


async def read_packets(chunks, deadline):
    buffer = bytearray()
    received = 0
    iterator = chunks.__aiter__()
    while True:
        remaining = deadline - asyncio.get_running_loop().time()
        if remaining <= 0:
            raise asyncio.TimeoutError()
        try:
            chunk = await asyncio.wait_for(iterator.__anext__(), timeout=remaining)
        except StopAsyncIteration:
            break
        received += len(chunk)
        if received > MAX_STREAM_BYTES:
            raise ProviderError("Local model stream exceeded the transfer limit.")
        buffer.extend(chunk)
        while True:
            index = buffer.find(b"\n")
            if index < 0:
                break
            if index > MAX_LINE_BYTES:
                raise ProviderError("Local model response exceeded the protocol limit.")
            line = bytes(buffer[:index])
            del buffer[:index + 1]
            if line.strip():
                yield parse_packet(line)
        if len(buffer) > MAX_LINE_BYTES:
            raise ProviderError("Local model response exceeded the protocol limit.")
    if buffer.strip():
        yield parse_packet(bytes(buffer))
