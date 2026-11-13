"""Local explicit-fact memory and conversation persistence. No inferred fact writes."""
import json
import re
import sqlite3
import threading
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path


def timestamp():
    return datetime.now(timezone.utc).isoformat()


class MemoryStore:
    def __init__(self, filename):
        self.filename = Path(filename)
        self.filename.parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.RLock()
        with self.connect() as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY, created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id),
                    role TEXT NOT NULL CHECK(role IN ('user','assistant')),
                    content TEXT NOT NULL, created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY, text TEXT NOT NULL, created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL, provenance TEXT NOT NULL,
                    confidence TEXT NOT NULL CHECK(confidence = 'user-approved')
                );
            """)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(str(self.filename), timeout=5)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA secure_delete=ON")
        try:
            with db:
                yield db
        finally:
            db.close()

    def session(self):
        with self.lock, self.connect() as db:
            row = db.execute("SELECT id FROM sessions ORDER BY rowid DESC LIMIT 1").fetchone()
            if row:
                return row["id"]
            session_id = str(uuid.uuid4())
            db.execute("INSERT INTO sessions VALUES (?, ?)", (session_id, timestamp()))
            return session_id

    def append(self, session_id, role, content):
        if role not in (
                "user",
                "assistant") or not isinstance(
                content,
                str) or len(content) > 16000:
            raise ValueError("Invalid conversation message")
        with self.lock, self.connect() as db:
            db.execute("INSERT INTO messages(session_id,role,content,created_at) VALUES(?,?,?,?)",
                       (session_id, role, content, timestamp()))

    def recent(self, session_id, limit=12):
        with self.lock, self.connect() as db:
            rows = db.execute(
                "SELECT role,content FROM messages WHERE session_id=? ORDER BY id DESC LIMIT ?",
                (session_id, min(max(limit, 0), 50)),
            ).fetchall()
        return [dict(row) for row in reversed(rows)]

    @staticmethod
    def validate_text(text):
        if not isinstance(text, str) or not text.strip() or len(text) > 500:
            raise ValueError("Memory text must contain 1–500 characters")
        return text.strip()

    def remember(self, text, approved=False):
        if approved is not True:
            raise ValueError("Explicit user approval required")
        text = self.validate_text(text)
        now = timestamp()
        memory_id = str(uuid.uuid4())
        with self.lock, self.connect() as db:
            count = db.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
            if count >= 2000:
                raise ValueError("Memory limit reached; delete old facts first")
            db.execute("INSERT INTO memories VALUES(?,?,?,?,?,?)",
                       (memory_id, text, now, now, "memory-controls", "user-approved"))
        return memory_id

    def list_memories(self, query=""):
        with self.lock, self.connect() as db:
            rows = db.execute("SELECT * FROM memories ORDER BY updated_at DESC").fetchall()
        return [dict(row) for row in rows if query.casefold() in row["text"].casefold()]

    def recall(self, query, limit=8):
        terms = set(re.findall(r"\w+", query.casefold()))
        ranked = []
        for fact in self.list_memories():
            score = len(terms.intersection(re.findall(r"\w+", fact["text"].casefold())))
            if score:
                ranked.append((score, fact))
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [fact for _, fact in ranked[:min(max(limit, 0), 8)]]

    def update_memory(self, memory_id, text):
        text = self.validate_text(text)
        with self.lock, self.connect() as db:
            result = db.execute("UPDATE memories SET text=?,updated_at=? WHERE id=?",
                                (text, timestamp(), memory_id))
            if result.rowcount == 0:
                raise KeyError("Memory not found")

    def forget(self, memory_id):
        with self.lock, self.connect() as db:
            result = db.execute("DELETE FROM memories WHERE id=?", (memory_id,))
            if not result.rowcount:
                raise KeyError("Memory not found")

    def export_memories(self):
        return json.dumps({"version": 1, "exported_at": timestamp(),
                           "memories": self.list_memories()}, ensure_ascii=False, indent=2)

    def clear_history(self):
        with self.lock, self.connect() as db:
            db.execute("DELETE FROM messages")
            db.execute("DELETE FROM sessions")
