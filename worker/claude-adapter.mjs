// Anthropic Messages API adapter for the staged TaxComp migration.
// Never import this module into browser code; invoke only from trusted server runtimes.
export async function askClaude({ question, history = [], system, apiKey, model, fetchImpl = fetch }) {
  if (!apiKey || !model || !system) throw new Error("Claude is not configured.");
  if (typeof question !== "string" || !question.trim() || question.length > 1600) {
    throw new TypeError("Invalid question.");
  }
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(model)) throw new Error("Invalid Claude model.");
  const messages = history.slice(-8)
    .filter(x => x && (x.role === "user" || x.role === "assistant" || x.role === "model") && typeof x.text === "string")
    .map(x => ({ role: x.role === "model" ? "assistant" : x.role, content: x.text.slice(0, 900) }));
  messages.push({ role: "user", content: question.trim() });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model, max_tokens: 650, temperature: 0.2,
        system, messages,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(response.status === 429 ? "AI rate limit reached." : "AI provider unavailable.");
      error.status = response.status === 429 ? 429 : 502;
      throw error;
    }
    const payload = await response.json();
    const answer = (payload.content || []).filter(x => x.type === "text").map(x => x.text).join("").trim();
    if (!answer || answer.length > 6000) throw new Error("AI provider returned no usable answer.");
    return { answer, usage: payload.usage || null };
  } finally {
    clearTimeout(timeout);
  }
}
