import unittest

from backend.core.state import State, StateMachine


class StateTests(unittest.TestCase):
    def test_invalid_jump_is_rejected_without_changing_state(self):
        machine = StateMachine()
        with self.assertRaises(ValueError):
            machine.transition(State.SPEAKING)
        self.assertEqual(machine.state, State.IDLE)
        with self.assertRaises(ValueError):
            machine.transition("SHELL")

    def test_speech_path_and_interruption_recovery_have_explicit_transitions(self):
        # This checks the graph only, not implemented microphone or speech behavior.
        machine = StateMachine()
        for state in (State.LISTENING, State.TRANSCRIBING, State.THINKING,
                      State.SPEAKING, State.INTERRUPTED, State.IDLE, State.ERROR, State.THINKING):
            self.assertEqual(machine.transition(state), state)
