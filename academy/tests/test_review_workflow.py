import unittest
from academy.review_workflow import review_submission

class ReviewWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.submission = {"case_id": "VAT-001", "agent_id": "TAX-03"}
    def test_revision_decision(self):
        result = review_submission(self.submission, {
            "reviewer_id": "human-reviewer-1", "decision": "return_for_revision",
            "notes": "Invoice evidence incomplete."
        })
        self.assertFalse(result["production_authorized"])
        self.assertFalse(result["professional_certification"])
    def test_cannot_self_review(self):
        with self.assertRaises(ValueError):
            review_submission(self.submission, {
                "reviewer_id": "TAX-03", "decision": "reject", "notes": "Incorrect."
            })
    def test_training_approval_requires_documented_sources(self):
        with self.assertRaises(ValueError):
            review_submission(self.submission, {
                "reviewer_id": "human-reviewer-1", "decision": "approve_for_internal_training",
                "notes": "Looks fine."
            })
    def test_training_approval_is_not_production_approval(self):
        result = review_submission(self.submission, {
            "reviewer_id": "human-reviewer-1", "decision": "approve_for_internal_training",
            "notes": "Synthetic reconciliation independently checked.",
            "source_checks": [{"url": "https://example.org/synthetic-case", "effective_date": "2026-01-01",
                "verification_note": "Synthetic training scenario, not legal authority."}]
        })
        self.assertFalse(result["production_authorized"])
        self.assertEqual(result["decision"], "approve_for_internal_training")

if __name__ == "__main__":
    unittest.main()
