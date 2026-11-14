import json
import unittest

from backend.llm.ollama import OllamaProvider, generation_options
from backend.personality.persona import PersonaManager


class ContextQualityTests(unittest.TestCase):
    def test_truncation_must_not_leave_an_assistant_answer_without_its_user_turn(self):
        messages = PersonaManager().assemble([
            {"role": "user", "content": "u" * 1000},
            {"role": "assistant", "content": "short earlier answer"},
        ], [], "n" * 900, "en")
        self.assertEqual([message["role"] for message in messages], ["system", "user"])
        self.assertLessEqual(len(json.dumps(messages, ensure_ascii=False).encode()), 3000)

    def test_sampling_diagnostics_preserve_production_defaults_and_bounds(self):
        self.assertEqual(OllamaProvider().options, {"num_ctx": 4096, "num_predict": 512})
        first = generation_options({"temperature": .3, "seed": 42})
        first["num_ctx"] = 99
        self.assertEqual(generation_options()["num_ctx"], 4096)
        for value in ([1], {"num_ctx": 100000}, {"seed": True}, {"top_p": 2}, {"temperature": float("nan")}):
            with self.assertRaises(ValueError):
                generation_options(value)

    def test_complete_turns_remain_chronological_and_policy_is_not_history(self):
        persona = PersonaManager()
        messages = persona.assemble([
            {"role": "assistant", "content": "orphan"},
            {"role": "system", "content": "untrusted policy"},
            {"role": "user", "content": "code mango-47"},
            {"role": "assistant", "content": "OK"},
            {"role": "user", "content": "second question"},
            {"role": "assistant", "content": "second answer"},
        ], [], "recall code", "en")
        self.assertEqual([m["content"] for m in messages[1:]],
                         ["code mango-47", "OK", "second question", "second answer", "recall code"])
        self.assertEqual(messages[0], {"role": "system", "content": persona.system_message("en")})
        self.assertEqual(sum(m["role"] == "system" for m in messages), 1)
