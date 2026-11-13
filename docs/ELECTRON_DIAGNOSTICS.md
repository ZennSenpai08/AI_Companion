# Native Electron investigation — 2026-11-13

Status: **BLOCKED in coding environment at renderer token creation**. Approved runtime-only
identity RX repair is applied and removes the original fatal. Sandbox protections retained.

Latest focused investigation: [ELECTRON_STARTUP_INVESTIGATION.md](ELECTRON_STARTUP_INVESTIGATION.md).
Actual post-repair markers show JS main, app readiness and native handle creation. The
renderer then fails sandbox 49 / Windows 87, reproduced by a nested lockdown-token audit.
Real controlled I/O confirms restricted-token read/execute and denied Write; original
parent rights are preserved. Earlier unmodified observations below are historical, not
current permission state. See the focused report for current results and normal-session test.

## Retest after user relocation

After user commit fa5871e moved the application to the workspace root, the same minimal
probe was executed again at 2026-11-13T12:58:22Z. Electron 45.3.0 still exits
2147483651 before readiness. The currently affected directory is
`C:\Users\Romcill\Desktop\AI-PROJECT\node_modules\electron\dist`.
Current complete stderr is preserved in test-artifacts/investigation/native-probe.json:

```
[522540:1113/205822.200:ERROR:components\os_crypt\sync\os_crypt_win.cc:77] Failed to encrypt: The system cannot find the file specified. (0x2)
[522540:1113/205822.336:FATAL:electron\shell\browser\win\install_dir_access.cc:52] Sandboxed processes cannot read C:\Users\Romcill\Desktop\AI-PROJECT\node_modules\electron\dist: its ACL has an entry for an AppContainer package SID but none for ALL APPLICATION PACKAGES, so Windows denies the sandbox token access. Grant it with: icacls "C:\Users\Romcill\Desktop\AI-PROJECT\node_modules\electron\dist" /grant *S-1-15-2-1:(OI)(CI)(RX)
```

The quoted grant is Electron's diagnostic text, not an authorized repair command. No ACL
changes were made. A fresh read-only icacls listing at the relocated path also shows AAP
RX on both the runtime directory and icudtl.dat, without a displayed S-1-15 package ACE.
The earlier ACL exports below describe the pre-relocation path; they must not be restored
at a different location. A normal-session comparison and effective-token analysis remain open.

## Reproduction and isolation

Exact installed manifest version: Electron 45.3.0. Runtime executable:
`C:\Users\Romcill\Desktop\AI-PROJECT\offline-ai-companion\node_modules\electron\dist\electron.exe`.
There was no independent minimal probe in the checkpoint (only the application desktop
smoke). Added scripts/native-probe: a single BrowserWindow, local HTML, no backend/Vue/
preload/dependency renderer. It keeps sandbox=true, contextIsolation=true, nodeIntegration=false.
`node scripts/run-native-probe.cjs` exits 2147483651 (0x80000003), before app readiness.
The same fatal error as the application occurs, showing this environment/runtime combination
fails independently of the companion configuration. This does not prove every Electron
version/path or an ordinary interactive Windows session fails.

Complete captured stderr (variable PID/time shown from this run):

```
[502608:1113/162049.617:ERROR:components\os_crypt\sync\os_crypt_win.cc:77] Failed to encrypt: The system cannot find the file specified. (0x2)
[502608:1113/162050.172:FATAL:electron\shell\browser\win\install_dir_access.cc:52] Sandboxed processes cannot read C:\Users\Romcill\Desktop\AI-PROJECT\offline-ai-companion\node_modules\electron\dist: its ACL has an entry for an AppContainer package SID but none for ALL APPLICATION PACKAGES, so Windows denies the sandbox token access. Grant it with: icacls "C:\Users\Romcill\Desktop\AI-PROJECT\offline-ai-companion\node_modules\electron\dist" /grant *S-1-15-2-1:(OI)(CI)(RX)
```

Raw executable/version/status/stdout/stderr are in test-artifacts/investigation/native-probe.json.

## Process security and ACL evidence

Read-only whoami and Win32 token queries show CodexSandboxOffline, medium integrity,
not elevated, tokenHasRestrictions=true, tokenIsAppContainer=false, five restricting SIDs,
and membership in a Windows job. This is a restricted coding-agent process, not a normal
interactive user launch. It was not impersonated or relaunched outside the restriction.

Both the runtime directory and icudtl.dat already display ALL APPLICATION PACKAGES read/
execute grants. Their ACLs show inherited sandbox user/group entries. No literal inherited
S-1-15-2-* package SID was present in these displayed runtime DACLs. Therefore the fatal
message's specific missing-package-grant explanation is not independently established by
the ACL listing. It is evidence of an effective restricted-token read failure, not a complete
ACL diagnosis. Current official Electron source performs a kernel AccessCheck against
icudtl.dat with a derived low-integrity restricted token and emits that fixed message.
Exact v45.3.0 source retrieval failed, so that current-main mechanism is supporting evidence,
not a byte-for-byte source confirmation for the installed binary.

ACLs were exported read-only with icacls /save to runtime-directory.acl and icudtl.acl in
test-artifacts/investigation. UTF-16 output files contain the actual SDDL entries despite
icacls printing 'processed 0 files'. whoami.txt, security-context.json and textual ACL logs
are saved there. No /grant, /reset, /restore, ownership or profile/parent ACL mutation was
performed in this investigation. Earlier development's runtime read grant is pre-existing.

## Decision and normal-session comparison

A minimum effective ACL change has not been established. Do not repeat grants blindly,
remove restriction SIDs, disable the sandbox, or edit user/profile/parent permissions.
If a repair is later proposed, document/export exact existing permissions, obtain explicit
user authorization for the exact folder/change, then retest the same probe and application.

No normal interactive session comparison has been executed: the available shell is restricted
and this task does not grant a mechanism to leave that environment. An authorized user can
run `node scripts/run-native-probe.cjs` from an ordinary terminal to produce comparable
logs, then the app smoke if the probe succeeds. This makes no ACL changes and uses no
--no-sandbox flag. Native desktop success remains unverified until that result exists.

## Authoritative sources

- https://www.electronjs.org/docs/latest/tutorial/sandbox — sandbox behavior and isolation.
- https://raw.githubusercontent.com/electron/electron/main/shell/browser/win/install_dir_access.cc — current effective read check and fixed fatal message.
- https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls — display/export and change semantics.
- https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation — isolation boundaries.
- https://learn.microsoft.com/windows/win32/api/securitybaseapi/nf-securitybaseapi-istokenrestricted — restricting-SID semantics.
