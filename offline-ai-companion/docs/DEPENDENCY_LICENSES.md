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
