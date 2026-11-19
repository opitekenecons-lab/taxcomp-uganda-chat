// Server-side staging-only Gemini adapter. Do not import into browser bundles.
import { assessWithModel } from "./model_adapter.mjs";

const INSTRUCTION = [
  "You are an unlicensed TaxComp simulation assistant for Uganda tax research.",
  "Respond ONLY with a JSON object containing a nonempty draft string and sources array.",
  "Use the supplied notes as unverified research candidates, not as proof of current law.",
  "Do not invent tax rates, legal sections, case holdings, dates or citations.",
  "Do not claim professional credentials or approve, file, contact clients or take actions.",
  "If the evidence is insufficient, explicitly state what must be verified by a qualified human.",
  "All output is a draft for human review; do not give final client advice."
].join(" ");

export function createGeminiStagingModel({ apiKey, fetchImpl = fetch, model = "gemini-2.5-flash" } = {}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) throw new Error("staging API key missing");
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(model)) throw new Error("invalid model");
  if (typeof fetchImpl !== "function") throw new Error("fetch implementation required");
  return async (task) => {
    if (task?.mode !== "simulation_only" || !task?.constraints?.prohibit_external_actions) {
      throw new Error("simulation task required");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: INSTRUCTION }] },
            contents: [{ role: "user", parts: [{ text: JSON.stringify(task) }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 1100, responseMimeType: "application/json" }
          })
        }
      );
      if (!response.ok) throw new Error("model service unavailable");
      const payload = await response.json();
      const content = payload?.candidates?.[0]?.content?.parts
        ?.map(part => typeof part.text === "string" ? part.text : "").join("");
      if (!content || content.length > 12000) throw new Error("invalid model response");
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

export async function assessInStaging({ scenario, requested_agent_id, apiKey, fetchImpl, model } = {}) {
  if (!apiKey) return { error: "staging model not configured" };
  const adapter = createGeminiStagingModel({ apiKey, fetchImpl, model });
  return assessWithModel({ scenario, requested_agent_id, model: adapter, mode: "simulation_only" });
}
