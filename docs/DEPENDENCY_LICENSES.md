# Dependency and asset license register

Reviewed 2026-11-13. This inventory records observations, not a blanket commercial-release
approval. Record exact resolved versions, hashes, LICENSE/NOTICE files and weight revision
before shipping. No referenced project source, weights or artwork copied into this repo.

| Dependency/reference | Code license / source | Weight or asset distinction | Use |
|---|---|---|---|
| Electron | MIT; https://github.com/electron/electron/blob/main/LICENSE | Chromium/Node bundled notices required | Desktop target |
| Vue / Vite | MIT upstream repositories | No models | Renderer/build target |
| TypeScript | Apache-2.0 | No models | Type checking target |
| FastAPI / Uvicorn / Pydantic | MIT / BSD-3-Clause / MIT upstream | No models | Backend target |
| AIRI | MIT repo LICENSE | Character assets separate | Reference only |
| Open-LLM-VTuber | MIT repo LICENSE | LICENSE-Live2D.md and model terms separate | Reference only |
| OmniVoice | Apache-2.0 repo LICENSE | Current weight card states CC-BY-NC; exact revision/terms and tokenizer licenses must be frozen | TTS candidate |
| VoiceStudio | AGPL-3.0 repo LICENSE | Engine/model licenses separate | Reference only |
| Audio8 | Apache-2.0 code/0.6B per README | 0.1B separate weight license | Research only |
| VibeVoice | MIT repo LICENSE | Check selected ASR/TTS checkpoint separately | Research only |
| Fish Speech | Fish Audio Community License current main | S2-Pro Research License per README; voice rights separate | Excluded default |
| Pretty girl hosted listing | No offline voice license established | No weights or voice-cloning permission established | Style discussion only |
| faster-whisper | MIT repo LICENSE | Whisper/CTranslate2/PyAV notices separately | STT candidate |
| Silero VAD | MIT repo LICENSE | Save selected model license with artifact | VAD candidate |
| Buzz | MIT repo LICENSE | Provider weights separately | Diagnostics reference |
| Ollama | MIT repo LICENSE | Qwen3.5 4B/9B cards list Apache-2.0; exact Ollama quantization revision still unverified | Local LLM candidate |
| Hindsight | MIT, https://github.com/vectorize-io/hindsight/blob/main/LICENSE | Database/model licenses separate | Deferred optional |
| OpenViking | AGPL-3.0, https://github.com/volcengine/OpenViking/blob/main/LICENSE | Embedding/VLM terms separate | Deferred optional |
| OpenJarvis | Apache-2.0, https://github.com/open-jarvis/OpenJarvis/blob/main/LICENSE | Engine/tool permissions separate | Deferred optional |
| AnythingLLM | MIT, https://github.com/Mintplex-Labs/anything-llm/blob/master/LICENSE | Embedded engines/model terms separate | Reference only |
| Cubism Framework/samples | Live2D Open Software terms; repo LICENSE | Core proprietary; sample art Free Material + Sample Data Terms | Not provisioned |
| Hiyori candidate | Official sample page and terms | Credit/usage/content and publication conditions apply | Not downloaded |

See TECHNOLOGY_RESEARCH.md for primary links and limitations. Release requires copying
actual notices of shipped dependencies; this table alone does not satisfy attribution.
The original application code is not externally licensed/published yet; see LICENSE.

## Installed continuation test dependencies

Observed from the recovered wheel metadata/LICENSEs, scoped to the partial development
venv. Preserve the actual shipped package notices and licenses if any become redistributed.
These are not an approved release lock or proof of model licensing.

| Installed artifact | License observation |
|---|---|
| httpx 0.28.1 / httpcore 1.0.9 | BSD-3-Clause |
| anyio 4.9.0 / h11 0.16.0 | MIT |
| idna 3.20 | BSD-3-Clause |
| certifi 2026.10.23 | MPL-2.0 |
| sniffio 1.3.1 | MIT OR Apache-2.0 |
| typing_extensions 4.16.0 | PSF-2.0 |
| exceptiongroup 1.3.1 | MIT in installed LICENSE |
| autopep8 2.3.2 | MIT text in installed LICENSE; metadata lacks an SPDX declaration |
| pycodestyle 2.14.0 / isort 6.1.0 / tomli 2.4.1 / zipp 3.23.1 | MIT |
| importlib_metadata 8.7.1 | Apache-2.0 |

HTTPX async streaming API documentation consulted: https://www.python-httpx.org/async/.
Protocol schema documentation: https://docs.ollama.com/api/chat. No inference model installed.

## Executed ASGI runtime update

Compatible current artifacts from the additional pip HTTP cache are installed in a separate
Python 3.10.11 .venv-runtime. Native wheels were checked against the interpreter's supported
tags. No executable ABI or Requires-Python restrictions were bypassed. The release target
remains Python 3.12 and still needs independent preparation and compatibility checks.

| Artifact | Installed metadata license |
|---|---|
| FastAPI 0.140.13 / Pydantic 2.12.5 / Pydantic Core 2.41.5 | MIT |
| Starlette 1.3.1 / Uvicorn 0.52.0 / websockets 15.0.1 | BSD-3-Clause |

Direct pins: requirements.txt; executed runtime dependency set: requirements-runtime-lock.txt.
Primary package metadata checked: https://pypi.org/pypi/fastapi/0.140.13/json,
https://pypi.org/pypi/starlette/1.3.1/json, https://pypi.org/pypi/uvicorn/0.52.0/json.
Actual notices remain preserved in the installed wheel dist-info; no installer distributed.

## Optional native voice diagnostic

pywin32 311 is installed only in .venv-runtime from a RECORD/tag-checked local cp310 wheel;
requirements-voice-windows.txt keeps it optional and Windows-only. Installed metadata
declares PSF, and component license notices remain in its dist-info. Upstream:
https://github.com/mhammond/pywin32. Preserve all component notices before redistribution.

Microsoft David/Zira are pre-existing Windows voices, not assets licensed or shipped by
this project. No voice files, recordings or clones were extracted. The adapter attempts
normal installed-engine synthesis; its current failure does not establish quality or
redistribution rights. No new release permission or neural weight license is inferred.
