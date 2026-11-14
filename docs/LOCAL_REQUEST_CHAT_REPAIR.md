# Local request and real-chat repair — 2026-11-14

Source/request repair and genuine backend inference: verified. Actual Vue + real model
acceptance after the repair: pending ordinary-Windows rebuild/retest. Do not mark the
desktop AI feature complete from the headless result.

## Exact local-request failure

requestLocal checks port, 64-hex launch credential and an exact route allowlist before
opening a socket. The reported /preferences and /messages callers supplied valid relative
routes; hostname is fixed to 127.0.0.1, not taken from renderer data or environment proxies.
Invalid local request at that guard means invalid/unset port or credential for these calls.

Reproduced the startup mechanism: normal Electron defaulted to .venv/Scripts/python.exe,
while desktop smoke selected .venv-runtime/Scripts/python.exe. Actual inspection found:

| Interpreter | Version | FastAPI/Uvicorn |
|---|---|---|
| .venv | 3.9.13 | Both missing |
| .venv-runtime | 3.10.11 | Both installed |

Failed bootstrap clears port to 0 and token to an empty string. startBackend deliberately
continues into the recovery-capable Vue UI after failure, so subsequent history/preferences
requests hit the security guard. This is not evidence of an incorrect URL or CORS policy.
A stale explicit MIKA_PYTHON can cause the same startup failure; explicit configuration
continues to take precedence and is now identified by a sanitized source label.

Fix: normal launch and smoke share developmentPython(), selecting the prepared runtime
when no explicit interpreter is configured. Public BackendSupervisor.request gates reads
and writes on status=ready and retains the useful startup error. The private authenticated
health handshake remains available while starting. Main routes preferences/memory/history
through that readiness gate instead of directly supplying cleared transport credentials.

The low-level guard is preserved and strengthened with field-only error codes; it does
not print field values. Bodies must be non-array objects and only approved write routes
can use POST. No host, header, credential, IPC sender or renderer security check was removed.
Regression tests reproduce failed bootstrap and verify preferences/messages with the
actual prepared Python, valid auth, invalid auth, invalid paths/ports/bodies and restart.

## Where the old real-chat test stopped

Saved user run: test-artifacts/electron-startup/
mika-2026-11-14T00-42-21-101Z-813bd3e9/. Foundation/cleanup pass; realChat fails with empty
turns. Its isolated SQLite contains two user rows and no assistant row; the screenshot
shows a pending reply. At least the runner's first form submission reached persistence,
so this case was not simply an unmounted Chat tab or missing model admission.

Filtered Ollama server log (HTTP metadata only, no prompt/reply content) records:

| Local time | /api/chat result | Duration |
|---|---|---|
| 08:43:06 | HTTP 499 | 41.91 s |
| 08:44:05 | HTTP 499 | 29.02 s |

These are client-closed requests, not completed answers, and both end before Mika's
90-second provider deadline. Ollama's [upstream discussion](https://github.com/ollama/ollama/issues/19139)
also distinguishes early client disconnects from inference timeout. The actor that closed
these historical requests is not established. A second non-runner prompt exists in the
saved test data; do not attribute it to a person or infer a model crash from that alone.

The old runner waited only for a text delta/error and ignored INTERRUPTED/replacement
sequences. A cancelled turn could therefore wait until the generic evidence deadline.
It appended a turn only after the helper returned, losing stage/evidence on exceptions.

Fix: the runner retains every failed attempt, named stage, safe event summary and UTC/
elapsed timestamps. It recognizes interruption/replacement immediately, excludes another
turn's evidence, uses the actual enabled Send button, checks Vue initialization and final
rendering, and refuses stale built assets. No inference/stream timeout was increased.

## Diagnostic stages and codes

Dev/smoke main logs show Python source, backend starting/ready/failure, chat admission,
first delta and terminal code. Python emits only allowlisted stage/time facts when the
main diagnostic hook is enabled: chat_received → context_ready → ollama_request →
ollama_headers → ollama_first_delta → ollama_done. Raw stderr/extra JSON fields are never
forwarded. Production logging is off. No prompts, generated text or launch secrets appear
in these stage logs; explicitly generated test transcripts remain in ignored artifacts.

| Code/stage | Interpretation |
|---|---|
| BACKEND_NOT_READY | Startup/restart failed or is incomplete; inspect Python selection/Settings |
| INVALID_LOCAL_PORT/CREDENTIAL/ROUTE/BODY | Transport guard rejected a field; values stay private |
| bootstrap-preferences/messages | Local initialization request failed before model submission |
| STALE_FRONTEND_BUILD | Rebuild dist to include the Vue readiness markers |
| UI_INITIALIZATION_FAILED | Vue could not load history/preferences |
| OLLAMA_UNAVAILABLE | Connection failed/timed out before reaching the daemon |
| MODEL_NOT_INSTALLED | Ollama returned 404 for the selected model |
| MODEL_LOAD_FAILED | Ollama rejected/runs unsuccessfully; inspect daemon/model setup |
| MODEL_RESPONSE_TIMEOUT | No response headers by deadline; could include load/prefill, not proof of loading alone |
| INFERENCE_TIMEOUT | Headers arrived but generation did not finish by the existing deadline |
| STREAM_TRANSPORT_ERROR | Main-to-backend stream failed |
| CHAT_INTERRUPTED / TEST_INTERFERED | Test request cancelled/replaced; no 100-second wait hiding it |
| vue-render / EVIDENCE_TIMEOUT | Compare completed stream against Vue DOM and last recorded stage |

Closing Settings still hides it; hiding the overlay still leaves the backend/tray running.
No correct lifecycle behavior was changed. New renderer/tray action-source messages make
future show/hide attribution possible; old window-hidden facts do not identify the actor.

## Genuine installed-model evidence

Confirmed Ollama 0.40.16, qwen3.5:0.8b Q8_0, digest beginning de63045f2975, catalogue size
1,322,069,277 bytes, loopback-only listener and sufficient RAM. No model downloaded or
replaced. Two real diagnostics use the production Node HTTP reader, authenticated FastAPI,
protected persona, Ollama provider and SQLite, with isolated synthetic test data:

- test-artifacts/chat-trace/2026-11-14T00-55-32-329Z-dca02aec/result.json
- test-artifacts/chat-trace/2026-11-14T01-03-20-079Z-ca765115/result.json

First run: first English delta 72.343 s, server-reported load 30.038 s and prompt evaluation
42.114 s. Later deltas 0.114–0.151 s. The second run's first delta was 5.394 s (load 5.007 s).
Do not call all first-token delay model loading, or raise every timeout to conceal it.

Second run measurements and actual generated excerpts:

| Case | First delta | Total | Generated tokens/s | Result |
|---|---|---|---|---|
| English | 5.394 s | 5.689 s | 66.608 | "Good evening, my little corner!" followed by a question |
| Taglish | 0.151 s | 0.406 s | 49.174 | "Gusto, nag-uusapin." — unnatural; quality not accepted |
| Context | 0.144 s | 0.594 s | 54.299 | Generated text mangled the test code word |
| Follow-up | 0.114 s | 0.551 s | 67.713 | "Simplaguita, thank you!" — inaccurate spelling/recall |
| Persona | 0.126 s | 0.775 s | 62.824 | "I am Mika..." but added an unwanted invented nickname |

These are real outputs, not fixtures or demonstration replies. Basic name recognition
occurred, but language/personality/context quality is not accepted as finished. Token rate
is server generation-only, excluding load/prefill. Both backend traces restored exact
message history after a real backend restart and stopped their child. That is not a full
Electron restart or semantic-memory evaluation, and neither run exercises the Vue bridge.

## Commands for ordinary Windows PowerShell

Use the already installed model. No install, pull, ACL change or sandbox flag is needed.
From the project root, leave automatic test windows untouched:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
$env:MIKA_PYTHON = (Resolve-Path '.venv-runtime\Scripts\python.exe').Path
npm run ollama:check
npm run typecheck
npm run lint:js
npm run build
npm run test:desktop
npm run test:chat-real
```

If it fails, inspect desktop-smoke.json → realChat.failureStage/code/turns[].trace plus
launch.json → lifecycle/backend-stage events. A stale bundle is reported immediately.
Do not manually type, Stop or switch tabs during the automatic run; its own cancellation
test performs those actions in sequence. Actual model/language text is only in its
isolated test transcript, not the sanitized stage logs.

For the independent backend trace and later manual UI test:

```powershell
npm run test:chat-api
npm run dev
```

Inspect Settings backend-ready, then Chat English/Taglish/follow-up. Close/reopen Settings
as desired; Quit Mika normally after completion. Current agent build is blocked by esbuild
parent-read restrictions, and native execution by the existing runtime ACL check. No
permission repair is attempted. Thus fresh native Vue-model acceptance remains pending;
headless success is not substituted for it. External-network-isolated acceptance also
remains unverified. No TTS/STT/Live2D or additional model work is part of this repair.
