// Staging-only research task routing. No model, external API or client-facing action.
import { agents, agentById } from "./agent_registry.mjs";
import { examineQuestion } from "./knowledge_bridge.mjs";

const ALWAYS_REVIEW = "TAX-18";
const RESEARCH = "TAX-15";
const BLOCKED_ACTIONS = Object.freeze(["filing", "payment", "client_message", "professional_signoff", "deployment"]);

export function routeSimulation({ scenario, mode = "simulation_only", requested_agent_id } = {}) {
  if (mode !== "simulation_only") return { error: "simulation-only orchestration" };
  if (typeof scenario !== "string" || !scenario.trim() || scenario.length > 1600) {
    return { error: "invalid scenario" };
  }
  const lower = scenario.toLowerCase();
  const specialists = agents.filter(agent => agent.id !== ALWAYS_REVIEW && agent.id !== RESEARCH &&
    agent.topics.some(topic => lower.includes(topic)));
  const requested = requested_agent_id ? agentById(requested_agent_id) : null;
  if (requested_agent_id && !requested) return { error: "unknown agent" };
  const primary = requested && ![ALWAYS_REVIEW, RESEARCH].includes(requested.id)
    ? requested : specialists.find(a => a.id !== "TAX-01") || agentById("TAX-01");
  const research = examineQuestion({ agent_id: RESEARCH, scenario, mode });
  const specialist = examineQuestion({ agent_id: primary.id, scenario, mode });
  return {
    mode,
    status: "simulation_research_only",
    specialist: { id: primary.id, role: primary.role, research_material: specialist },
    research: { id: RESEARCH, research_material: research },
    quality_review: { id: ALWAYS_REVIEW, status: "pending_independent_human_source_review" },
    blocked_actions: BLOCKED_ACTIONS,
    final_client_advice: false,
    submitted_to_ura: false,
    production_approved: false,
    limitations: ["No language model was called.", "No independent law verification or tax computation occurred.",
      "Routing is keyword-based and requires independent evaluation before professional use."]
  };
}
