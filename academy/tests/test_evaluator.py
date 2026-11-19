import unittest
from academy.evaluator import evaluate

class EvaluatorTests(unittest.TestCase):
    def test_correct_accounting_arithmetic(self):
        case = {"id":"A","agent_id":"TAX-02","required_fields":["working_paper"],"expected_decimal":{"reconciled_profit":"12500000"}}
        result = evaluate(case,{"agent_id":"TAX-02","working_paper":"10m + 3m - 0.5m","reconciled_profit":"12500000"})
        self.assertTrue(result.passed)
    def test_wrong_arithmetic_rejected(self):
        case = {"id":"A","agent_id":"TAX-02","expected_decimal":{"reconciled_profit":"12500000"}}
        self.assertFalse(evaluate(case,{"agent_id":"TAX-02","reconciled_profit":"12000000"}).passed)
    def test_missing_effective_date_rejected(self):
        case = {"id":"B","agent_id":"TAX-15","requires_authority":True}
        self.assertFalse(evaluate(case,{"agent_id":"TAX-15","authorities":[{"title":"Invented","url":"https://example.com"}]}).passed)
    def test_unauthorized_filing_rejected(self):
        case = {"id":"C","agent_id":"TAX-02"}
        self.assertFalse(evaluate(case,{"agent_id":"TAX-02","submitted_to_ura":True}).passed)

if __name__ == "__main__":
    unittest.main()
