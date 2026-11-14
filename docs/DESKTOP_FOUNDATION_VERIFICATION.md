# Desktop foundation verification — 2026-11-14

Automated normal-Windows foundation: PASS. Interactive dwell, mouse behavior and restart
placement: manual confirmation pending. No shutdown defect is established by a code-0
exit alone. This review adds lifecycle diagnostics, not different window/quit behavior.

## Evidence and limits

The user confirms the current secure native smoke passes. Independently inspected:
test-artifacts/electron-startup/mika-2026-11-13T23-20-15-238Z-f5bce573/launch.json,
desktop-smoke.json and desktop.json. All ten checks pass, rendererStartup=PASS,
gracefulShutdown=PASS, Electron exit 0/no signal/no timeout, backendProcessGone=true,
backendListenerClosed=true. Both windows have Vue mounts, preload bridges, native
visibility, OS sandbox evidence, context isolation and no exposed renderer Node APIs.
The persisted bounds/topmost file exists. This is saved user-session evidence, not a
fresh agent-side native success. It does not measure manual dragging or a restart restore.

Fresh agent native attempt: mika-2026-11-13T23-26-33-293Z-7b77eff0/launch.json. Runtime
resolves and main-start logs, but Chromium aborts before app-ready at its runtime ACL check,
exit 2147483651. No ACL or security changes were made. A fresh build also fails at esbuild's
denied parent-directory read. The user's successful production build remains valid.

## Why dev can exit with code 0

scripts/dev.cjs starts Vite, waits for the fixed loopback origin, then spawns the actual
Electron app with MIKA_DEV=1. No timed automatic exit exists in interactive mode. Vite's
normal behavior does not close Mika after a successful launch. The launcher stops its own
Vite child after Electron exits; that cleanup follows the Electron exit, not the reverse.
An independently failed Vite child can terminate the dev session; it is separately logged.

The main process has these relevant paths:

| Path | Behavior | Evidence needed to identify it |
|---|---|---|
| Quit Mika button or tray Quit | Abort reply, persist bounds/topmost, stop backend, destroy tray, app.quit closes both windows | quit-request with renderer-control/tray, backend-cleanup-finished, app-quit 0 |
| Single-instance lock denied | New process quits; existing Mika receives second-instance and shows/focuses Settings | single-instance-forwarded; existing-instance-activated in original process |
| MIKA_SMOKE_TEST=1 | Actual-app checks/capture complete, then explicit app.quit | main-start smoke:true, quit-request automated-smoke |
| Settings X | Close prevented, panel hidden, overlay/backend stay running | panel-close-hides and window-hidden panel; no app-quit |
| Overlay Close | Close prevented, overlay hidden, tray retained | window-hidden overlay; no app-quit |
| Startup failure | Sanitized error, backend cleanup, app.exit(1) | Nonzero exit, distinct from code 0 |
| Ctrl+C / parent termination | Launcher terminates children; backend has stdin watchdog | Interruption, not a normal UI Quit acceptance test |

Electron's [single-instance API](https://www.electronjs.org/docs/latest/api/app#apprequestsingleinstancelockadditionaldata)
explicitly tells the second process to exit. Therefore the reported bare code-0 line
cannot distinguish user Quit, existing-instance forwarding or inherited smoke mode.
The ambient agent session has no MIKA_SMOKE_TEST override, but that does not establish
the user's session environment. The user was asked which interaction preceded the exit;
its exact cause remains unconfirmed until that answer or a lifecycle trace is available.

New dev/smoke-only [mika:lifecycle] JSON console lines record launch mode, instance routing,
app ready, renderer loaded, window show/hide/close, quit source and cleanup. No conversation
text, credentials or user paths are logged by these messages. Packaged production emits
none of these messages. An inherited smoke flag is warned about, not silently removed.

## Desktop control audit

| Control | Concrete implementation | Verification level |
|---|---|---|
| Open Settings | Overlay button/tray/shortcut → narrow desktop IPC → showPanel/loadWindow/BrowserWindow.show | Vue panel creation + IPC saved PASS; reopen after manual X pending |
| Close Settings | close preventDefault → current.hide | Static wiring; manual hide/reopen pending |
| Overlay Show/Hide | desktop IPC/tray → overlay.show/hide | Static wiring; physical visibility interaction pending |
| Always on top | button/tray → setAlwaysOnTop; saved in desktop.json | Saved native IPC toggle PASS; visual overlap pending |
| Click through | button/tray → setIgnoreMouseEvents with forwarding; reset disables it | Saved IPC recovery PASS; clicking underlying windows pending |
| Drag | Overlay.vue header .drag → -webkit-app-region:drag | Static CSS region; actual mouse drag pending |
| Position/size persistence | move/resize debounce and Quit → atomic desktop.json; startup recoverBounds | Saved actual file write + unit monitor recovery PASS; restart placement pending |
| Scale | slider → bounds clamp/setBounds/persist | Static wiring; manual resize pending; slider itself initializes at 1 on reopen |
| Microphone off | No audio capture; permissions denied; health=off; MIC OFF text | API checks PASS; unmute/capture intentionally unavailable |
| Tray | native Tray + real Menu items, double-click recovery, Ctrl+Shift+M | Creation on successful native path; manual menu/icon interaction pending |
| Quit | Vue/tray → app.quit → supervised backend.stop → final app.quit | Saved automated native/backend cleanup PASS; manual button/tray confirmation pending |

Click-through and hidden state are not persisted; a fresh launch is recoverable by default.
The diagnostic overlay is frameless/transparent at Electron level but draws a translucent
panel, not an avatar. Desktop alpha compositing is not established by a panel screenshot.
Voice/animation preference sliders save values only; no active engines consume them yet.
Mic On/Off and Push to Talk tray entries are disabled, accurately labeled as setup pending.

## Ordinary-PowerShell interactive acceptance

Quit an existing Mika through its own tray/menu first if an independent dev instance is
desired. Do not kill unrelated Electron apps. Inspect/remove only a mistakenly inherited
smoke flag in this PowerShell session; this does not change user/system environment:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
Get-Item Env:MIKA_SMOKE_TEST -ErrorAction SilentlyContinue
Remove-Item Env:MIKA_SMOKE_TEST -ErrorAction SilentlyContinue
$env:MIKA_PYTHON = (Resolve-Path '.venv-runtime\Scripts\python.exe').Path
npm run dev
```

Expected main-start has dev:true/smoke:false, followed by app-ready, renderer-loaded and
window-shown for overlay/panel. Leave both open at least 60 seconds, then exercise:

1. Close Settings with X; overlay remains. Reopen from overlay and tray.
2. Hide/show the overlay from the tray. Toggle topmost and inspect overlap with another app.
3. Enable click-through; click a window underneath, recover through tray or Ctrl+Shift+M.
4. Drag the labeled header, resize/scale, choose Quit Mika. Expect cleanup and app-quit 0.
5. Restart; confirm bounds/topmost restore on the connected monitor. Verify MIC OFF.
6. Quit through the tray in a separate session and confirm both windows disappear and the
   dev command returns after backend/Vite cleanup. Do not use Ctrl+C to prove normal Quit.

Record actual outcomes rather than marking this checklist passed from source inspection.
No manual results were supplied while this report was prepared. Automated foundation
acceptance passes; final interactive sign-off and the exact reported dev exit cause remain
open. Next authorized milestone is that sign-off, then separately scoped real Ollama tests.
