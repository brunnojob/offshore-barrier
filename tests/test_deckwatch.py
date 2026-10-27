import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("deckwatch", Path(__file__).resolve().parents[1] / "hardware/deckwatch/logic.py")
logic = importlib.util.module_from_spec(spec)
spec.loader.exec_module(logic)


class DeckWatchTests(unittest.TestCase):
    def test_wet_condition_and_identity(self):
        data = logic.message(7, 1000, True)
        self.assertTrue(data["wet_simulated"])
        self.assertEqual(data["sequence"], 7)
        self.assertEqual(data["quality"], "synthetic")
        self.assertEqual(data["mode"], "bench_simulation")

    def test_released_button(self):
        self.assertFalse(logic.message(1, 100, False)["wet_simulated"])
