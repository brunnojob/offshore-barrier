import json
import shutil
import subprocess
import unittest
from datetime import datetime, timezone
from pathlib import Path

from offshore_barrier.engine import evaluate

ROOT = Path(__file__).resolve().parents[1]
NOW = datetime(2026, 10, 27, 15, tzinfo=timezone.utc)


@unittest.skipUnless(shutil.which("node"), "Node is required for browser engine parity")
class WebParity(unittest.TestCase):
    def check_payload(self, payload):
        expected = evaluate(payload, NOW)
        script = "import {evaluate} from './web/engine.mjs'; let s=''; for await (const c of process.stdin) s+=c; console.log(JSON.stringify(evaluate(JSON.parse(s),new Date('2026-10-27T15:00:00Z'))));"
        run = subprocess.run(["node", "--input-type=module", "-e", script],
                             input=json.dumps(payload), text=True, capture_output=True,
                             cwd=ROOT, check=True)
        actual = json.loads(run.stdout)
        self.assertEqual(actual["result"], expected["result"])
        self.assertFalse(actual["work_authorized"])
        self.assertEqual([r["state"] for r in actual["controls"]],
                         [r["state"] for r in expected["controls"]])

    def test_examples(self):
        for path in (ROOT / "examples").glob("*.json"):
            with self.subTest(path=path.name):
                self.check_payload(json.loads(path.read_text()))

    def test_missing_and_invalid_evidence(self):
        path = ROOT / "examples/lifting_complete.json"
        for field, value in [("observed_at", "2026-02-30T12:00:00Z"),
                             ("observed_at", "2026-10-27T14:00:00"),
                             ("observed_at", "2030-01-01T00:00:00Z"),
                             ("expires_at", NOW.isoformat()),
                             ("verified_by", "")]:
            with self.subTest(field=field, value=value):
                payload = json.loads(path.read_text())
                payload["checks"]["equipment"][field] = value
                self.check_payload(payload)
        payload = json.loads(path.read_text())
        del payload["checks"]["equipment"]
        self.check_payload(payload)
