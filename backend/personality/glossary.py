"""Bounded, editable local expression hints; no network, embeddings or new service."""
import json
import re
from pathlib import Path

GLOSSARY = Path(__file__).resolve().parents[2] / "character" / "filipino_expressions.json"


def relevant_expressions(text, path=GLOSSARY):
    """At most three whole expressions and 480 serialized UTF-8 bytes per turn.

    A missing/malformed optional glossary degrades to ordinary comprehension. Its
    contents remain untrusted data; never elevate edits to system instructions.
    """
    try:
        with Path(path).open("rb") as source:
            raw = source.read(32769)
        if len(raw) > 32768:
            return []
        entries = json.loads(raw)
        if not isinstance(entries, list):
            return []
        matches = []
        for entry in entries[:64]:
            if not isinstance(entry, dict):
                continue
            term, meaning = entry.get("term"), entry.get("meaning")
            if not isinstance(term, str) or not isinstance(meaning, str):
                continue
            if not 1 <= len(term) <= 40 or not 1 <= len(meaning) <= 240:
                continue
            pattern = r"(?<!\w)" + r"\s+".join(re.escape(part) for part in term.split()) + r"(?!\w)"
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match and term.strip():
                matches.append((match.start(), {"term": term, "meaning": meaning}))
        result = []
        for _, entry in sorted(matches, key=lambda item: item[0]):
            if len(result) == 3:
                break
            if len(json.dumps(result + [entry], ensure_ascii=False).encode("utf-8")) <= 480:
                result.append(entry)
        return result
    except (OSError, ValueError, UnicodeError):
        return []
