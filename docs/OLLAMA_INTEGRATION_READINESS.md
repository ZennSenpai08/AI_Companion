# Current readiness update — 2026-11-14

Real Qwen3.5 0.8B transport is available; English-only bilingual quality is **not accepted**.
qwen2.5:1.5b is now selectable if separately installed and verified local; shared policy
requires 3 GiB free RAM provisionally. Gemma1B/Qwen3 1.7B are also absent. No weights pulled.
Existing 2 GiB Qwen0.8 guard correctly rejected warm turns after cold-load RAM pressure.
See [BILINGUAL_ENGLISH_RESPONSES.md](BILINGUAL_ENGLISH_RESPONSES.md) for current candidate
sizes, actual test evidence and commands; older larger-model recommendations below are
not the immediate target. Preserve installed/default choices until explicitly switched.

# Ollama integration readiness — 2026-11-14

Latest status: saved normal-Windows Vue real-chat transport/restart/interrupt checks PASS.
Fresh 0.8B backend traces, installed selection save and explicit authenticated unload PASS.
Qwen 0.8B is installed; Gemma 1B/Qwen 1.7B are not. Shared policy, installed-only selectors
and pre-switch verification are implemented; no weights downloaded. Actual memory shortage
explains saved rejections; thresholds remain unchanged. Quality remains FAIL for Filipino/
Taglish and instruction consistency. See MODEL_SWITCHING_AND_MEMORY.md for all current
evidence, safety limits, benchmark results and exact commands. Older setup-blocked reports
below are historical; updated native model controls still require normal-session QA.

Latest repair supersedes the earlier unavailable-service report below: Ollama 0.40.16 and
installed qwen3.5:0.8b Q8_0 are reachable on verified loopback; admission passes. Two actual
Node → FastAPI → Ollama traces completed with real output and SQLite restart persistence.
Normal dev interpreter selection and readiness-gated requests were corrected; diagnostics
now locate backend/bootstrap/model/stream/Vue evidence failures. Actual native Vue-model
acceptance after the repair is still pending ordinary-Windows rebuild/retest. Do not
download another model. See LOCAL_REQUEST_CHAT_REPAIR.md for outputs/timings, known weak
Taglish/context quality and exact commands. The prior setup-blocked state below is history.

Current integration attempt: real inference is BLOCKED, not completed. Ollama was not
found on PATH/in usual installation locations and local metadata requests failed. No
listener or weights were confirmed. No install/pull/inference was forced with insufficient
free RAM. See REAL_OLLAMA_TEST.md for exact ordinary-PowerShell setup/acceptance commands.

Implemented explicit read-only ollama:check and opt-in test:chat-real (actual Vue form →
IPC → FastAPI → production Ollama provider). Completed responses now carry allowlisted
timing/token measurements; HTTP timeouts have a specific helpful error. This reuses the
existing pipeline, not a second implementation. Node/Python tests cover fixtures/protocol;
the actual real-model UI runner has not passed in this environment.

Initial RAM observation: 15.31 GiB usable / 0.58 GiB free; preflight later 0.39 GiB free.
The final saved preflight at 00:05 UTC had 1.50 GiB free, still below Lite admission.
GPU: RTX 2050, 4096 MiB total, driver 595.79; ambient usage varies and is not inference
memory. Disk initially 113.95 GiB free. Model version/digest/size and all real throughput/
language/personality scores remain unknown. First selected candidate remains 0.8B, roughly
1.3 GB catalogue size for llama.cpp, not an actually downloaded/measured model here.

The earlier preparation review below remains useful architecture context. Its statement
of no adapter change applied to the previous review, not this implementation attempt.

## Existing modules to reuse

| Layer | Existing implementation |
|---|---|
| Desktop entry | package.json → scripts/dev.cjs → Vite + electron/main.cjs; production npm start → same main + built dist; recovery page only when dist missing |
| Vue entry | frontend/src/main.ts mounts windows/Panel.vue; overlay.ts mounts windows/Overlay.vue |
| Chat/settings | components/Chat.vue and EngineSettings.vue; bounded message draft, model/language selection, Stop, messages/history, settings/readiness errors |
| Renderer state | services/chat-state.mjs rejects stale generation sequences/epochs; subscriptions removed on unmount |
| Preload/main | Frozen typed allowlisted bridge; trusted main-frame sender checks; main owns credentials, admission and cancellation |
| Backend transport | Authenticated ephemeral 127.0.0.1 HTTP/NDJSON via electron/chat.cjs/http.cjs; no browser → Ollama network permission |
| Process ownership | BackendSupervisor creates per-launch secret, stdin handshake; backend/bootstrap binds loopback only; watchdog stops child after parent EOF |
| API | /health, /diagnostics, /models, /preferences, /messages, /chat; memory CRUD/export/history-clear; no public docs/OpenAPI, origin/remote clients rejected |
| Conversation | backend/core/conversation.py serializes turns, retrieves bounded history/facts, streams, stores only complete assistant replies, cancels/cleans provider |
| LLM interface | backend/llm/provider.py Protocol; ollama.py already posts to fixed /api/chat, validates NDJSON, rejects cloud/unknown tags and redirects/proxies |
| Persona | personality/persona.py reloads protected character/persona.yaml every turn; memories are untrusted data, not system policy |
| Persistence | memory/sqlite_store.py sessions/messages/user-approved facts with provenance/timestamps; preferences table via core/preferences.py; parameterized SQL; readable local SQLite |

No new conversational brain, SDK or service abstraction is needed for the first real turn.
Current provider uses think:false, num_ctx:4096, num_predict:512, keep_alive:30s and a
90-second absolute deadline. Prompt assembly is capped at 3000 serialized UTF-8 bytes,
up to 12 recent messages and eight selected facts. Full conversation history is not dumped
into the prompt. There is no durable summary, response regeneration UI, structured emotions
or semantic persona-consistency evaluation with a real model yet. The 60-turn persona
test checks prompt construction with fixtures; it does not prove model behavior.

Optional done.metrics now contains only validated completion measurements and is not
written into message history. New native test data is isolated from personal userData.
Its transport PASS would require actual generated replies/counts, restored SQLite history,
unchanged protected file and interruption recovery; human language/persona review and
full app restart/external isolation remain explicitly separate gates.

capabilities.chat=true means the route/provider adapter exists. It does not mean an Ollama
daemon, weights or GPU inference is ready. STT/TTS/Live2D remain false, as expected.

## Actual local observations

Read-only inspection: Ollama not found on the agent PATH; existing installed_models()
returns unavailable for 127.0.0.1:11434. This is not proof that no other user context has
installed files. No unrelated user folders or private model caches were inspected.
Measured usable RAM 15.31 GiB, free RAM 0.32 GiB, project-volume free disk 107.32 GiB.
RTX 2050 4 GiB is the target verified earlier, not a fresh GPU benchmark in this task.

Current main-process admission requires 2/6/10 GiB free RAM for the 0.8B/4B/9B options.
These are conservative application guards, not measured published model minimums.
The current free-memory observation fails even the Lite guard. Do not force inference
or change the thresholds to hide this condition; first recover usable memory normally.

## Small-model evaluation choice

Checked official listings on 2026-11-14. Sizes are decimal download/catalogue sizes,
not peak RAM/VRAM requirements; record the actual Windows tag digest before any later pull.

| Candidate | Observed Windows llama.cpp listing | Decision for 4 GiB VRAM / 16 GB RAM |
|---|---|---|
| qwen3.5:0.8b | About 1.3 GB, Q8_0; page also lists a 1.2 GB alternative backend | First wiring/latency smoke candidate after RAM recovery; small weights leave more headroom; quality unmeasured |
| qwen3.5:4b | About 3.3 GB, Q4_K_M; page also lists a 4.0 GB alternative backend | Second quality comparison; overhead/context/projector may require CPU offload; full-GPU fit and latency unproven |
| qwen3.5:9b | Larger existing allowlisted option | Defer for this first hardware-limited milestone |

Size/quantization sources: [0.8B](https://ollama.com/library/qwen3.5:0.8b),
[4B](https://ollama.com/library/qwen3.5:4b). Qwen's [official 0.8B card](https://huggingface.co/Qwen/Qwen3.5-0.8B)
lists Apache-2.0 and broad multilingual coverage. That does not establish natural Filipino
or Taglish quality, especially at 0.8B. Exact distributed weight notices must be retained.
No latency, GPU-fit or language-quality benchmark was run here.

## Minimum next milestone (not executed)

1. Finish ordinary-session interactive desktop acceptance in DESKTOP_FOUNDATION_VERIFICATION.md.
2. Recheck available RAM, GPU/driver and disk. Select a supported native Windows Ollama
   version and record its exact version. Report selected tag size and overhead before
   deliberately preparing weights; do not add an automatic download path to Mika.
3. Start only a loopback daemon, disable cloud features for that daemon with
   OLLAMA_NO_CLOUD=1, and limit loaded models/concurrent requests to one. A variable set
   only in Mika does not reconfigure an already running external Ollama server. Ollama's
   [environment source](https://github.com/ollama/ollama/blob/main/envconfig/config.go)
   documents the cloud/host/parallelism settings. Do not enable request-body debug logging.
4. Record actual /api/tags and /api/show digest, quantization, license and size; verify a
   real direct /api/chat response with no tools, remote tags or hosted fallback.
5. Use the existing model selector/Chat pipeline. Verify first delta, complete reply,
   Stop/cancel, missing model, daemon unavailable and restart-memory recall. No adapter
   correction is currently demonstrated as necessary; fix only actual compatibility errors.
6. Evaluate English, Filipino and Taglish separately: casual greeting, technical problem,
   serious situation, explicit language switch, protected-identity conflict and corrected
   approved memory. Record human quality assessment; compare 4B only if 0.8B is inadequate
   and sufficient memory remains. A real 50+ turn/restart persona evaluation is still needed.
7. Record cold/warm first-token and total latency, peak RAM/VRAM, error/cancel recovery and
   ollama ps CPU/GPU placement. [Ollama FAQ](https://docs.ollama.com/faq) describes checking
   placement and the additional context/parallelism memory costs. No timing target is
   asserted as achieved. Keep existing 4096-token context initially rather than advertised 256K.
8. Prepare all permitted files, then block external networking in a controlled test and
   repeat actual desktop text/restart/recall. The process-scoped Python network guard
   alone does not cover Electron, native inference or the independent Ollama updater.

Completion requires actual local replies in Mika with this protected profile and recorded
language/cancellation/offline evidence. It does not require speech, Live2D, Hindsight,
OpenViking, OpenJarvis, a new frontend or a second backend.
