"""Recover explicitly requested compatible wheels from the local pip HTTP cache.

Native recovery is opt-in and restricted to this interpreter's supported tags.
Development-only helper: no network or global writes. Retains package metadata and
licenses, verifies wheel RECORD contents, and writes ignored .tools/wheels artifacts.
The resulting hashes document local artifacts, not independently verified release provenance.
"""
import argparse
import base64
import csv
import email
import hashlib
import io
import json
import os
import re
from pathlib import Path, PurePosixPath
from zipfile import BadZipFile, ZipFile

ROOT = Path(__file__).resolve().parents[1]


def normalized(name):
    return name.lower().replace("-", "_")


def validate_record(archive, prefix):
    records = csv.reader(io.StringIO(archive.read(prefix + "/RECORD").decode("utf-8")))
    for filename, digest, size in records:
        if ".." in PurePosixPath(filename).parts or PurePosixPath(filename).is_absolute():
            raise ValueError("Unsafe wheel entry")
        if digest:
            algorithm, expected = digest.split("=", 1)
            if algorithm != "sha256":
                raise ValueError("Unexpected wheel digest algorithm")
            data = archive.read(filename)
            actual = base64.urlsafe_b64encode(hashlib.sha256(data).digest()).rstrip(b"=").decode()
            if actual != expected or str(len(data)) != size:
                raise ValueError("Cached wheel RECORD verification failed")


def recover(cache, specs, allow_native=False):
    destination = ROOT / ".tools" / "wheels"
    destination.mkdir(parents=True, exist_ok=True)
    wanted = {(normalized(name), version) for name, version in specs}
    manifest = destination / "recovery-manifest.json"
    recovered = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else []
    by_filename = {item["file"]: item for item in recovered}
    for filename in cache.rglob("*"):
        if not filename.is_file():
            continue
        try:
            archive = ZipFile(filename)
        except (BadZipFile, OSError):
            continue
        with archive:
            names = archive.namelist()
            for entry in names:
                if entry.count("/") != 1 or not entry.endswith(".dist-info/METADATA"):
                    continue
                metadata = email.message_from_bytes(archive.read(entry))
                key = normalized(metadata["Name"]), metadata["Version"]
                if key not in wanted:
                    continue
                prefix = entry.rsplit("/", 1)[0]
                wheel = email.message_from_bytes(archive.read(prefix + "/WHEEL"))
                tags = wheel.get_all("Tag", [])
                if "py3-none-any" in tags:
                    tag = "py3-none-any"
                elif allow_native:
                    from pip._vendor.packaging.tags import sys_tags
                    supported = {str(value) for value in sys_tags()}
                    matches = sorted(supported.intersection(tags))
                    if not matches:
                        continue
                    tag = matches[0]
                else:
                    continue
                stem = prefix[:-10]
                if not re.fullmatch(r"[A-Za-z0-9_]+-[A-Za-z0-9_.+!]+", stem):
                    raise ValueError("Unsafe wheel artifact name")
                for member in names:
                    parsed = PurePosixPath(member)
                    if parsed.is_absolute() or ".." in parsed.parts or "\\" in member:
                        raise ValueError("Unsafe wheel member name")
                if any(info.file_size > 20 * 1024 * 1024 for info in archive.infolist()):
                    raise ValueError("Unexpectedly large wheel member")
                validate_record(archive, prefix)
                target = destination / (prefix[:-10] + "-" + tag + ".whl")
                with ZipFile(target, "w") as output:
                    for info in archive.infolist():
                        output.writestr(info, archive.read(info.filename))
                by_filename[target.name] = {
                    "name": metadata["Name"], "version": metadata["Version"],
                    "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                    "file": target.name, "source": "local pip HTTP cache",
                }
                wanted.remove(key)
                print("Recovered", target.name)
        if not wanted:
            break
    recovered = sorted(by_filename.values(), key=lambda item: item["file"])
    manifest.write_text(json.dumps(recovered, indent=2) + "\n",
                        encoding="utf-8")
    if wanted:
        raise ValueError("Unavailable cached artifacts: " + repr(sorted(wanted)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("specs", nargs="+", help="Exact package==version pairs")
    parser.add_argument("--cache", type=Path,
                        default=Path(os.environ.get("LOCALAPPDATA", ".")) / "pip/Cache/http")
    parser.add_argument("--allow-native", action="store_true",
                        help="Allow only native tags supported by this interpreter")
    args = parser.parse_args()
    specs = []
    for spec in args.specs:
        pieces = spec.split("==")
        if len(pieces) != 2 or not all(pieces):
            parser.error("Every package needs an exact == version")
        specs.append(tuple(pieces))
    recover(args.cache, specs, args.allow_native)


if __name__ == "__main__":
    main()
