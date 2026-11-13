# Project identity audit — 2026-11-13

## Observed repository relationship

- Parent remote: https://github.com/ZennSenpai08/AI_Companion.git (fetch/push).
- Local main and cached origin/main: 18bc3d3, Add offline AI companion project.
- Parent history: 3922029 (first commit), then 18bc3d3. Root README is empty in both
  the inspected local tree and readable public raw response.
- Public GitHub main listing returned offline-ai-companion/, .gitignore, AGENTS.md, README.md
  and two commits. Public branch API and individual package/architecture pages could not
  be fetched; the full live remote branch set is therefore not established.
- The sole local application manifest is offline-ai-companion/package.json. It depends
  on Vue 3.5.45 and declares Electron; frontend source is Vue SFC + TypeScript.
  There is no React manifest/source or Zyrah profile in the inspected local project.
- offline-ai-companion-git-backup contains the earlier ccab90d original Mika repository.
  It has no configured remote. It is preserved metadata, not a second React implementation.
- Verified bundle checkpoint 73d28fe descends from 18bc3d3 and adds the subsequent Mika
  backend work. It is a local continuation of this history, not evidence of publication.

## Conclusion and limits

The observable code is one active Mika/Vue implementation inside the named GitHub
repository, plus preserved earlier Git metadata. There is no evidence of a React-to-Vue
migration, two functional frontend branches, or an accidentally duplicated React project.
The reported published Zyrah/React architecture could not be reproduced from available
local/public content. It remains an unresolved description discrepancy, not grounds for a
rewrite. Continue the existing Vue implementation and preserve all other files/refs.
No merge, migration, branch checkout, reset or external publication was performed.

Sources inspected: https://github.com/ZennSenpai08/AI_Companion and its raw main README;
local package.json, directory tree, git remotes/branches/log/tree, and preserved Git backup.
