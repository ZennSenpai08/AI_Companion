"""Allowlisted completed-inference measurements; no prompt/response content."""
import math


def completion_metrics(packet, wall_s, first_token_s):
    result = {"wall_ms": round(wall_s * 1000, 3)}
    if first_token_s is not None:
        result["first_token_ms"] = round(first_token_s * 1000, 3)
    for source, target in (("load_duration", "load_ms"),
                           ("total_duration", "server_total_ms"),
                           ("prompt_eval_duration", "prompt_eval_ms"),
                           ("eval_duration", "generation_ms")):
        value = packet.get(source)
        if isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= 10**15:
            result[target] = round(value / 1_000_000, 3)
    for name in ("eval_count", "prompt_eval_count"):
        value = packet.get(name)
        if isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= 10**9:
            result[name] = value
    duration = packet.get("eval_duration")
    if ("eval_count" in result and "generation_ms" in result and duration > 0):
        rate = result["eval_count"] * 1_000_000_000 / duration
        if math.isfinite(rate):
            result["tokens_per_second"] = round(rate, 3)
    return result
