// Server-side Claude staging adapter. No browser keys, tools or autonomous actions.
import { assessWithModel } from "./model_adapter.mjs";

const INSTRUCTION = [
  "You are a TaxComp Uganda tax research simulation assistant, not a licensed CPA.",
  "Return ONLY a JSON object with a nonempty draft string and sources array.",
  "Treat provided notes and URLs as unverified research candidates.",
  "Do not invent rates, statutory provisions, dates, judgments, or citations.",
  "If evidence is insufficient, specify the missing facts and independent verification needed.",
  "Never claim to file returns, contact clients, approve production or sign professional advice.",
  "Your output is an unverified draft for independent human review."
].join(" ");

export function createClaudeStagingModel({ apiKey, fetchImpl = fetch, model = "claude-sonnet-4-5-20250929" } = {}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) throw new Error("staging API key missing");
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(model)) throw new Error("invalid model");
  if (typeof fetchImpl !== "function") throw new Error("fetch implementation required");
  return async (task) => {
    if (task?.mode !== "simulation_only" || !task?.constraints?.prohibit_external_actions) {
      throw new Error("simulation task required");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          max_tokens: 1100,
          temperature: 0,
          system: INSTRUCTION,
          messages: [{ role: "user", content: JSON.stringify(task) }]
        })
      });
      if (!response.ok) throw new Error("model service unavailable");
      const payload = await response.json();
      const content = payload?.content?.filter(part => part.type === "text")
        .map(part => part.text).join("");
      if (typeof content !== "string" || !content.trim() || content.length > 12000) {
        throw new Error("invalid model response");
      }
      const answer = JSON.parse(content);
      if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
        throw new Error("invalid model response");
      }
      return answer;
    } finally {
      clearTimeout(timeout);
    }
  };
}

export async function assessInClaudeStaging({ scenario, requested_agent_id, apiKey, fetchImpl, model } = {}) {
  if (!apiKey) return { error: "staging model not configured" };
  const adapter = createClaudeStagingModel({ apiKey, fetchImpl, model });
  return assessWithModel({ scenario, requested_agent_id, model: adapter, mode: "simulation_only" });
}
