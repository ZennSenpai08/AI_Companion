$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $PSScriptRoot)
& node -e "const os=require('node:os'); console.log(JSON.stringify({os:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model,ramGiB:os.totalmem()/2**30,freeRamGiB:os.freemem()/2**30},null,2))"
Get-PSDrive -PSProvider FileSystem | Select-Object Name,Free
foreach ($toolName in @('python','node','npm','git','ffmpeg','ollama','nvidia-smi')) {
  $tool = Get-Command $toolName -ErrorAction SilentlyContinue
  Write-Host "$toolName : $($tool.Source)"
}
if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) {
  & nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
}
if (Test-Path .venv/Scripts/python.exe) {
  & ./.venv/Scripts/python.exe -c "import importlib.util,sys; print(sys.version); print({n: bool(importlib.util.find_spec(n)) for n in ('fastapi','uvicorn','httpx','pydantic')})"
}
Write-Host 'Mic stays off. Doctor does not download or start inference models.'
