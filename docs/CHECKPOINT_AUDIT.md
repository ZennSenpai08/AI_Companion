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
