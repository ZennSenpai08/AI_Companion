# Architecture

Electron main owns application lifecycle, windows, tray, permission policy and the Python
child. Vue runs with sandbox, context isolation and no Node integration. A narrow preload
bridge exposes typed allowlisted operations. Backend credentials stay in main, never in
URLs, renderer storage or logs. Main proxies authenticated loopback requests/events.

Python FastAPI owns conversation orchestration and replaceable LLM/STT/TTS/memory engines.
Ollama is an independently installed loopback provider. No remote hosts or redirects.
Every generation reloads protected persona instructions; memory is untrusted data.
Only explicit user-approved facts enter long-term memory. SQLite remains local.

No cloud fallback, arbitrary shell/desktop actions, telemetry or automatic downloads.
Live2D SDK/Core/model licenses are separate gates. An unavailable model must be visibly
reported; a diagnostic visual must never be represented as a working Live2D avatar.

Target states: IDLE, LISTENING, TRANSCRIBING, THINKING, SPEAKING, INTERRUPTED, ERROR.
Cancellation must invalidate stale events, stop audio and return animation to idle.
Microphone is off initially; capture and retention require separate explicit actions.

## Current implementation detail

The first text slice uses authenticated POST /chat with NDJSON streaming through main
process HTTP. Renderer event messages are forwarded over a fixed preload subscription.
This avoids an extra WebSocket client dependency while voice/event transport is pending.
WebSocket conversation transport remains planned for the voice phase; none is implemented
or verified yet. Main assigns a generation sequence and aborts previous requests; a Stop
invalidates stale renderer events. Backend async generation closes its provider in finally.

The protected profile is JSON-compatible YAML, parsed with the standard library and
reloaded for each generation. A serialized 3000-byte prompt limit preserves the system
profile and rejects overlarge input. No durable conversation summary exists yet. SQLite
records conversation messages and only explicit UI-approved facts. Lexical memory recall
is bounded to eight relevant facts. SQL is parameterized and connections close per operation.
Data is readable SQLite, not encrypted; operating-system account/disk protection applies.

Electron main/preload use CommonJS with TypeScript checkJs and strict checking, allowing
the native recovery panel to start without the renderer build. Vue panels use TypeScript.
The dependency-free recovery UI supports diagnostics and desktop recovery only; it does
not substitute for the unbuilt Vue chat or claim to render a Live2D model.
