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

The main process completes the supervised backend handshake before loading the Vue pages,
whose mount hooks immediately request settings/status. A failed handshake still permits
the existing retry interface. Readonly preload security flags expose booleans only. The
actual-app smoke requires both Vue mounts, OS renderer sandbox evidence, preload/IPC,
authenticated backend health and process/socket cleanup; fixture report tests do not
constitute native acceptance.

## Verified continuation boundaries

Both HTTP readers enforce line/transfer limits and an absolute deadline. Ollama packets
must be objects with a boolean completion flag and a message object; main-process events
are separately validated and require done/error before successful stream end. Abort closes
connections and suppresses later callbacks. Text generation has explicit state transitions
through THINKING/IDLE/INTERRUPTED/ERROR. Reserved audio states do not enable audio features.

A framework-independent renderer module queues notifications until the admission sequence
is known, rejects old sequences and tracks local request epochs across Stop/reset/new turns.
This module is strict-type-checked and tested without a Vue build. It is now the state logic
used by Chat.vue; its integration still needs real Vue/native acceptance.

The offline test guard is process-scoped to Python APIs (DNS/TCP/UDP/bind), including loopback
HTTP tests. External firewall isolation and prepared actual speech models remain mandatory
for release acceptance. The guard does not cover native libraries or child processes.

## Actual backend verification

The separate .venv-runtime (Python 3.10.11) now executes the pinned current ASGI stack.
Tests cover both in-process httpx ASGI transport and actual Uvicorn TCP listeners spawned
by the production bootstrap. Node supervisor tests verify authenticated health and memory
through restart and listener/process cleanup. A further real-socket test exercises the full
text API/adapter path with fixture-only model inference, including disconnect cancellation.
These backend tests do not establish native renderer/desktop or real-model acceptance.

## Local preferences and engine diagnostics

Authenticated /preferences GET/POST persists a strict model/language/volume/animation/cursor
allowlist in SQLite; unknown settings and invalid values are rejected. History deletion
does not delete preferences. /models queries only fixed loopback Ollama tags, with proxy,
redirect and response-size limits. It never downloads weights. Main adds actual free RAM
and truthful microphone/voice/avatar readiness; unavailable capabilities stay disabled.
Vue settings consume the existing narrow preload bridge. These Vue additions are source
only until the missing frontend toolchain and native launch gates pass.

The optional Windows SAPI adapter uses a fixed Python COM child module with stdin JSON,
plain-text synthesis and memory PCM output. Deadline/cancellation terminates and waits for
the child. No shell, voice cloning, network or audio-device playback is involved. Installed
voice enumeration works; synthesis is denied in this security context. It is not activated
in the conversation pipeline. OmniVoice/STT/Live2D remain unprovisioned.

The local HTTP bridge counts UTF-8 bytes with an 8 MiB transfer ceiling, accommodating
the bounded SQLite Unicode fact export while still rejecting oversized responses.
