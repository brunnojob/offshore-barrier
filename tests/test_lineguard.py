import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).resolve().parents[1] / "hardware/lineguard/controller.py"
spec = importlib.util.spec_from_file_location("lineguard_controller", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class LineGuardTests(unittest.TestCase):
    def test_no_motion_never_means_safe(self):
        c = module.Controller(100)
        self.assertEqual(c.update(0, False), "warmup")
        self.assertEqual(c.update(100, False), "unverified")
        self.assertEqual(c.update(1000000, False), "unverified")

    def test_latched_until_reset(self):
        c = module.Controller(100)
        self.assertEqual(c.update(100, True), "risk")
        self.assertEqual(c.update(101, False), "risk")
        self.assertEqual(c.update(102, True, True), "risk")
        self.assertEqual(c.update(103, False, True), "unverified")

    def test_warmup_does_not_confirm_area(self):
        c = module.Controller(100)
        self.assertEqual(c.update(1, True, True), "warmup")
        self.assertEqual(c.update(100, True), "risk")

    def test_led_patterns(self):
        self.assertEqual(module.led_value("safe", 0), 0)
        for state in ("alert", "warmup", "unverified"):
            self.assertEqual(module.led_value(state, 0), 1)
            self.assertEqual(module.led_value(state, 125), 1)
        self.assertEqual(module.led_value("risk", 0), 1)
        self.assertEqual(module.led_value("risk", 125), 0)
        self.assertEqual(module.led_value("risk", 250), 1)
