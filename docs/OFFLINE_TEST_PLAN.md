# Offline acceptance plan

## Foundation checks (available before models)

- Run dependency-free Node and Python tests; distinguish lifecycle fixtures from FastAPI.
- Run scripts/offline_smoke.py (process-scoped Python DNS/TCP/UDP/bind guard, not a firewall test).
- Real backend must reject missing/wrong bearer headers, Origin, remote peers and unknown Host.
- Launch Electron; verify Node absent in renderer, narrow bridge present, remote navigation
  and remote resources denied. Verify missing dependencies produce actionable diagnostics.
- Close normally and kill the parent; check no Python listener or child remains.

## Full product acceptance (NOT yet run)

1. Prepare permitted local weights, voice/conditioning and avatar/Core with recorded hashes.
2. Disable outbound traffic in a user-authorized firewall/air-gap environment for Electron,
   Python, Ollama and all optional runners; do not infer isolation from HF offline flags.
3. Observe process network activity and verify zero unintended external requests.
4. Perform English, Filipino and Taglish spoken turns, interruptions and device removal.
5. Store an approved memory; restart without internet and retrieve, edit and delete it.
6. Evaluate original identity for 50+ turns, hostile retrieval and language switches.
7. Drag/scale/hide/restore, toggle topmost/click-through, change monitor geometry.
8. Measure actual endpointing/STT/first-token/TTS/first-audio latency and peak RAM/VRAM.
9. Build and install on a clean Windows machine; repeat offline and shutdown tests.

Never call a guarded unit test a complete offline spoken-conversation validation.

## Latest foundation run

verify_foundation.py records all eight available checks and their actual outputs under
test-artifacts/verification. Latest result: 28 Node passes, 29 Python passes/5 ASGI skips,
zero unexpected external attempts in the guarded Python test process. HTTP tests use a
clearly labeled protocol fixture, not real model inference. Child/native traffic is not
measured by this process guard. Full product steps above remain unrun.

Latest API-runtime run supersedes the earlier skipped-ASGI result: 30 Node and 39 Python
passes with no skips, including actual FastAPI/Uvicorn lifecycle and TCP text-path tests.
Only the model side is a local protocol fixture. Zero unexpected external attempts were
recorded in the guarded Python parent, but subprocess/native traffic is not measured by
those hooks. Full firewall/voice/model/native acceptance remains unrun.
