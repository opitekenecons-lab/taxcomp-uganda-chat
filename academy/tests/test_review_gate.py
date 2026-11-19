import unittest
from academy.review_gate import evaluate_with_review

CASE = {"id":"R1","agent_id":"TAX-15","requires_authority":True}
ANSWER = {"agent_id":"TAX-15","authorities":[{"title":"Primary law","url":"https://example.org/act","effective_from":"2026-07-01","verified_by_human":True}]}
REVIEW = {"reviewer_id":"qualified-reviewer-1","sources":[{"url":"https://example.org/act","effective_from":"2026-07-01","verified":True,"reviewer_id":"qualified-reviewer-1","reviewed_at":"2026-11-19"}]}

class ReviewGateTests(unittest.TestCase):
    def test_agent_self_claim_not_enough(self):
        self.assertFalse(evaluate_with_review(CASE, ANSWER)["passed"])
    def test_independent_record_passes_metadata_gate(self):
        self.assertTrue(evaluate_with_review(CASE, ANSWER, REVIEW)["passed"])
    def test_wrong_effective_date_rejected(self):
        bad = dict(REVIEW)
        bad["sources"] = [dict(REVIEW["sources"][0], effective_from="2025-07-01")]
        self.assertFalse(evaluate_with_review(CASE, ANSWER, bad)["passed"])
    def test_unapproved_filing_rejected(self):
        answer = dict(ANSWER, submitted_to_ura=True)
        self.assertFalse(evaluate_with_review(CASE, answer, REVIEW)["passed"])

if __name__ == "__main__":
    unittest.main()
