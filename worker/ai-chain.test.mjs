import assert from "node:assert/strict";
import test from "node:test";
import { answerWithChain, providerOrder } from "./ai-chain.mjs";

const input = { system: "Use only the evidence.", question: "What is the VAT rate?", history: [{ role: "model", text: "Hi" }] };

function fakeFetch(plan) {
  const calls = [];
  const impl = async (url, options) => {
    const host = new URL(url).hostname;
    calls.push({ host, body: JSON.parse(options.body), headers: options.headers });
    const step = plan[host];
    if (!step) throw new Error(`unexpected call to ${host}`);
    if (step.status !== 200) return new Response("no", { status: step.status });
    return new Response(JSON.stringify(step.body), { status: 200 });
  };
  return { impl, calls };
}

const okOpenAi = (text) => ({ status: 200, body: { choices: [{ message: { content: text } }] } });

test("skips providers without keys and keeps the default order", () => {
  assert.deepEqual(providerOrder({ GROQ_API_KEY: "g", ANTHROPIC_API_KEY: "a" }), ["groq", "claude"]);
  assert.deepEqual(providerOrder({}), []);
});

test("AI_ORDER can put Claude first and ignores unknown names", () => {
  const env = { AI_ORDER: "claude, nonsense, gemini", GEMINI_API_KEY: "x", ANTHROPIC_API_KEY: "a" };
  assert.deepEqual(providerOrder(env), ["claude", "gemini"]);
});

test("falls back from a rate-limited Gemini to Groq", async () => {
  const { impl, calls } = fakeFetch({
    "generativelanguage.googleapis.com": { status: 429 },
    "api.groq.com": okOpenAi("Standard rate is 18% [1]."),
  });
  const result = await answerWithChain({ ...input, env: { GEMINI_API_KEY: "x", GROQ_API_KEY: "y" }, fetchImpl: impl });
  assert.deepEqual(result, { answer: "Standard rate is 18% [1].", provider: "groq" });
  assert.equal(calls.length, 2);
  const groq = calls[1];
  assert.equal(groq.headers.Authorization, "Bearer y");
  assert.equal(groq.body.messages[0].role, "system");
  assert.equal(groq.body.messages[1].role, "assistant");
  assert.equal(groq.body.messages.at(-1).content, "What is the VAT rate?");
  assert.equal(groq.body.reasoning_effort, "low");
});

test("treats an empty free answer as a failure and reaches Claude last", async () => {
  const { impl, calls } = fakeFetch({
    "openrouter.ai": okOpenAi("   "),
    "api.anthropic.com": { status: 200, body: { content: [{ type: "text", text: "From Claude [1]." }] } },
  });
  const env = { OPENROUTER_API_KEY: "o", ANTHROPIC_API_KEY: "a", CLAUDE_MODEL: "claude-test" };
  const result = await answerWithChain({ ...input, env, fetchImpl: impl });
  assert.deepEqual(result, { answer: "From Claude [1].", provider: "claude" });
  assert.equal(calls[0].body.model, "openrouter/free");
  assert.equal(calls[1].host, "api.anthropic.com");
});

test("reports busy when every provider is rate limited, without leaking details", async () => {
  const { impl } = fakeFetch({ "api.groq.com": { status: 429 }, "openrouter.ai": { status: 500 } });
  const result = await answerWithChain({ ...input, env: { GROQ_API_KEY: "g", OPENROUTER_API_KEY: "o" }, fetchImpl: impl });
  assert.deepEqual(result, { error: "The AI service is busy. Please try again shortly.", status: 429 });
});

test("reports not configured when no provider has a key", async () => {
  const result = await answerWithChain({ ...input, env: {}, fetchImpl: async () => { throw new Error("no call"); } });
  assert.equal(result.status, 503);
});

test("rejects an unsafe model name instead of calling the provider", async () => {
  const { impl, calls } = fakeFetch({});
  const result = await answerWithChain({ ...input, env: { GROQ_API_KEY: "g", GROQ_MODEL: "bad model?" }, fetchImpl: impl });
  assert.equal(calls.length, 0);
  assert.equal(result.status, 502);
});
