import copy
import unittest
from datetime import datetime, timezone

from offshore_barrier.engine import CONTROLS, evaluate

NOW = datetime(2026, 10, 27, 15, tzinfo=timezone.utc)


def fixture():
    return {"operation_id": "SIM-LIFT-001", "area": "Convés A", "activity": "lifting",
            "mode": "simulation", "checks": {
                key: {"status": "confirmed", "evidence_ref": "SIM-INSPECTION-1",
                      "procedure_ref": "SIM-PROCEDURE-1", "verified_by": "Equipe simulada",
                      "observed_at": "2026-10-27T14:00:00Z",
                      "expires_at": "2026-10-27T16:00:00Z"} for key in CONTROLS}}


class BarrierTests(unittest.TestCase):
    def test_complete_still_never_authorizes(self):
        result = evaluate(fixture(), NOW)
        self.assertEqual(result["result"], "READY_FOR_HUMAN_REVIEW")
        self.assertFalse(result["work_authorized"])

    def test_each_missing_barrier_blocks_completeness(self):
        for key in CONTROLS:
            with self.subTest(key=key):
                data = fixture()
                del data["checks"][key]
                self.assertEqual(evaluate(data, NOW)["result"], "INCOMPLETE_EVIDENCE")

    def test_failure_not_averaged_away(self):
        data = fixture()
        data["checks"]["exclusion_zone"]["status"] = "failed"
        self.assertEqual(evaluate(data, NOW)["result"], "BARRIER_FAILURE_RECORDED")

    def test_expiry_boundary(self):
        data = fixture()
        data["checks"]["environment"]["expires_at"] = NOW.isoformat()
        self.assertEqual(evaluate(data, NOW)["result"], "INCOMPLETE_EVIDENCE")

    def test_invalid_evidence_never_counts_as_recorded(self):
        for field, value in [("observed_at", "2030-01-01T00:00:00Z"),
                             ("observed_at", "2026-10-27T14:00:00"),
                             ("expires_at", "invalid"), ("expires_at", None),
                             ("evidence_ref", ""), ("verified_by", None),
                             ("procedure_ref", "")]:
            with self.subTest(field=field, value=value):
                data = fixture()
                data["checks"]["equipment"][field] = value
                self.assertEqual(evaluate(data, NOW)["result"], "INCOMPLETE_EVIDENCE")

    def test_unknown_status_rejected(self):
        data = fixture()
        data["checks"]["capacity"]["status"] = True
        with self.assertRaises(ValueError):
            evaluate(data, NOW)

    def test_invalid_structure_rejected(self):
        for value in (None, [], {"operation_id": 3}, {**fixture(), "checks": []},
                      {**fixture(), "mode": "live"}, {**fixture(), "activity": "h2s"}):
            with self.subTest(value=value), self.assertRaises(ValueError):
                evaluate(value, NOW)

    def test_unknown_control_rejected(self):
        data = fixture()
        data["checks"]["typo"] = {}
        with self.assertRaises(ValueError):
            evaluate(data, NOW)

    def test_timezone_equivalence(self):
        data = fixture()
        data["checks"]["equipment"]["observed_at"] = "2026-10-27T11:00:00-03:00"
        self.assertEqual(evaluate(data, NOW)["result"], "READY_FOR_HUMAN_REVIEW")

    def test_unknown_and_empty(self):
        data = fixture()
        data["checks"] = {}
        self.assertEqual(evaluate(data, NOW)["result"], "INCOMPLETE_EVIDENCE")
        data = fixture()
        data["checks"]["environment"]["status"] = "unknown"
        self.assertEqual(evaluate(data, NOW)["result"], "INCOMPLETE_EVIDENCE")

    def test_does_not_mutate_input(self):
        data = fixture()
        original = copy.deepcopy(data)
        evaluate(data, NOW)
        self.assertEqual(data, original)


if __name__ == "__main__":
    unittest.main()
