param([switch]$CoreOnly, [string]$Python = './.venv/Scripts/python.exe')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$selectedPython = (Resolve-Path -LiteralPath $Python).Path
if ($CoreOnly) {
  & $selectedPython scripts/verify_foundation.py
  exit $LASTEXITCODE
}
& $selectedPython scripts/verify_foundation.py
if ($LASTEXITCODE -ne 0) { throw 'Foundation verification failed.' }
& $selectedPython -m ruff check backend
if ($LASTEXITCODE -ne 0) { throw 'Python lint failed or unavailable.' }
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'Vue build/typecheck failed or unavailable.' }
