import test from "node:test";
import assert from "node:assert/strict";
import { askClaude } from "../worker/claude-adapter.mjs";

test("Claude adapter sends server-side key and translates model history", async () => {
  let request;
  const result = await askClaude({
    question: "Explain VAT",
    history: [{ role: "model", text: "Previous reply" }],
    system: "Only use reviewed evidence.",
    apiKey: "test-secret",
    model: "claude-test-model",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ content: [{ type: "text", text: "Evidence-based answer" }] }) };
    },
  });
  assert.equal(result.answer, "Evidence-based answer");
  assert.equal(request.url, "https://api.anthropic.com/v1/messages");
  assert.equal(request.options.headers["x-api-key"], "test-secret");
  const body = JSON.parse(request.options.body);
  assert.equal(body.messages[0].role, "assistant");
  assert.equal(body.messages[1].content, "Explain VAT");
});

test("Claude adapter rejects invalid questions before making requests", async () => {
  await assert.rejects(askClaude({
    question: "", system: "reviewed", apiKey: "test", model: "claude-test",
    fetchImpl: () => { throw new Error("should not call"); },
  }), TypeError);
});

test("Claude adapter returns safe error for provider failure", async () => {
  await assert.rejects(askClaude({
    question: "VAT?", system: "reviewed", apiKey: "test", model: "claude-test",
    fetchImpl: async () => ({ ok: false, status: 429 }),
  }), error => error.status === 429);
});
