"""Explicit conversation states. Audio transitions are reserved until audio is implemented."""
from enum import Enum


class State(str, Enum):
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    TRANSCRIBING = "TRANSCRIBING"
    THINKING = "THINKING"
    SPEAKING = "SPEAKING"
    INTERRUPTED = "INTERRUPTED"
    ERROR = "ERROR"


ALLOWED = {
    State.IDLE: {State.LISTENING, State.THINKING, State.ERROR},
    State.LISTENING: {State.TRANSCRIBING, State.IDLE, State.INTERRUPTED, State.ERROR},
    State.TRANSCRIBING: {State.THINKING, State.IDLE, State.INTERRUPTED, State.ERROR},
    State.THINKING: {State.SPEAKING, State.IDLE, State.INTERRUPTED, State.ERROR},
    State.SPEAKING: {State.IDLE, State.INTERRUPTED, State.ERROR},
    State.INTERRUPTED: {State.IDLE, State.LISTENING, State.THINKING, State.ERROR},
    State.ERROR: {State.IDLE, State.LISTENING, State.THINKING},
}


class StateMachine:
    def __init__(self):
        self._state = State.IDLE

    @property
    def state(self):
        return self._state

    def transition(self, target):
        target = State(target)
        if target != self._state and target not in ALLOWED[self._state]:
            raise ValueError("Invalid conversation state transition")
        self._state = target
        return target
