// Staging-only model adapter. Inject a trusted model function; no network client or secrets.
import { routeSimulation } from "./orchestrator.mjs";

export async function assessWithModel({ scenario, requested_agent_id, model, mode = "simulation_only" } = {}) {
  if (typeof model !== "function") return { error: "trusted staging model adapter required" };
  const routed = routeSimulation({ scenario, requested_agent_id, mode });
  if (routed.error) return routed;
  const { specialist, research } = routed;
  const task = {
    mode: "simulation_only",
    agent_id: specialist.id,
    task: "Prepare a draft analytical response for independent human review, not client advice.",
    scenario,
    source_candidates: research.research_material.source_candidates,
    guidance_notes: specialist.research_material.reviewed_guidance_notes,
    constraints: {
      jurisdiction: "Uganda",
      prohibit_external_actions: true,
      require_tax_period: true,
      do_not_invent_law: true,
      do_not_claim_professional_licensure: true
    }
  };
  try {
    const answer = await model(Object.freeze(task));
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
      return { ...routed, status: "model_output_rejected", error: "model returned invalid object" };
    }
    if (answer.final_client_advice || answer.submitted_to_ura ||
        answer.production_approved || answer.status === "production_approved") {
      return { ...routed, status: "model_output_rejected", error: "prohibited model action or approval claim" };
    }
    if (typeof answer.draft !== "string" || !answer.draft.trim() || answer.draft.length > 6000) {
      return { ...routed, status: "model_output_rejected", error: "invalid draft" };
    }
    return {
      ...routed,
      status: "draft_pending_human_review",
      model_draft: { agent_id: specialist.id, draft: answer.draft,
        claimed_sources: Array.isArray(answer.sources) ? answer.sources : [] },
      quality_review: { id: "TAX-18", status: "not_executed_human_review_required" },
      limitations: [...routed.limitations.filter(x => x !== "No language model was called."),
        "Model-generated text is unverified and must not be used as client advice."]
    };
  } catch {
    return { ...routed, status: "model_failed", error: "staging model failed" };
  }
}
