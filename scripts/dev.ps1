param([string]$Python)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$previousPython = $env:MIKA_PYTHON
try {
  if ($Python) { $env:MIKA_PYTHON = (Resolve-Path -LiteralPath $Python).Path }
  & npm run dev
  $resultCode = $LASTEXITCODE
} finally { $env:MIKA_PYTHON = $previousPython }
exit $resultCode
