"""Conservative examination scorecards. Never awards a professional credential."""
from __future__ import annotations
import argparse
import json
from collections import defaultdict
from pathlib import Path

def build_scorecards(results: list[dict], reviewed_case_ids: set[str] | None = None) -> dict:
    reviewed_case_ids = reviewed_case_ids or set()
    groups: dict[str, list[dict]] = defaultdict(list)
    for result in results:
        if not isinstance(result, dict) or not result.get("agent_id") or not result.get("case_id"):
            raise ValueError("each result requires agent_id and case_id")
        groups[result["agent_id"]].append(result)
    scorecards = []
    for agent_id, cases in sorted(groups.items()):
        seen = set()
        for case in cases:
            if case["case_id"] in seen:
                raise ValueError("duplicate case result for an agent")
            seen.add(case["case_id"])
        passed = sum(case.get("passed") is True for case in cases)
        independently_reviewed = sum(case["case_id"] in reviewed_case_ids for case in cases)
        scorecards.append({
            "agent_id": agent_id,
            "attempted": len(cases),
            "passed": passed,
            "pass_rate_percent": round(passed * 100 / len(cases), 1),
            "independently_reviewed_cases": independently_reviewed,
            "status": "assessment_in_progress",
            "professional_credential": None,
            "production_authorized": False
        })
    return {
        "agents_assessed": len(scorecards),
        "case_results": sum(s["attempted"] for s in scorecards),
        "scorecards": scorecards,
        "qualification_status": "not_certified",
        "note": "Scores indicate test performance only, not CPA qualification, tax-agent registration, or production readiness."
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("results", type=Path, help="JSON from academy.agent_runner")
    parser.add_argument("--output", type=Path, default=Path("academy-scorecards.json"))
    args = parser.parse_args()
    data = json.loads(args.results.read_text(encoding="utf-8"))
    report = build_scorecards(data["results"])
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Recorded {report['case_results']} case results across {report['agents_assessed']} agents")

if __name__ == "__main__":
    main()
