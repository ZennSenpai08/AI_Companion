"""Supervised parent-pipe watchdog, independent of any web framework."""
import os
import sys
import threading
import time


def start_parent_watch(shutdown, source=None, force_exit_after=6):
    source = source if source is not None else sys.stdin.buffer

    def watch():
        # Any command or EOF closes this one-parent service. No command execution.
        source.readline(1024)
        shutdown()
        time.sleep(force_exit_after)
        os._exit(0)

    thread = threading.Thread(target=watch, daemon=True)
    thread.start()
    return thread
