import json
import sys
import unittest
from academy.agent_runner import run_agent

class AgentRunnerTests(unittest.TestCase):
    def test_valid_json_response(self):
        command = [sys.executable, "-c", "import json,sys; p=json.load(sys.stdin); print(json.dumps({'agent_id':p['agent_id'],'reconciled_profit':'12500000'}))"]
        answer = run_agent(command, {"id":"A","agent_id":"TAX-02","scenario":"synthetic"}, timeout=5)
        self.assertEqual(answer["reconciled_profit"], "12500000")
    def test_non_json_rejected(self):
        answer = run_agent([sys.executable, "-c", "print('not-json')"], {"id":"A","agent_id":"TAX-02","scenario":"synthetic"}, timeout=5)
        self.assertEqual(answer["error"], "invalid JSON response")
    def test_nonzero_exit_rejected(self):
        answer = run_agent([sys.executable, "-c", "raise SystemExit(2)"], {"id":"A","agent_id":"TAX-02","scenario":"synthetic"}, timeout=5)
        self.assertEqual(answer["error"], "exit 2")
    def test_timeout_rejected(self):
        answer = run_agent([sys.executable, "-c", "import time;time.sleep(2)"], {"id":"A","agent_id":"TAX-02","scenario":"synthetic"}, timeout=1)
        self.assertEqual(answer["error"], "timeout")
if __name__ == "__main__":
    unittest.main()
