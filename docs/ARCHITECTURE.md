# Architecture

## Current presentation and language policy (2026-11-14)

Voice-first target: consented mic → offline multilingual STT → local understanding →
English reply → local English TTS → caption beneath the floating licensed Live2D avatar.
The optional controls/history panel is not the primary product experience. Normal launch
now shows the overlay only; smoke deliberately opens both windows. Main owns the current
response snapshot/revision and broadcasts updates to both secure renderer bridges. The
caption is text-only, never fake audio; privacy/history deletion clears its current text.
New native layout/hit-testing acceptance remains open. No audio/Live2D engine was enabled.

English-only output lives in the protected profile. Persisted language values are input
hints, so old Filipino/Taglish settings no longer ask for non-English replies. The editable
local glossary retrieves only current-input whole expressions (three entries / 480 UTF-8
bytes maximum), as lower-priority reference data inside the existing 3000-byte prompt bound.
There is no translation service, output-language guarantee or semantic-memory expansion.
See BILINGUAL_ENGLISH_RESPONSES.md for observed model failures and resource measurements.

## Shared model policy and memory boundary (2026-11-14)

Python and Electron read backend/llm/model_policy.json for supported tags/defaults/free-RAM
thresholds. Vue receives installed compatible choices through existing authenticated IPC;
the backend verifies catalog membership and local GGUF metadata before changing selection
or real chat. Switching/unloading is blocked while generation owns the conversation lock.
The explicit confirmed unload control invokes only the selected model's fixed-loopback
empty generate/keep_alive=0 operation; it never deletes weights or messages. Guard thresholds
also apply to warm requests; residency counters are diagnostic, not memory credits.
Saved persona/history are unchanged by selection. Context eviction retains complete
user-led turns within the existing byte bound. MODEL_SWITCHING_AND_MEMORY.md records
real measurements, quality failures and native UI verification boundaries.

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
not substitute for the Vue chat or claim to render a Live2D model. The user's built Vue
pages now have saved successful native/preload/backend evidence; real inference is separate.

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
Vue settings consume the existing narrow preload bridge. Both Vue mounts/preload/backend
health pass in the saved normal-Windows actual-app run; individual settings interactions
and physical desktop controls still need the manual acceptance described below.

The optional Windows SAPI adapter uses a fixed Python COM child module with stdin JSON,
plain-text synthesis and memory PCM output. Deadline/cancellation terminates and waits for
the child. No shell, voice cloning, network or audio-device playback is involved. Installed
voice enumeration works; synthesis is denied in this security context. It is not activated
in the conversation pipeline. OmniVoice/STT/Live2D remain unprovisioned.

The local HTTP bridge counts UTF-8 bytes with an 8 MiB transfer ceiling, accommodating
the bounded SQLite Unicode fact export while still rejecting oversized responses.

## Desktop lifecycle verification boundary

Interactive dev has no exit timer. Settings/overlay close events hide their own windows;
the tray remains. Explicit Quit persists bounds/topmost, cancels chat and awaits backend
shutdown before final app.quit closes windows. A second process exits normally if Mika
already owns the single-instance lock. MIKA_SMOKE_TEST=1 deliberately runs automated
actual-app checks then quits. Dev/smoke-only lifecycle console events now distinguish
those sources; no shutdown semantics changed. See DESKTOP_FOUNDATION_VERIFICATION.md.

The next real-model milestone reuses existing modules; OLLAMA_INTEGRATION_READINESS.md
records observed hardware/readiness, official model sizes and required real acceptance.

Development Python now uses one selector in main/smoke, honoring MIKA_PYTHON then preferring
the already prepared .venv-runtime. BackendSupervisor exposes requests only once ready;
its internal authenticated handshake is separate. UI recovery after failed startup remains
available, with useful setup errors instead of passing port 0/empty token into HTTP.
Transport validation remains fixed-loopback, exact-route, credential checked and now
classifies rejected fields without values. Dev-only backend stage facts are sanitized
before forwarding; arbitrary stderr, prompts/replies and credentials are never relayed.

## Real text verification instrumentation

OllamaProvider resets completion metrics per turn and exposes only bounded numeric server
measurements plus observed first-token/wall duration. Conversation attaches them to done,
never to SQLite message contents. Missing/malformed counters remain absent; HTTP read
timeouts are distinct from missing service errors. Ordinary streaming semantics and
persona/context boundaries remain unchanged.

Explicit npm run test:chat-real invokes read-only service/model/listener/RAM admission,
then the actual Vue form/IPC/backend path in isolated test userData. It does not connect
a fixture provider or pull weights. The main-only native helper is gated by unpackaged
smoke + explicit real-chat flags and adds no renderer privilege. It checks backend restart,
Vue restore, cancellation and numeric completions, while semantic language/persona quality,
whole-app restart and external-network isolation remain separate verification gates.
