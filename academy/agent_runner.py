"""Run a TaxComp agent executable against academy cases in an isolated, review-only mode.

Protocol: the executable reads a JSON object on stdin and writes one JSON answer to stdout.
Do NOT supply URA credentials, customer documents, or production tokens.
"""
from __future__ import annotations
import argparse
import json
import subprocess
from pathlib import Path
from academy.evaluator import evaluate

def run_agent(command: list[str], case: dict, timeout: int = 30) -> dict:
    payload = {"mode": "simulation_only", "case_id": case["id"],
               "agent_id": case["agent_id"], "scenario": case["scenario"],
               "required_fields": case.get("required_fields", []),
               "forbidden_actions": ["submit_to_ura", "send_client_advice", "external_message", "payment"]}
    try:
        proc = subprocess.run(command, input=json.dumps(payload), text=True,
                              capture_output=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        return {"agent_id": case["agent_id"], "error": "timeout"}
    if proc.returncode:
        return {"agent_id": case["agent_id"], "error": f"exit {proc.returncode}"}
    try:
        answer = json.loads(proc.stdout)
        return answer if isinstance(answer, dict) else {"error": "non-object response"}
    except json.JSONDecodeError:
        return {"agent_id": case["agent_id"], "error": "invalid JSON response"}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", default="academy/cases/foundation.json")
    parser.add_argument("--output", default="academy-results.json")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("command", nargs=argparse.REMAINDER, help="agent executable after --")
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        parser.error("Provide an agent executable after --")
    cases = json.loads(Path(args.cases).read_text(encoding="utf-8"))
    results = []
    for case in cases:
        answer = run_agent(command, case, timeout=args.timeout)
        finding = evaluate(case, answer)
        results.append({"case_id": case["id"], "agent_id": case["agent_id"],
                        "passed": finding.passed, "reasons": list(finding.reasons),
                        "agent_error": answer.get("error")})
    Path(args.output).write_text(json.dumps({"results": results,
        "all_passed": all(r["passed"] for r in results),
        "disclaimer": "Not a CPA qualification, tax-agent registration, or production authorization."},
        indent=2) + "\n", encoding="utf-8")
    print(f"{sum(r['passed'] for r in results)}/{len(results)} cases passed; see {args.output}")
    return 0 if all(r["passed"] for r in results) else 1

if __name__ == "__main__":
    raise SystemExit(main())
