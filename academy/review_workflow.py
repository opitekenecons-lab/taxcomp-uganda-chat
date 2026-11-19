"""Offline independent review queue. Metadata alone never proves legal validity."""
from __future__ import annotations
from datetime import datetime, timezone

VALID_DECISIONS = {"approve_for_internal_training", "return_for_revision", "reject"}

def review_submission(submission: dict, review: dict) -> dict:
    if not isinstance(submission, dict) or not isinstance(review, dict):
        raise ValueError("submission and review must be objects")
    case_id = submission.get("case_id")
    agent_id = submission.get("agent_id")
    if not isinstance(case_id, str) or not case_id or not isinstance(agent_id, str) or not agent_id:
        raise ValueError("submission requires case_id and agent_id")
    reviewer = review.get("reviewer_id")
    decision = review.get("decision")
    notes = review.get("notes")
    if not isinstance(reviewer, str) or not reviewer.strip() or reviewer == agent_id:
        raise ValueError("independent reviewer identifier required")
    if decision not in VALID_DECISIONS:
        raise ValueError("invalid review decision")
    if not isinstance(notes, str) or not notes.strip():
        raise ValueError("review notes required")
    source_checks = review.get("source_checks", [])
    if not isinstance(source_checks, list):
        raise ValueError("source checks must be a list")
    for check in source_checks:
        if not isinstance(check, dict) or not all(
            isinstance(check.get(k), str) and check[k].strip()
            for k in ("url", "effective_date", "verification_note")
        ):
            raise ValueError("source check requires URL, effective date and verification note")
    if decision == "approve_for_internal_training" and not source_checks:
        raise ValueError("internal training approval requires documented source checks")
    return {
        "case_id": case_id,
        "agent_id": agent_id,
        "reviewer_id": reviewer,
        "decision": decision,
        "notes": notes,
        "source_checks": source_checks,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "final_client_advice": False,
        "professional_certification": False,
        "production_authorized": False,
        "warning": "Reviewer identity and source validity are not authenticated by this offline module."
    }
