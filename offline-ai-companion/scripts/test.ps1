param([switch]$CoreOnly)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
& ./.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
if ($LASTEXITCODE -ne 0) { throw 'Backend tests failed.' }
& node --test tests/node/*.test.cjs
if ($LASTEXITCODE -ne 0) { throw 'Node tests failed.' }
if (-not $CoreOnly) {
  & ./.venv/Scripts/python.exe -m ruff check backend
  if ($LASTEXITCODE -ne 0) { throw 'Python lint failed or unavailable.' }
  & npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw 'Typecheck failed or unavailable.' }
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed or unavailable.' }
}
