"""Fail-closed gate for advanced tax exam answer keys.

Offline structural validation only: cannot authenticate reviewers or validate laws.
"""
from __future__ import annotations
from datetime import date
from urllib.parse import urlparse

def _date(value):
    try:
        if not isinstance(value, str) or date.fromisoformat(value).isoformat() != value:
            return False
        return True
    except ValueError:
        return False

def assess_readiness(blueprint: dict, answer_key: dict | None = None) -> dict:
    reasons = []
    if not isinstance(blueprint, dict) or not blueprint.get("id") or not blueprint.get("agent_id"):
        return {"ready_for_manual_validation": False, "scoring_enabled": False,
                "reasons": ["invalid blueprint"]}
    if blueprint.get("reference_answer_status") != "REQUIRES_QUALIFIED_REVIEW":
        reasons.append("blueprint must remain pending qualified review")
    if not isinstance(answer_key, dict):
        reasons.append("independent reference answer key missing")
    else:
        if answer_key.get("case_id") != blueprint["id"] or answer_key.get("agent_id") != blueprint["agent_id"]:
            reasons.append("answer key does not match blueprint")
        if not isinstance(answer_key.get("reference_answer"), str) or not answer_key["reference_answer"].strip():
            reasons.append("reference answer missing")
        if not _date(answer_key.get("tax_period_start")) or not _date(answer_key.get("tax_period_end")):
            reasons.append("valid tax period dates required")
        elif answer_key["tax_period_start"] > answer_key["tax_period_end"]:
            reasons.append("tax period dates reversed")
        reviewer = answer_key.get("reviewer")
        if not isinstance(reviewer, dict) or not all(
            isinstance(reviewer.get(field), str) and reviewer[field].strip()
            for field in ("name", "qualification", "review_note", "reviewed_at")
        ):
            reasons.append("qualified reviewer attestation metadata required")
        elif not _date(reviewer["reviewed_at"]):
            reasons.append("review date invalid")
        sources = answer_key.get("primary_sources")
        if not isinstance(sources, list) or not sources:
            reasons.append("primary legal sources missing")
        else:
            for source in sources:
                if not isinstance(source, dict) or not all(
                    isinstance(source.get(field), str) and source[field].strip()
                    for field in ("title", "url", "provision", "effective_from", "verification_note")
                ):
                    reasons.append("incomplete primary source metadata")
                    break
                parsed = urlparse(source["url"])
                if parsed.scheme != "https" or not parsed.netloc or not _date(source["effective_from"]):
                    reasons.append("invalid primary source URL or effective date")
                    break
    return {
        "case_id": blueprint["id"],
        "ready_for_manual_validation": not reasons,
        "scoring_enabled": False,
        "reasons": reasons or ["metadata present; authenticity and legal correctness still require independent verification"],
        "human_verification_required": True,
        "professional_certification": False,
        "production_authorized": False
    }
