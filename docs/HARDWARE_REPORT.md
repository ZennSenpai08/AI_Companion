# Hardware report — 2026-11-13

Later continuation observed free RAM varying from approximately 0.12–0.40 GiB, then
0.0877 GiB with Windows reporting 99% memory load after user relocation. These are
time-specific observations, not stable capacity. No neural model/VAD allocation was
attempted under that pressure. Ollama's loopback catalog did not respond, common install
paths were absent and no project model checkpoint exists. Do not force a model download
or claim 4B inference fits from total RAM alone. Last GPU query showed RTX 2050, 4096 MiB,
driver 595.79, about 2610 MiB free VRAM at that query; no acceleration was benchmarked.

Measured through Node OS APIs, registry, PowerShell and nvidia-smi. No estimates are
presented as measurements.

| Item | Observed |
|---|---|
| OS | x64, kernel/build 10.0.26200, registry DisplayVersion 25H2, UBR 9711 |
| OS name | Registry says Windows 10 Home Single Language; CIM denied, edition unresolved |
| CPU | AMD Ryzen 5 6600H with Radeon Graphics, 12 logical processors |
| RAM | 15.309 GiB usable; only 0.07–0.11 GiB free at inspection |
| NVIDIA GPU | GeForce RTX 2050, 4096 MiB VRAM, driver 595.79 |
| Other graphics | CPU label mentions Radeon; adapter/VRAM not independently verified |
| Disk C | 123,251,585,024 bytes free at initial inspection (114.79 GiB) |
| Python | 3.9.13 launches; launcher lists 3.13 but its executable fails |
| Node / npm | 22.18.0 / 11.10.0 |
| Git | 2.50.1.windows.1 |
| FFmpeg / Ollama / uv | Not found on PATH; common Ollama install paths absent |
| WSL | wsl.exe exists; status query denied, no usable distro verified |
| CUDA toolkit/cuDNN | Not verified; GPU driver availability alone is not proof |
| Network | External Python sockets denied (WinError 10013), npm EACCES; loopback bind succeeds |

Get-CimInstance Win32_OperatingSystem/Processor/VideoController returned Access denied.
No administrator changes or firewall modifications performed. No models downloaded.
Native Windows is the primary target; WSL is not a required dependency.

Continuation: a directly inspected standard install folder also contains working Python
3.10.11 at AppData/Local/Programs/Python/Python310/python.exe. It was absent from PATH/py
launcher output. .venv-runtime uses it successfully. Python 3.12/3.13 standard install
folders are absent. The release target is still Python 3.12, not claimed tested.
