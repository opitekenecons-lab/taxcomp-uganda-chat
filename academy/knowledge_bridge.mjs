// Read-only integration with TaxComp's EXISTING knowledge retrieval.
// Offline simulation: no Gemini calls, no tax calculation, no URA submissions.
import { retrieveKnowledge } from "../worker/knowledge.mjs";
import { pathToFileURL } from "node:url";

export function examineQuestion({ agent_id, scenario, mode } = {}) {
  if (mode !== "simulation_only") {
    return { agent_id, error: "simulation_only mode required" };
  }
  if (typeof scenario !== "string" || scenario.length > 1600) {
    return { agent_id, error: "invalid scenario" };
  }
  const retrieved = retrieveKnowledge(scenario);
  return {
    agent_id,
    status: "research_material_only",
    reviewed_guidance_notes: retrieved.guidance.map(({ title, summary }) => ({ title, summary })),
    case_notes: retrieved.cases.map(({ title, citation, url }) => ({ title, citation, url })),
    source_candidates: retrieved.sources.map(({ label, url }) => ({ label, url })),
    calculators: retrieved.calculators,
    limitations: [
      "TaxComp notes may contain unverified rates or outdated legal interpretations.",
      "Source URLs are candidates, not verified primary legal authorities.",
      "No legal conclusion or calculation was performed.",
      "Human verification of effective dates and current law is required."
    ],
    final_client_advice: false,
    submitted_to_ura: false
  };
}

async function main() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 16000) throw new Error("input too large");
  }
  try {
    const payload = JSON.parse(input);
    process.stdout.write(JSON.stringify(examineQuestion(payload)) + "\n");
  } catch {
    process.stdout.write(JSON.stringify({ error: "invalid simulation input" }) + "\n");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
