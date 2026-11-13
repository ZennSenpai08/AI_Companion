# Current verification — actual API runtime, 2026-11-13

Command: `./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py` — **exit 0**.
Python 3.10.11, recovered compatible current stack. All eight available checks passed.

| Check | Actual executed result |
|---|---|
| Node tests | **30 passed; zero skipped/failed** |
| Python guarded suite | **39 passed; zero skipped/failed** |
| Strict Electron type checking | Passed |
| Strict renderer chat-core type checking | Passed; full Vue build not included |
| JavaScript ESLint | Passed |
| Python pycodestyle / isort | Passed; Ruff is still unavailable |
| pip dependency check | Passed |

The suite includes nine real FastAPI/httpx ASGI tests, two Node tests launching the actual
production bootstrap/Uvicorn server, and a Python TCP integration through the actual API
and Ollama HTTP adapter. SQLite memory survives service restart and can be deleted through
the actual API. Child and listener cleanup pass on normal shutdown and parent pipe closure.

The full text-path integration uses an explicit **model-protocol fixture**, not a real LLM.
It verifies protected persona/relevant memory construction, actual streaming, disconnect
cancellation, state/lock recovery, rejection of history deletion during generation, model
error sanitization and restart. No native UI or model capability is inferred from it.

The guarded Python parent process recorded **zero unexpected external attempts**. Guard
hooks do not cover subprocess/native networking. This is not firewall-isolated spoken QA.
Exact command arrays, exit codes and output are in `test-artifacts/verification/report.json`
and sibling .txt files. They are ignored local QA artifacts; this file preserves the results.

Runtime versions: FastAPI 0.140.13, Starlette 1.3.1, Uvicorn 0.52.0,
Pydantic 2.12.5/Core 2.41.5, httpx 0.28.1, websockets 15.0.1. Python 3.12 release target
remains untested. The old Python 3.9 .venv intentionally lacks the API stack and skips those
tests; use .venv-runtime for current evidence.

Native Electron smoke was retried with the working backend interpreter and still failed
before application code at its sandbox ACL check. Vue build, Ruff, actual Ollama/weights,
STT/TTS/microphone/Live2D, full offline speech and installer acceptance remain open.
No new system/profile ACL changes or sandbox bypass were performed.

---

# Earlier HTTP-only continuation evidence — 2026-11-13

`./.venv/Scripts/python.exe scripts/verify_foundation.py` exited 0. All eight available
foundation checks passed. Exact command arrays, exit codes and captured outputs are in
`test-artifacts/verification/report.json` and its sibling .txt files (ignored by Git).

| Check | Executed result | Scope |
|---|---|---|
| Node suite | 28 passed, no failures/skips | HTTP/subprocess fixtures, resource policy, typed renderer chat state |
| Guarded Python suite | 34 run: 29 passed, 5 skipped | Actual httpx sockets to local protocol fixture, memory, persona construction, states, guard self-tests |
| Electron strict type check | Passed | Main/preload/JS scripts |
| Renderer core strict type check | Passed | Framework-independent chat state and bridge types; not Vue compilation |
| JavaScript ESLint | Passed | Electron/scripts/Node tests/renderer services |
| Python pycodestyle | Passed, max line 100 | Backend and test harness scripts; not a Ruff replacement |
| Python isort check | Passed | Same Python scope |
| pip check | Passed | Installed partial test environment only |

The Python guard reported **zero unexpected external attempts** within its guarded process.
It covers Python DNS, TCP/connect_ex, UDP sendto and binding. It does not prove OS-wide
isolation or cover child processes/native networking. No spoken offline acceptance passed.

New protocol regressions were first reproduced: JSON list/null-message crashes, non-boolean
completion accepted, and a main-process terminal/error race. Fixes passed the real loopback
protocol tests. Other regressions cover an endless empty stream, coalesced packet cancellation,
missing completion, stale renderer events, Stop-before-admission, startup null/list JSON,
and a blocked shutdown callback. The production parent watchdog is tested with fixture servers.
A formatter initially moved the offline entrypoint import before its path setup; this was
repaired and the standalone guarded entrypoint passed. Final Python style check also passed.

The Ollama fixture is not a running model. No real Ollama, STT, TTS or Live2D test passed.
Five FastAPI integration tests remain skipped. Ruff is still unavailable, Vue build remains
blocked, and the saved native Electron ACL failure is unresolved. No installer was produced.

---

## Initial checkpoint evidence


| Command/check | Actual result | Scope |
|---|---|---|
| `node --test tests/node/*.test.cjs` | 15 passed; 0 failed/skipped | Real local HTTP/subprocess fixture tests plus policy/bounds validation |
| `.venv/Scripts/python.exe -m unittest discover -s backend/tests -v` | Earlier core run: 14 passed; 3 ASGI tests skipped. Two ASGI tests subsequently added; latest offline run below covers discovery | Python unit tests, not model behavior |
| `.venv/Scripts/python.exe scripts/offline_smoke.py` | 14 passed, 5 ASGI tests skipped; exit 0 | Python foundation with process-scoped external socket guard |
| `node node_modules/typescript/bin/tsc -p tsconfig.electron.json --pretty false` | Passed, exit 0 | Strict checkJs main/preload/scripts; not Vue typecheck |
| `node node_modules/eslint/bin/eslint.js electron scripts tests/node` | Passed, exit 0 | JavaScript lint only |
| `.venv/Scripts/python.exe -m compileall -q backend` | Passed | Python syntax, not Ruff or API runtime |
| `.venv/Scripts/python.exe -m ruff check backend` | Unavailable: No module named ruff | Not passed |
| `npm run build` | Failed: vue-tsc not recognized | Vue/Vite build unverified |
| `node scripts/desktop-smoke.cjs` | Failed twice: Electron sandbox ACL fatal error | No windows/IPC/tray transparency acceptance or screenshot |
| `node scripts/release-gate.cjs` | Expected exit 1: packaged backend absent | Installer not built |

Node tests cover exact local documents, remote-resource refusal, geometry recovery,
secret-bearing health requests, missing executable/dependencies, malformed startup,
timeout cleanup, crash/restart, cancellation, split NDJSON, and child exit after killed
supervising parent using the production stdin watchdog.

Python tests cover exact authorization, denied network/audio flags, safe bootstrap
failure, approved-fact persistence across reopened databases, correction/export/deletion,
SQL injection treated as data, bounded history/recall, 60-turn prompt identity placement,
provider cancellation, no partial assistant retention, and rejection of cloud model tags.
Conversation output in these tests is explicitly a fixture. The 60-turn test verifies
prompt construction only; actual LLM personality consistency has not been evaluated.

Five real FastAPI/httpx integration tests are present but skipped because dependencies
are unavailable. Ollama availability, real text inference, UI memory controls, mic,
STT/TTS, spoken Taglish, audio interruption, Live2D, firewall isolation, performance,
installer and clean-machine tests have **not** passed or been simulated as success.

Earlier failures repaired: initial checkJs annotations, missing AbortSignal ESLint global,
offline script import path, failed-spawn cleanup, and connection lifetime issues. Native
sandbox ACL and dependency availability remain blockers. No model speed or latency figures
are reported. Full acceptance procedure: docs/OFFLINE_TEST_PLAN.md.
