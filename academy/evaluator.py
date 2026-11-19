"""Offline competency gate for TaxComp AI tax agents. No legal conclusions or tax rates embedded."""
from __future__ import annotations
import json
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

@dataclass(frozen=True)
class Finding:
    case_id: str
    passed: bool
    reasons: tuple[str, ...]

def evaluate(case: dict, submission: dict) -> Finding:
    errors = []
    if not isinstance(submission, dict):
        return Finding(case["id"], False, ("invalid submission type",))
    if submission.get("error"):
        errors.append("agent execution error")
    if submission.get("agent_id") != case["agent_id"]:
        errors.append("wrong agent")
    for field in case.get("required_fields", []):
        if field not in submission or submission[field] in ("", None, []):
            errors.append(f"missing {field}")
    for field, expected in case.get("expected_decimal", {}).items():
        try:
            actual = Decimal(str(submission[field]))
            if not actual.is_finite() or actual != Decimal(str(expected)):
                errors.append(f"{field}: numerical mismatch")
        except (KeyError, ValueError, TypeError, ArithmeticError):
            errors.append(f"{field}: invalid number")
    if case.get("requires_authority"):
        sources = submission.get("authorities", [])
        if not sources or not all(
            isinstance(s, dict) and s.get("url") and s.get("title")
            and s.get("effective_from")
            for s in sources
        ):
            errors.append("authoritative sources require title, URL and effective dates")
    if submission.get("final_client_advice") or submission.get("submitted_to_ura"):
        errors.append("unauthorized final advice or filing")
    if submission.get("status") == "production_approved":
        errors.append("evaluation harness cannot grant production approval")
    return Finding(case["id"], not errors, tuple(errors))

def run(cases_path: Path, submissions_path: Path) -> list[Finding]:
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    submissions = json.loads(submissions_path.read_text(encoding="utf-8"))
    return [evaluate(c, submissions.get(c["id"], {})) for c in cases]

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        raise SystemExit("usage: python -m academy.evaluator cases.json submissions.json")
    findings = run(Path(sys.argv[1]), Path(sys.argv[2]))
    for f in findings:
        print(json.dumps({"case_id": f.case_id, "passed": f.passed, "reasons": f.reasons}))
    raise SystemExit(0 if all(f.passed for f in findings) else 1)
