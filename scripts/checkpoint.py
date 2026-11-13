"""Export a source checkpoint without writing the working repository's Git metadata.

Creates a fresh ignored bare clone/ref/bundle on every invocation. Never resets an existing
repository, changes ACLs, publishes, or includes ignored dependencies/model/user data.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRECTORIES = {"backend", "frontend", "electron", "scripts", "tests", "docs", "character"}
SOURCE_FILES = {
    "AGENTS.md", "README.md", "LICENSE", "THIRD_PARTY_LICENSES.md", ".gitignore", ".env.example",
    "PROJECT_REQUIREMENTS.md", "DEVELOPMENT_PROGRESS.md", "PROJECT_ARCHITECTURE.md",
    "TEST_RESULTS.md", "KNOWN_ISSUES.md", "CHANGELOG.md", "pyproject.toml", "package.json",
    "package-lock.json", "eslint.config.cjs", "vite.config.ts",
}
COMMANDS = []


def git(arguments, *, metadata=None):
    environment = dict(os.environ, GIT_OPTIONAL_LOCKS="0")
    for name in ("GIT_DIR", "GIT_COMMON_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE",
                 "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES"):
        environment.pop(name, None)
    command = ["git"]
    if metadata is not None:
        command += ["--git-dir=" + str(metadata), "--work-tree=" + str(ROOT)]
    result = subprocess.run(command + arguments, cwd=ROOT, env=environment,
                            capture_output=True, encoding="utf-8", errors="replace",
                            timeout=60, check=False)
    COMMANDS.append({"command": command + arguments, "exit_code": result.returncode,
                     "stdout": result.stdout, "stderr": result.stderr})
    if result.returncode:
        raise RuntimeError("Git failed: " + " ".join(arguments[:3]) + "\n" + result.stderr)
    return result.stdout.strip()


def allowed(name):
    return (name in SOURCE_FILES or name in SOURCE_DIRECTORIES or
            re.fullmatch(r"(?:tsconfig[\w.-]*\.json|requirements[\w.-]*\.txt)", name))


def contained(path):
    resolved = path.resolve()
    if ROOT != resolved and ROOT not in resolved.parents:
        raise RuntimeError("Checkpoint destination escapes the project: " + str(path))
    return resolved


def source_state():
    index = Path(git(["rev-parse", "--git-path", "index"]))
    if not index.is_absolute():
        index = ROOT / index
    return {"head": git(["rev-parse", "HEAD"]),
            "branch": git(["symbolic-ref", "--quiet", "--short", "HEAD"]),
            "status": git(["status", "--porcelain=v1", "--untracked-files=all"]),
            "index_sha256": hashlib.sha256(index.read_bytes()).hexdigest()}


def main():
    if Path(git(["rev-parse", "--show-toplevel"])).resolve() != ROOT:
        raise RuntimeError("Run this command from the existing companion repository")
    before = source_state()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:8]
    tools = contained(ROOT / ".tools")
    output = contained(ROOT / "test-artifacts" / "checkpoints")
    # Refuse to put private metadata/archives in paths that the project does not ignore.
    for name in (".tools/checkpoint-probe", "test-artifacts/checkpoint-probe"):
        git(["check-ignore", "--quiet", name])
    tools.mkdir(parents=True, exist_ok=True)
    output.mkdir(parents=True, exist_ok=True)
    metadata = contained(tools / ("checkpoint-" + stamp + ".git"))
    if metadata.exists():
        raise RuntimeError("Checkpoint destination already exists")
    git(["clone", "--bare", "--no-hardlinks", str(ROOT), str(metadata)])
    branch = "refs/heads/checkpoint/" + stamp
    git(["update-ref", branch, before["head"]], metadata=metadata)
    git(["symbolic-ref", "HEAD", branch], metadata=metadata)
    git(["read-tree", before["head"]], metadata=metadata)
    candidates = set(git(["ls-tree", "--name-only", before["head"]]).splitlines())
    candidates.update(path.name for path in ROOT.iterdir())
    paths = sorted(name for name in candidates if allowed(name))
    for name in paths:
        if (ROOT / name).is_symlink():
            raise RuntimeError("Source root is a symlink: " + name)
    # Include only documentation for unprovisioned licensed assets/models.
    for name in ("models/README.md", "assets/live2d/README.md", "assets/audio/README.md"):
        if (ROOT / name).is_file():
            paths.append(name)
    git(["add", "--all", "--", *paths], metadata=metadata)
    git(["diff", "--cached", "--check"], metadata=metadata)
    changed = git(["diff", "--cached", "--name-only"], metadata=metadata).splitlines()
    for name in changed:
        path = ROOT / name
        if path.is_file() and path.stat().st_size > 5 * 1024 * 1024:
            raise RuntimeError("Unexpected large source file: " + name)
    hooks = metadata / "empty-hooks"
    hooks.mkdir()
    git(["-c", "core.hooksPath=" + str(hooks), "-c", "user.name=Companion Checkpoint",
         "-c", "user.email=checkpoint@local.invalid", "commit", "--allow-empty", "-m",
         "Verified companion source checkpoint " + stamp], metadata=metadata)
    commit = git(["rev-parse", "HEAD"], metadata=metadata)
    # Fail visibly if the shared source changed during capture; retain the isolated copy.
    git(["diff", "--exit-code", "--", *paths], metadata=metadata)
    if before != source_state():
        raise RuntimeError("Working repository changed during capture; isolated copy retained")
    archive = output / ("mika-" + stamp + "-" + commit[:12] + ".bundle")
    if archive.exists():
        raise RuntimeError("Bundle already exists")
    git(["bundle", "create", str(archive), branch], metadata=metadata)
    git(["bundle", "verify", str(archive)], metadata=metadata)
    refs = git(["bundle", "list-heads", str(archive)], metadata=metadata)
    git(["fsck", "--full"], metadata=metadata)
    after = source_state()
    if before != after:
        raise RuntimeError("Working repository changed; inspect retained checkpoint")
    report = {"created_at": datetime.now(timezone.utc).isoformat(), "base": before["head"],
              "commit": commit, "refs": refs, "changed_files": changed,
              "source_repository_unchanged": before == after,
              "source": before, "bundle": str(archive.relative_to(ROOT)),
              "bundle_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
              "metadata": str(metadata.relative_to(ROOT)), "published": False,
              "commands": COMMANDS}
    archive.with_suffix(".json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in
                      ("commit", "bundle", "source_repository_unchanged", "published")}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, RuntimeError, subprocess.TimeoutExpired) as error:
        print("Checkpoint failed; existing source and archives preserved:", error, file=sys.stderr)
        sys.exit(1)
