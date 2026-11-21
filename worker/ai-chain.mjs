// Free-first AI provider chain for the TaxComp chat Worker.
// Tries each provider in AI_ORDER (default: gemini, groq, openrouter, claude) and
// returns the first usable answer. Providers without a key are skipped, so the
// chain only grows as keys are added as Worker secrets:
//   GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY
// Optional vars: AI_ORDER, GEMINI_MODEL, GROQ_MODEL, OPENROUTER_MODEL, CLAUDE_MODEL.
// Never import this module into browser code.

import { askClaude } from "./claude-adapter.mjs";

export const DEFAULT_ORDER = ["gemini", "groq", "openrouter", "claude"];
const TIMEOUT_MS = 20_000;
const MODEL_PATTERN = /^[a-zA-Z0-9._:/-]{1,100}$/;

class ProviderError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** @param {Record<string, any>} env */
export function providerOrder(env) {
  const raw = typeof env.AI_ORDER === "string" && env.AI_ORDER.trim()
    ? env.AI_ORDER.split(",").map((name) => name.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_ORDER;
  return raw.filter((name) => name in PROVIDERS && PROVIDERS[name].configured(env));
}

/**
 * @param {{ system: string, question: string, history: { role: "user" | "model", text: string }[],
 *   env: Record<string, any>, fetchImpl?: typeof fetch, maxTokens?: number }} input
 * @returns {Promise<{ answer: string, provider: string } | { error: string, status: number }>}
 */
export async function answerWithChain({ system, question, history, env, fetchImpl = fetch, maxTokens = 650 }) {
  const order = providerOrder(env);
  if (order.length === 0) {
    return { error: "The AI assistant is not configured yet.", status: 503 };
  }

  let sawRateLimit = false;
  for (const name of order) {
    try {
      const answer = await PROVIDERS[name].ask({ system, question, history, env, fetchImpl, maxTokens });
      if (typeof answer === "string" && answer.trim()) {
        return { answer: answer.trim(), provider: name };
      }
    } catch (error) {
      if (error && error.status === 429) sawRateLimit = true;
      console.warn(`[ai-chain] ${name} failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return sawRateLimit
    ? { error: "The AI service is busy. Please try again shortly.", status: 429 }
    : { error: "The AI service could not answer right now. Please try again later.", status: 502 };
}

async function postJson(fetchImpl, url, headers, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new ProviderError(`HTTP ${response.status}`, response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function checkModel(model) {
  if (!MODEL_PATTERN.test(model)) throw new ProviderError("invalid model name", 503);
  return model;
}

function openAiMessages(system, question, history) {
  return [
    { role: "system", content: system },
    ...history.map((item) => ({ role: item.role === "model" ? "assistant" : "user", content: item.text })),
    { role: "user", content: question },
  ];
}

function openAiText(data) {
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text : "";
}

const PROVIDERS = {
  gemini: {
    configured: (env) => Boolean(env.GEMINI_API_KEY),
    async ask({ system, question, history, env, fetchImpl, maxTokens }) {
      const model = checkModel(env.GEMINI_MODEL || "gemini-2.5-flash");
      const data = await postJson(
        fetchImpl,
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        { "x-goog-api-key": env.GEMINI_API_KEY },
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            ...history.map((item) => ({ role: item.role, parts: [{ text: item.text }] })),
            { role: "user", parts: [{ text: question }] },
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens },
        },
      );
      return (data.candidates?.[0]?.content?.parts || [])
        .map((part) => (typeof part.text === "string" ? part.text : ""))
        .join("");
    },
  },

  groq: {
    configured: (env) => Boolean(env.GROQ_API_KEY),
    async ask({ system, question, history, env, fetchImpl, maxTokens }) {
      const model = checkModel(env.GROQ_MODEL || "openai/gpt-oss-120b");
      /** @type {Record<string, any>} */
      const body = {
        model,
        messages: openAiMessages(system, question, history),
        temperature: 0.2,
        max_tokens: maxTokens * 2,
      };
      if (model.startsWith("openai/gpt-oss")) body.reasoning_effort = "low";
      const data = await postJson(
        fetchImpl,
        "https://api.groq.com/openai/v1/chat/completions",
        { Authorization: `Bearer ${env.GROQ_API_KEY}` },
        body,
      );
      return openAiText(data);
    },
  },

  openrouter: {
    configured: (env) => Boolean(env.OPENROUTER_API_KEY),
    async ask({ system, question, history, env, fetchImpl, maxTokens }) {
      const model = checkModel(env.OPENROUTER_MODEL || "openrouter/free");
      const data = await postJson(
        fetchImpl,
        "https://openrouter.ai/api/v1/chat/completions",
        {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": env.ALLOWED_ORIGIN || "https://opitekeneconsultancylimited.github.io",
          "X-Title": "TaxComp",
        },
        {
          model,
          messages: openAiMessages(system, question, history),
          temperature: 0.2,
          max_tokens: maxTokens * 2,
        },
      );
      return openAiText(data);
    },
  },

  claude: {
    configured: (env) => Boolean(env.ANTHROPIC_API_KEY),
    async ask({ system, question, history, env, fetchImpl }) {
      const { answer } = await askClaude({
        question,
        history,
        system,
        apiKey: env.ANTHROPIC_API_KEY,
        model: env.CLAUDE_MODEL || "claude-sonnet-5-5",
        fetchImpl,
      });
      return answer;
    },
  },
};
