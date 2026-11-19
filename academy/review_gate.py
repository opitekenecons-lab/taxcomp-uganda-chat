"""Human-reviewed evidence gate for academy source-based exercises.

Attestations are supplied by a separate reviewer file, never trusted from agent output.
This is a metadata check, not a legal source authenticator or professional certification.
"""
from __future__ import annotations
import json
from pathlib import Path
from academy.evaluator import evaluate

def evaluate_with_review(case: dict, submission: dict, review: dict | None = None) -> dict:
    base = evaluate(case, submission)
    errors = list(base.reasons)
    if case.get("requires_authority"):
        reviewed = (review or {}).get("sources", [])
        cited = submission.get("authorities", [])
        if not cited or not isinstance(cited, list):
            errors.append("missing source citations")
        else:
            for source in cited:
                if not isinstance(source, dict):
                    errors.append("invalid source")
                    continue
                matches = [r for r in reviewed if isinstance(r, dict)
                    and r.get("url") == source.get("url")
                    and r.get("effective_from") == source.get("effective_from")
                    and r.get("verified") is True
                    and r.get("reviewer_id")
                    and r.get("reviewed_at")]
                if not matches:
                    errors.append("source not attested in separate reviewer record")
        if not (review or {}).get("reviewer_id"):
            errors.append("independent reviewer missing")
    return {"case_id": case["id"], "passed": not errors, "reasons": errors}

def run_reviewed(cases: Path, submissions: Path, reviews: Path) -> list[dict]:
    case_list = json.loads(cases.read_text(encoding="utf-8"))
    answer_map = json.loads(submissions.read_text(encoding="utf-8"))
    review_map = json.loads(reviews.read_text(encoding="utf-8"))
    return [evaluate_with_review(c, answer_map.get(c["id"], {}),
             review_map.get(c["id"], {})) for c in case_list]
