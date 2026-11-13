# Checkpoint and Git restriction audit — 2026-11-13

Verified original archive: test-artifacts/checkpoints/mika-backend.bundle.
`git bundle verify` succeeded and reports complete history.
`git bundle list-heads` returned:

```
73d28fe830664b6d2a1cc1aea38fd00ff0339d3a refs/heads/main
```

The archive was imported only into a newly named ignored .tools/bundle-audit-*.git bare
repository; `git fsck --full` succeeded. Its history is 73d28fe -> 18bc3d3 -> 3922029.
This import verifies the object graph without resetting or overwriting the current working
source, branch, index, old bundle or existing repository. Raw commands/exit codes are saved
in test-artifacts/investigation/checkpoint-audit.json. No GitHub push was inferred or attempted.

## Why normal Git writes are blocked

The managed policy explicitly grants read access to parent .git and restricts its writes.
Read-only icacls output also shows explicit deny-write/delete ACEs for sandbox-related SIDs.
The process is CodexSandboxOffline; its restricted SID list includes a SID affected by those
DACL entries. This is consistent with the observed inability to create .git/index.lock.
No denial was removed, no ownership taken and no protected Git write was retried here.

Maintain the existing recoverable strategy: create a newly named ignored local bare history
copy, commit only project paths on a new checkpoint ref there, and export a uniquely named
bundle into test-artifacts/checkpoints. Verify the new bundle and retain the original
73d28fe archive. Parent source changes remain reviewable; parent Git metadata stays untouched.

## Repeatable checkpoint command after relocation

Current working repository HEAD is user commit fa5871e, which flattened the application
into the workspace root. It is preserved as the new snapshot base. Use:

```powershell
./.venv-runtime/Scripts/python.exe scripts/checkpoint.py
```

The command creates a unique ignored .tools/checkpoint-*.git bare clone and checkpoint/*
ref, stages a source/documentation allowlist only in that clone, commits, and exports a
new uniquely named full-history bundle. It checks staged whitespace, verifies the bundle,
lists its refs and runs git fsck. It compares the original HEAD, branch, status and index
SHA-256 before/after; concurrent source changes cause a visible failure. The original
bundle and repositories are retained. No protected index/ref is written or pushed.
Each bundle has an adjacent JSON command/exit/output/hash manifest.

To recover, choose a NEW empty destination and inspect the manifest/ref first. For example:

```powershell
git bundle verify <absolute-path-to-new-bundle>
git bundle list-heads <absolute-path-to-new-bundle>
git clone --branch checkpoint/<stamp-from-manifest> <absolute-path-to-new-bundle> <new-directory>
```

Do not clone over the working project or Git backup. Downloaded dependencies, models and
private application data are excluded; prepare them separately. The final snapshot hash
and actual verification result are reported by the command and its adjacent manifest.

Executed command successfully created isolated commit
`5018fbc8e98b6b135fd651757c882b60813de9cf` based on fa5871e. Bundle verification,
ref listing and fsck passed; source HEAD/branch/status/index SHA-256 remained unchanged.
An actual clone from that bundle into a new ignored recovery-smoke directory checked out
the expected commit and a clean Git tree; selected source text matches and dependencies
are absent. Initial byte comparison flagged Git's configured LF-to-CRLF checkout, not a
content change. Newline-normalized text and clean-tree checks passed. Exact output and
results are in test-artifacts/checkpoints/recovery-smoke-5018fbc.json. Later documentation
edits are captured by a subsequent uniquely named bundle, whose manifest identifies it.
