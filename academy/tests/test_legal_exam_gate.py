import unittest
from academy.legal_exam_gate import assess_readiness

BLUEPRINT = {"id": "VAT-ADV-001", "agent_id": "TAX-03",
             "reference_answer_status": "REQUIRES_QUALIFIED_REVIEW"}

class LegalExamGateTests(unittest.TestCase):
    def test_missing_key_fails_closed(self):
        result = assess_readiness(BLUEPRINT)
        self.assertFalse(result["ready_for_manual_validation"])
        self.assertFalse(result["scoring_enabled"])
    def test_placeholder_source_rejected(self):
        key = self.key()
        key["primary_sources"][0]["url"] = "not-a-url"
        self.assertFalse(assess_readiness(BLUEPRINT, key)["ready_for_manual_validation"])
    def test_mismatched_case_rejected(self):
        key = self.key()
        key["case_id"] = "OTHER"
        self.assertFalse(assess_readiness(BLUEPRINT, key)["ready_for_manual_validation"])
    def test_metadata_does_not_authorize_scoring(self):
        result = assess_readiness(BLUEPRINT, self.key())
        self.assertTrue(result["ready_for_manual_validation"])
        self.assertFalse(result["scoring_enabled"])
        self.assertTrue(result["human_verification_required"])
        self.assertFalse(result["production_authorized"])
    def test_reversed_period_rejected(self):
        key = self.key()
        key["tax_period_end"] = "2025-01-01"
        self.assertFalse(assess_readiness(BLUEPRINT, key)["ready_for_manual_validation"])
    def key(self):
        return {
            "case_id": "VAT-ADV-001", "agent_id": "TAX-03",
            "reference_answer": "Illustrative placeholder; not a verified legal answer.",
            "tax_period_start": "2026-01-01", "tax_period_end": "2026-12-31",
            "reviewer": {"name": "Example Reviewer", "qualification": "unverified",
                         "review_note": "Illustrative only", "reviewed_at": "2026-11-19"},
            "primary_sources": [{"title": "Example only", "url": "https://example.org/placeholder",
                                 "provision": "Example", "effective_from": "2026-01-01",
                                 "verification_note": "Illustrative only"}]
        }

if __name__ == "__main__":
    unittest.main()
