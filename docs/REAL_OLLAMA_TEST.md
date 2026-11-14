# Real offline text acceptance — Windows procedure

Current result: genuine backend inference/SQLite restoration PASS; repaired native Vue
acceptance pending ordinary-Windows rebuild/retest. Ollama 0.40.16 + 0.8B Q8_0 are already
installed/reachable. Do not reinstall or pull additional weights for this repair. Follow
LOCAL_REQUEST_CHAT_REPAIR.md first. The original setup instructions below describe the
earlier missing-service state; do not substitute fixture outputs for current acceptance.

## Original one-model setup (already completed)

Candidate: qwen3.5:0.8b. The [official catalogue](https://ollama.com/library/qwen3.5:0.8b)
lists approximately 1.3 GB for the llama.cpp Q8_0 variant (another backend is listed at
1.2 GB). This is download size, not peak RAM/VRAM. The [Windows documentation](https://docs.ollama.com/windows)
requires additional runtime disk space (at least 4 GB) and NVIDIA driver 551.61+.
Observed driver 595.79 satisfies that version requirement; GPU inference has not been tested.
The 4B candidate remains a later comparison, not an automatic additional download.

First close memory-heavy programs normally and retain at least 2 GiB free system RAM,
matching Mika's unchanged Lite admission guard. No program is killed automatically.
Initial inspection found 15.31 GiB usable / 0.58 GiB free, 113.95 GiB disk free; later
preflight had only 0.39 GiB free. Do not bypass this guard to force an unstable load.

If Ollama is absent, inspect/install the user-scoped native package, then open a fresh
PowerShell so PATH updates take effect:

```powershell
winget show --exact --id Ollama.Ollama --source winget
winget install --exact --id Ollama.Ollama --source winget --scope user
```

The [Microsoft manifest](https://github.com/microsoft/winget-pkgs/tree/master/manifests/o/Ollama/Ollama)
identifies this user-scoped package. Record the actually installed version; no version is
claimed installed here. If winget is unavailable, use the official Windows installer
linked by Ollama's Windows documentation. Do not change permissions or request admin to
work around this agent's execution restrictions.

Quit any existing Ollama tray instance through its menu before starting this explicitly
configured server. In the first ordinary PowerShell window:

```powershell
ollama --version
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NO_CLOUD = '1'
$env:OLLAMA_NUM_PARALLEL = '1'
$env:OLLAMA_MAX_LOADED_MODELS = '1'
ollama serve
```

This foreground command remains running. Settings apply to that server, not to an
unrelated already-running instance. Check its startup log for cloud disabled; these
are session variables, not profile/system changes. [Official cloud/local configuration](https://docs.ollama.com/faq#how-do-i-disable-ollamas-cloud-features).

In a second ordinary PowerShell window, prepare only the stated model during the online
setup period, then verify metadata:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
ollama pull qwen3.5:0.8b
if ($LASTEXITCODE -ne 0) { throw 'Model preparation failed' }
ollama list
Invoke-RestMethod http://127.0.0.1:11434/api/version
npm run ollama:check
if ($LASTEXITCODE -ne 0) { throw 'Fix reported readiness blockers before inference' }
```

The pull is an explicit setup download, never a Mika runtime fallback. Preflight records
version, exact tag digest/size/quantization/license, loaded-model metadata, free RAM/disk
and NVIDIA memory/driver readings. It requires a verified loopback-only listener, local
GGUF weights and the RAM guard. It invokes no inference, installer or pull. Unknown
listener output, remote metadata, missing weights or invalid catalogue fields fail closed.
An unavailable version/catalogue is not a report of successful installation.

## Exercise the actual Vue conversation path

```powershell
npm run typecheck
npm run lint:js
npm run build
npm run test:chat-real
```

The real-chat command checks readiness before spawning the secure native app. It uses
a fresh ignored test-artifact data directory, so it does not read or overwrite personal
Mika history/preferences. It changes no window security settings and uses the actual
Vue form submission handlers, frozen preload, trusted IPC, authenticated FastAPI and
production OllamaProvider. No simulated model provider is connected to this mode.

It records eight completed test turns (English/Filipino/Taglish, serious context, identity
conflict, snack context/recall and post-cancellation recovery), plus a cancellation attempt.
It restarts the real backend and remounts Chat to compare restored history against SQLite.
Cancelled partial assistant output must not appear as a completed database message.
The persona file's checksum must remain unchanged. Model instruction-following/persona
quality is still a human evaluation, not proved by the checksum or a nonempty reply.

The smoke requests normal Quit afterward and checks the current backend PID/listener
cleanup. A restarted backend's new process/port is used for that check. Deadline is ten
minutes; unusually slow inference or failed cancellation makes acceptance incomplete.
The ordinary desktop smoke is unchanged in purpose and does not run inference by default.

Artifacts under test-artifacts/electron-startup/mika-*/:

- ollama-preflight.json: actual service/model/hardware admission or explicit blockers.
- desktop-smoke.json realChat: actual prompts, rendered replies, timing metadata, context
  restore/cancellation checks and unreviewed language/persona outputs.
- resource-samples.json: approximate whole-system free RAM and GPU CSV samples every
  2.5 seconds; GPU fields are name/total MiB/used MiB/free MiB/driver. These are not
  model-process-only allocations or exact peaks.
- ollama-loaded-after.json: actual loaded-model size_vram when still available.
- launch.json: independent renderer/transport/shutdown status and native logs.

Completed provider packets supply load_duration and eval_count/eval_duration when present;
the adapter converts nanoseconds to milliseconds and computes generation tokens/second.
Client first-delta timing includes IPC/backend overhead. Missing counts/durations remain
unknown; none are fabricated. Loading time is server-reported, not automatically a forced
cold-load benchmark. Compare the preflight loaded-model list with the actual run.
[Official chat response metrics](https://docs.ollama.com/api/chat),
[loaded-model memory endpoint](https://docs.ollama.com/api/ps).

## Manual quality, application restart and offline sign-off

Review the actual text for natural language, concise warmth, appropriate serious tone,
identity stability and accurate snack recall. No semantic score is assigned automatically.
The model may be too weak at 0.8B; record examples before recommending 4B, whose published
size/overhead and available RAM/VRAM must be checked separately. No latency is promised.

For the normal persistent user interface:

```powershell
$env:MIKA_PYTHON = (Resolve-Path '.venv-runtime\Scripts\python.exe').Path
npm run dev
```

Choose Chat, qwen3.5:0.8b, and the desired reply language. Ask short English, Filipino and
Taglish questions, inspect incremental responses, Stop a long reply and send a fresh turn.
Send a harmless test fact, wait for completion, Quit Mika normally, start again, inspect
the restored messages and ask about the latest fact. Do not mistake benchmark-isolated
history for this normal user-data directory. The automated test proves backend restart
and Vue remount only; it does not claim a whole Electron application restart.

After all files are prepared, disable external networking in a controlled ordinary-session
test while retaining loopback, then repeat real conversation/restart checks. The command
does not install firewall rules or claim network isolation from a checkbox. Ollama updates
are separate from its no-cloud inference setting. Record the actual isolation method and
observed traffic before declaring genuine offline verification PASS.

Current real backend output/timing and backend-restart persistence are verified in the
focused repair report. Natural language/persona quality is not accepted; native Vue-model,
whole-app restart and external-network-isolated acceptance remain pending.
