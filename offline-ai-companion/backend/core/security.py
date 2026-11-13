"""Dependency-free authorization primitives used by the ASGI boundary."""
import hmac
import re

TOKEN_PATTERN = re.compile(r"^[0-9a-f]{64}$")


def valid_token(token: str) -> bool:
    return bool(TOKEN_PATTERN.fullmatch(token))


def authorized(header: str, token: str) -> bool:
    return valid_token(token) and hmac.compare_digest(
        header.encode("utf-8"), ("Bearer " + token).encode("utf-8")
    )


def trusted_peer(host: str) -> bool:
    return host in {"127.0.0.1", "::1"}
