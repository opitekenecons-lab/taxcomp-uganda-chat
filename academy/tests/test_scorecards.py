import unittest
from academy.scorecards import build_scorecards

class ScorecardTests(unittest.TestCase):
    def test_score_and_no_credential(self):
        report = build_scorecards([
            {"agent_id":"TAX-02","case_id":"A","passed":True},
            {"agent_id":"TAX-02","case_id":"B","passed":False},
            {"agent_id":"TAX-03","case_id":"C","passed":True},
        ], {"A"})
        self.assertEqual(report["agents_assessed"], 2)
        first = report["scorecards"][0]
        self.assertEqual(first["pass_rate_percent"], 50.0)
        self.assertEqual(first["independently_reviewed_cases"], 1)
        self.assertFalse(first["production_authorized"])
        self.assertIsNone(first["professional_credential"])
    def test_empty_results_do_not_claim_success(self):
        report = build_scorecards([])
        self.assertEqual(report["agents_assessed"], 0)
        self.assertEqual(report["qualification_status"], "not_certified")
    def test_duplicate_results_rejected(self):
        with self.assertRaises(ValueError):
            build_scorecards([
                {"agent_id":"TAX-02","case_id":"A","passed":True},
                {"agent_id":"TAX-02","case_id":"A","passed":True}
            ])
    def test_invalid_results_rejected(self):
        with self.assertRaises(ValueError):
            build_scorecards([{"passed":True}])

if __name__ == "__main__":
    unittest.main()
