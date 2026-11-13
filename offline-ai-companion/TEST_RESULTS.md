# Test evidence — 2026-11-13

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
