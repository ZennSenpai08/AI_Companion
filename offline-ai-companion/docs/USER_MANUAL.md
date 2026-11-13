# User manual — source preview

This is a development preview. Native desktop launch is not verified in the current
managed environment. Follow README setup only on a suitable Windows development session.

The intended startup opens a floating diagnostic window and settings panel. Until Live2D
is provisioned the window explicitly says setup pending. Drag its top strip; resize its
edges. Tray menu restores the companion, toggles topmost/click-through and quits. Ctrl+
Shift+M restores position and mouse interaction if the shortcut is available. Close the
panel to hide it; Quit in tray/panel stops the backend and exits.

Settings show backend health and sanitized startup errors. Retry stops/restarts the Python
child. Diagnostics show unavailable engines. Mic stays off and all capture is denied.
There is no voice conversation yet.

In the Vue Chat panel choose a supported local model and language, then Send locally.
Ollama and its weights must already exist. Stop reply cancels the request. Text is stored
locally in readable SQLite. Delete conversation history asks for confirmation.

Memory panel: add a fact with Approve and remember, edit with Save correction, delete with
confirmation, or export through a native JSON save dialog. This personalizes retrieved
context without retraining. No assistant output is automatically promoted to a fact.
These UI paths are connected in source but await actual Vue/native runtime validation.

Data location: Electron per-user userData; `assistant.sqlite` for chat/facts, `desktop.json`
for window geometry. Data is not encrypted. No microphone recordings are created. Do not
share the SQLite database or exported memories unintentionally.

No installer is available. See KNOWN_ISSUES.md for the current development blockers.
