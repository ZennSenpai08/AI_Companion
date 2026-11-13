"""Supervised parent-pipe watchdog, independent of any web framework."""
import os
import sys
import threading


def start_parent_watch(shutdown, source=None, force_exit_after=6):
    source = source if source is not None else sys.stdin.buffer

    def watch():
        # Any command or EOF closes this one-parent service. No command execution.
        try:
            source.readline(1024)
        except (OSError, ValueError):
            pass
        # Start the independent timer before invoking shutdown: a blocked callback
        # cannot prevent this parent-owned service from terminating.
        deadline = threading.Timer(force_exit_after, lambda: os._exit(0))
        deadline.daemon = True
        deadline.start()
        shutdown()

    thread = threading.Thread(target=watch, daemon=True)
    thread.start()
    return thread
