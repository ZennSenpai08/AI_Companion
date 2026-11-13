# Electron native startup investigation — 2026-11-13–14

Current status (2026-11-14): normal-session startup/renderer/visible window are verified;
shutdown and Mika's actual Vue application are separate gates. ACL repair remains closed.

| Gate | Current evidence/status |
|---|---|
| Normal-session Electron startup | PASS |
| Sandboxed renderer initialization | PASS: sandbox/context isolation true, no Node exposure |
| Visible native diagnostic | PASS: visible:true in real log; user reports test content appeared |
| Graceful shutdown | INCONCLUSIVE: launcher interruption/SIGTERM, not a normal-close test |
| Vue production build | BLOCKED pending dependency installation |
| Actual Mika application launch | NOT YET VERIFIED with the built Vue interface |
| Restricted-agent renderer | Separate context limitation; not a general startup failure |

## Current task: preserve startup success and unblock the Vue build

Inspected visible-2026-11-13T21-27-41-283Z-36de18b7/visible-native-probe.json. It records the
Romcill account, Electron 45.3.0, app-ready, renderer-ready with secure flags, correct test
content and visible:true. The user explicitly confirms the appearance in this task.
The original JSON's aggregate FAILED is preserved as historical evidence, not treated as
a startup failure. Its interrupted:true/SIGTERM came through the launcher's stop path
which kills the child; why the parent received that signal is not established. No normal
window-closed/quit sequence is present, so graceful shutdown remains INCONCLUSIVE.

Separated startup, visibility and shutdown assessment in scripts/native-probe-results.cjs.
Future interrupted runs report STARTUP_PASSED_SHUTDOWN_INCONCLUSIVE when startup evidence
is positive. An interrupted wrapper uses exit 130, not a fabricated graceful-success code.
The old report remains immutable; visible-startup-independent-assessment.json records
the corrected interpretation. No startup/security flags or ACLs were changed.

Dependency inspection: intended manager is npm, observed 11.10.0 on Node 22.18.0. No lockfile
exists. vue-tsc is pinned at 3.0.6 but absent from node_modules; Vue/Vite/plugin-vue are
also absent. The exact pins are retained. Cache write and DNS tests PASS; outbound registry
TCP fails Windows 10013, and lockfile-only npm preparation fails FetchError/EACCES without
creating a lock. This is a network restriction in this context, not a cache ACL diagnosis.
Full commands and output: dependency-install-diagnosis.json.

Exact ordinary-PowerShell preparation/build/dev commands are in FRONTEND_BUILD.md. Once
packages and the real lockfile are available, run full Vue checks/build, then the actual
Mika entry. No substitute renderer or dependency upgrade was introduced.

Prepared actual-app acceptance: desktop-smoke now refuses to launch without both built
Vue pages and requires real Vue mounts, visible secure windows, preload/IPC, backend health
and backend cleanup after normal app exit. It cannot pass on the recovery UI. Added only
readonly sandbox facts to the existing preload, with no commands or credentials exposed.
The first type check rejected an unavailable getLastWebPreferences API; the implementation
was corrected to supported preload facts plus Electron's process metrics and checks pass.

Also corrected a source startup-order race: Vue mounts immediately request settings, so
the local backend handshake now finishes before either Vue page loads. Startup failure
still leaves the existing retry UI available. No renderer security configuration change.
Actual native/UI confirmation of this integration fix awaits the Vue build; it is not
reported as an executed native milestone.

Verification: 40 Node tests passed, zero failures/skips; strict Electron and renderer-core
types and JS lint passed. New report-validation tests use clearly labeled evidence
fixtures, and the old backend lifecycle tests use actual local processes. These results
are not real-model or Vue/native acceptance. See mika-integration-preparation-checks.json.
Checkpoint d87e4d preserved work before the actual-app acceptance changes; older checkpoints
and test artifacts remain intact. No ACL or system security change was made in this task.

## Normal-session evidence and visibility follow-up

Inspected the user's actual saved result at
test-artifacts/electron-startup/2026-11-13T21-00-35-359Z-df405db0/native-probe.json.
Electron 45.3.0 reaches app-ready, creates a native handle, initializes a renderer with
sandboxed=true/contextIsolated=true/nodeExposed=false, captures nonempty content, has empty
stderr, exits 0 and leaves no sampled child processes. These runtime/render/security
subgates are PASS. The original aggregate status remains unmodified as BLOCKED because
its separate visibility criterion reported false. normal-session-runtime-assessment.json
records this explicit subgate assessment without rewriting the original evidence.

The original automated probe creates its window with show:false, then calls show() after
renderer verification and closes approximately two seconds later. It is not a manual
appearance test. Its Node launcher also sets windowsHide:true. Host Node uses libuv 1.51.0,
whose Windows launcher sets STARTF_USESHOWWINDOW and SW_HIDE for that option. Windows
documents that the first ShowWindow call can follow the startup show state instead of
the requested argument. This is a source-supported explanation for visible:false;
confirmation is delegated to the separate interactive test, not forced into the old test.

All four original automated-probe files remain identical to checkpoint 7b493f9; see
original-probe-preservation.json. No change to their timing, show policy, recorded false
value or aggregate result was made in this task.

Created scripts/run-visible-native-probe.cjs and scripts/visible-native-probe/. It uses
the same installed runtime with windowsHide:false, show() on ready-to-show, a fixed local
HTML/CSS page and the exact title/text requested. Sandbox is globally enabled; window
preferences keep sandbox/contextIsolation true and nodeIntegration false. A read-only
preload bridge reports actual renderer security. Only the two local resources are allowed;
permissions, downloads, navigation and new windows are denied. No token/desktop changes.

The new test has NO automatic close timer. It logs visibility, renderer initialization,
security, manual-window-close lifecycle, runtime version and process exit. Own-window
capture does not close it. Each run creates visible-*/ with stage JSONL, stdout/stderr,
Chromium logs, optional content capture and visible-native-probe.json. Automated status
is separate from userAppearanceConfirmation=PENDING; appearance is never claimed by the
agent without the user's observation.

Run in ordinary Windows PowerShell:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
node scripts/run-visible-native-probe.cjs
```

Check the title "Mika — Electron Native Test" and heading "Electron is running successfully",
then close the window manually. This test is ready and type/lint checked; user appearance
confirmation has been requested and is pending. It was not represented as visually observed
from the restricted coding environment.

## Actual Mika preparation and remaining build blocker

Inspected the existing electron/main.cjs, preload bridge, Vue entry points and dev command.
The product remains Electron + Vue + Python. Found the same GUI-hiding launch option in
scripts/dev.cjs and changed ONLY its Electron child's windowsHide to false. Vite/backend
workers retain hidden console behavior. This is a product launcher visibility fix; actual
Mika appearance remains unverified. The old automated probe was not changed.

No root package-lock.json exists, and Vue/Vite/vue-tsc/plugin-vue are not installed here.
Exact dependency pins remain unchanged. A pinned Vue metadata request was executed and
denied by the OS with EACCES; source/version/lockfile was not replaced. Actual npm run
build was executed and failed at missing vue-tsc before Vue compilation. No production
renderer/build success is claimed. Exact outputs: vue-registry-availability.json and
vue-build-attempt.json. No administrator or profile permission repair is requested.

Once visible verification and dependency preparation are available, the intended command
is npm run dev with MIKA_PYTHON explicitly selecting the tested .venv-runtime interpreter.
The current source supports that override. Full Vue/preload IPC/window/backend/native
shutdown acceptance is still open; a recovery panel is not claimed as the Vue interface.

Verification this task: strict Electron TypeScript, relevant ESLint, 3 desktop security
tests and visible-launcher --help all exit 0. See visible-probe-verification.json. Help/static
checks are not counted as a real visible-window run. No ML/speech/avatar/installer claim.

Primary visibility sources:
- https://raw.githubusercontent.com/libuv/libuv/v1.51.0/src/win/process.c
- https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindow

## Earlier restricted-agent investigation (historical context)

Continuation on 2026-11-14 rechecked the live identity/restricting SID list and reproduced
the same lockdown creation failure (token-audit-53a2295e.json). No new normal-session probe
artifacts exist. No repeat ACL grant or additional permission change was performed.
All six targeted verification commands now pass: strict Electron types, relevant ESLint,
3 desktop security tests, 2 real backend lifecycle tests, diagnostic Python style and
import checks. A 101-character line was repaired; initial failure and final passing output
are both recorded in approved-repair-verification.json. Backend lifecycle success is
independent of native rendering and does not close the UI/backend integration gate.

## Executed repair and actual acceptance results

The user explicitly accepted preserving parent inherited rights and requiring write denial
for Electron's derived restricted token. Before mutation, the exact documented command,
runtime path and live CodexSandboxOffline SID were reverified. All 76 original backup
entries parsed and matched the live ACLs; original backup SHA-256 remains unchanged.

Executed exactly the documented RX command at 2026-11-13T13:51Z. Exit 0. Fresh additional
pre-change backup: test-artifacts/electron-startup/acl-backup-0d102043/runtime-before.acl;
adjacent plan.json records applied=true and exact output. Original e2673772 backup retained.
approved-repair-execution.json contains pre-change descriptors, invocation/output and the
immediately following native-probe command/result.

Compared all 76 original entries: each gained only one intended allow ACE for SID ending
1008, mask 0x1200A9 (RX), with the expected inheritance flags. No ACE removed; owners/groups
unchanged. No Write/Modify/Full Control added. Readable parent descriptors are unchanged;
profile-root descriptor query remains denied and was not bypassed. No parent ACL mutation
was attempted. Exact comparison: approved-repair-acl-comparison.json. Original Git index
SHA-256 and both original/fresh rollback backups are preserved. Rollback was not triggered
because no unintended permission changes occurred; the approved repair removes the
original resource-read failure, while a separate token-creation blocker remains.

Controlled real I/O: `./.venv-runtime/Scripts/python.exe -m scripts.check_electron_runtime_access`
temporarily applies a further-restricted LOW token to the thread of a separate helper,
then immediately reverts. Active thread SID/restricting list and LOW integrity were queried.
Actual CreateFile/ReadFile opened electron.exe with READ+EXECUTE access and read icudtl.dat;
a nonce-named CREATE_NEW write attempt in dist returned ACCESS_DENIED (5), with no file
created. Parent effective Write remained allowed before/after, as authorized. No primary
process token, ACL or application sandbox policy changed. Results: controlled-runtime-access.json
and controlled-runtime-access-*.json. This tests actual I/O, not only memory ACL simulation;
it does not claim a running Chromium renderer.

Immediate secure native probe at 13:51:40Z progressed through main-entered, app-ready and
window-created (nonempty native handle). The original install_dir_access fatal disappeared.
It then emitted renderer launch-failed exitCode=49, GPU exitCode=-1073741515 (0xC0000135),
and ERR_FAILED loading the local probe HTML. Exit 1; no renderer-ready, visible window,
content capture or normal-successful-close acceptance. Exact logs/stages/process tree:
test-artifacts/electron-startup/2026-11-13T13-51-40-395Z-ea693666/.

Actual Mika app was launched with the existing Python runtime at 13:56:41Z. It likewise
failed renderer launch and exited 1 before native UI/backend integration acceptance.
Full invocation/stdout/stderr: mika-2026-11-13T13-56-41-352Z-380a4dff/launch.json. No Vue,
preload or integrated backend success is inferred. A separate native probe with documented
disableHardwareAcceleration() (sandbox still globally enabled) at 14:00:56Z failed with
the same renderer 49 and GPU status: 2026-11-13T14-00-56-047Z-cd0dbc04/. The software flag
is diagnostic only and does not alter Mika's production configuration.

## New blocker: nested restricted-token creation

The Chromium log's Process.Sandbox.Launch.Error histogram records Windows error 87.
Chromium defines sandbox result 49 as SBOX_ERROR_CANNOT_CREATE_RESTRICTED_TOKEN.
scripts/electron_token_audit.py reproduces this using disposable memory tokens only:
same-access construction succeeds; Chromium-style lockdown construction with NULL SID
fails with Windows 87. Restricting to existing Everyone succeeds; requesting NULL plus
Everyone yields only Everyone. The parent token is already restricted, and Windows
intersects the requested restricting SIDs with the existing list. Its list lacks NULL,
so the requested lockdown restriction has an empty intersection. No created audit token
is used to launch a process or weaken sandbox policy. Raw evidence:
token-audit-a7c857fa.json, nested-lockdown-token.json, restricting-sid-intersection.json.

The GPU status maps to STATUS_DLL_NOT_FOUND; the precise unavailable dependency has not
been identified. Inventory/size comparison with cached Electron 45.3.0 distribution finds
all 73 archive files present with matching sizes, so no missing distribution file has
been established. This is not a cryptographic provenance check. See runtime-inventory.json.
Do not guess a DLL, copy Windows system files, broaden ACLs, or remove renderer protection.

A normal interactive user-session test was requested because this execution context is
already restricted and runs on a private CodexSandboxDesktop. No token escape, task-based
relaunch or sandbox-disabling option was attempted. Run from ordinary Windows PowerShell:

```powershell
Set-Location 'C:\Users\Romcill\Desktop\AI-PROJECT'
node scripts/run-native-probe.cjs
# Only if the probe passes:
$env:MIKA_PYTHON = (Resolve-Path '.venv-runtime\Scripts\python.exe').Path
node scripts/desktop-smoke.cjs
```

This requires no administrator rights or further ACL change. Per-run JSON/logs/screenshots
are saved automatically. A successful probe alone does not establish Mika/Vue acceptance;
an unbuilt renderer may use the explicitly labeled recovery UI. All native UI/preload/
Vue and normal-exit acceptance stays open until the actual results demonstrate success.
The user's resume-after-native-success condition has not been met in this environment;
no AI/speech/Live2D/installer work was begun during the repair.

## Earlier conditional-authorization preflight (superseded by accepted clarification)

The user authorized the exact runtime RX grant with conditions, including confirming the
sandbox identity cannot write. Before executing, the documented command was compared
against the saved plan: exact folder, current SID ending 1008 and (OI)(CI)(RX) match.
The existing UTF-16LE backup was parsed into 76 path/SDDL entries. Every entry stays inside
dist, parses as a valid descriptor and matches its current DACL. Original backup retained.

The effective-write preflight exposed a previously unreported distinction: the CURRENT
PARENT CodexSandboxOffline token already has FILE_GENERIC_WRITE on dist and icudtl.dat,
through inherited CodexSandboxUsers/workspace Modify ACEs. This was true BEFORE any
repair; no ACL has been changed. The previous denied-write result applied to the newly
derived LOW/restricted Electron token, not the parent account's effective access.

Thus the exact RX addition introduces no Write/Modify grant, but cannot establish a
non-writable parent account without additional permission changes beyond the authorized
scope. Clarification of condition 9 was requested: preserve inherited parent rights and
verify derived-token write denial, or stop. No grant will be executed while this material
condition is unresolved. No native-launch success is claimed.

Evidence: test-artifacts/electron-startup/authorized-repair-preflight.json, including kernel
read/write outcomes and backup validation. authorized-repair-boundaries-before.json stores
readable parent ACL fingerprints, unavailable-query errors, and original backup/Git-index
hashes for later comparison. The profile-root ACL query was denied; no bypass attempted.
No parent directory, source architecture, sandbox or unrelated component was changed.

Scope: native Windows startup only. Existing uncommitted source, fa5871e, checkpoint
1ed5421 and parent Git metadata are preserved. No Vue migration or unrelated work.

## Established failure and environment

Electron 45.3.0: node_modules/electron/dist/electron.exe (manifest, dist/version and
Windows executable ProductVersion agree). Entry: electron/main.cjs. Node: 22.18.0.
Workspace: C:\Users\Romcill\Desktop\AI-PROJECT. Registry build: 26200.9711, 25H2;
ProductName says Windows 10 Home Single Language, so product naming is unresolved.
Identity: LAPTOP-ECS2JIJ0\CodexSandboxOffline, SID
S-1-5-21-3413938180-3376956884-2146307852-1008. Restricted, non-elevated medium token,
not an AppContainer; in a Windows job. No ordinary-interactive comparison performed.

Existing raw native-probe.json was inspected before new experiments. Its executable
exits 2147483651 (0x80000003) at install_dir_access.cc:52. Its complete stderr is preserved
in docs/ELECTRON_DIAGNOSTICS.md and test-artifacts/investigation/native-probe.json.
Native app readiness/window/renderer were not established by that earlier probe.
It used a hidden window and did not emit a main-entry marker, so it cannot demonstrate
visible-window acceptance or precisely distinguish entry from readiness. Enhanced logging
and stage markers are being added for that reason; no previous success is inferred.

## Reproduced effective-access cause

Enhanced logging run 2026-11-13T13:28:32Z emitted main-entered before failing with the
same exit code/fatal message; app-ready was never emitted. Thus JavaScript main DOES run;
the failure is before app readiness, correcting earlier "before application code" wording.
Executable reports Electron 45.3.0, Chromium 156.0.8078.96 and embedded Node 24.22.2.
Host Node is 22.18.0. Exact argv, working directory, stdout, stderr, PID, stages and
documented --enable-logging=file/--log-file/--v=1 logs are preserved in
test-artifacts/electron-startup/2026-11-13T13-28-32-084Z-750cb2f0/. No rendered window
or GPU/renderer readiness was reached in this run; process sampling is being added.

Read-only icacls inspections of dist, electron.exe, icudtl.dat and resources show inherited
or explicit ALL APPLICATION PACKAGES RX. None of these displayed DACLs has a distinct
S-1-15-2-* package ACE beyond that well-known group. The reported stray-AppContainer/missing
package-group pattern is therefore not established here. Both relevant issue reports
are informative comparisons, not proof of the cause on this machine.

scripts/electron_acl_audit.py reproduces Chromium USER_RESTRICTED_SAME_ACCESS construction
on a disposable token copy, lowers that copy to LOW integrity, and uses it only for kernel
AccessCheck. It never impersonates, launches with the token, changes the current token,
or writes a filesystem ACL. Proposed ACEs exist only in copied memory descriptors.

Actual icudtl.dat audit: ordinary current-token access and a four-byte read succeed.
The derived token fails FILE_GENERIC_READ. Its restricting list contains only the offline
user SID, Everyone, and the current logon SID; the workspace restricting SID used by the
parent is lost when restricting an already-restricted token with Chromium's group list.
The DACL grants CodexSandboxUsers and workspace SIDs access, plus an online sandbox user
ending 1004, but no matching read ACE for the offline identity ending 1008, Everyone or
the logon SID. The restricted pass consequently has no matching read allow.

| In-memory descriptor tested against derived token | Actual AccessCheck |
|---|---|
| Existing ACL | DENIED |
| Additional ALL APPLICATION PACKAGES read | DENIED |
| Additional ALL RESTRICTED APPLICATION PACKAGES read | DENIED |
| Additional current offline identity read/execute | ALLOWED |

Raw result: test-artifacts/electron-startup/acl-audit-f79d76a7.json, including actual SDDL,
ACE masks, original/derived restricting SIDs and kernel outcomes. This establishes a
nested-restricted-token read failure, rather than a missing package ACE. Exact v45.3.0
tag retrieval failed; official 45-x-y and current Chromium source support the construction.
The copy omits default-DACL setup irrelevant to reading the existing resource.

Follow-up audit acl-audit-6a938490.json also checks write access: the simulated identity
RX grant allows resource reads but FILE_GENERIC_WRITE remains DENIED for the derived token.
No filesystem changes are involved in either audit.

Process sampling from the enhanced 13:30:32Z launch observed only the browser electron.exe
(PID 529920), no descendants, and no remaining observed processes after exit. Eight
snapshots were taken; very short-lived children can be missed, so no stronger absence
claim is made. All logs/stages/process data are in that run's unique artifact directory.

Window-station inspection: WinSta0 / CodexSandboxDesktop-4d0471672c86d032e75dd5cc04a7f224.
This is a private agent desktop, not the normal interactive Default desktop. No desktop
switch, process escape or relaunch outside the restriction was attempted. A future visible
native window here would establish native rendering in this isolated context, not normal
user-desktop visibility. window-station.json preserves the exact query outcome.

Fresh actual clone from bundle 1ed5421 recovered that exact commit and a clean Git tree.
Main/preload/package/frontend source checked against it is unchanged. Current protected
Git index SHA-256 equals the checkpoint manifest's original index SHA-256. Recovery
command/output: test-artifacts/electron-startup/checkpoint-recovery.json.

## Original approved command (now applied as recorded above)

Target only: C:\Users\Romcill\Desktop\AI-PROJECT\node_modules\electron\dist.
Add an inheritable RX ACE for the current offline user SID, retaining all existing ACEs,
owner and inheritance. No write grant, parent/.git/profile ACL change, package-wide grant,
privilege change or sandbox-disabling flag. Proposed exact command:

```powershell
icacls "C:\Users\Romcill\Desktop\AI-PROJECT\node_modules\electron\dist" /grant "*S-1-5-21-3413938180-3376956884-2146307852-1008:(OI)(CI)(RX)"
```

Existing permissions for all 76 runtime entries exported successfully (zero failures):
test-artifacts/electron-startup/acl-backup-e2673772/runtime-before.acl. Adjacent plan.json
contains exact command/output and applied=false. scripts/electron_runtime_acl.py defaults
to export/preview; --apply requires the exact reviewed --expected-sid and prior explicit
user authorization. It refuses redirected paths and never runs automatically at startup.

User authorization is required by the existing instruction to approve a narrowly scoped
ACL repair before application. An in-memory successful check is not a successful native
launch. After authorization, retest the same access audit and secure visible native probe,
then the existing Mika desktop smoke. Keep complete logs, process outcomes and rendered
content evidence. No native-success claim until a real window displays and closes cleanly.

## Primary references inspected

- https://github.com/openai/codex/issues/53272 — reported inherited AppContainer pattern.
- https://github.com/openai/codex/issues/27236 — reported GPU crash-loop comparison.
- https://releases.electronjs.org/pr/54382 — preflight reports denied resource access.
- https://raw.githubusercontent.com/electron/electron/45-x-y/shell/browser/win/install_dir_access.cc
- https://raw.githubusercontent.com/chromium/chromium/main/sandbox/win/src/restricted_token_utils.cc
- https://raw.githubusercontent.com/chromium/chromium/main/sandbox/win/src/restricted_token.cc
- https://www.electronjs.org/docs/latest/api/command-line-switches — documented logging.
- https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-createrestrictedtoken — nested restricting-SID intersection.
- https://raw.githubusercontent.com/chromium/chromium/main/sandbox/win/src/sandbox_types.h — sandbox result 49.
- https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/596a1078-e883-4972-9bbc-49e60bebca55 — NTSTATUS mapping for GPU exit.
- https://www.electronjs.org/docs/latest/api/app#appdisablehardwareacceleration — software-rendering diagnostic API.
