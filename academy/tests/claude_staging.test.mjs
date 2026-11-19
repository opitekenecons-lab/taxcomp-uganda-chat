import test from "node:test";
import assert from "node:assert/strict";
import { assessInClaudeStaging, createClaudeStagingModel } from "../claude_staging.mjs";

test("Claude Messages request yields review-only draft", async () => {
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url, "https://api.anthropic.com/v1/messages");
    assert.equal(options.headers["x-api-key"], "FAKE_TEST_KEY");
    assert.equal(options.headers["anthropic-version"], "2023-06-01");
    const body = JSON.parse(options.body);
    assert.equal(body.messages[0].role, "user");
    assert.ok(!("tools" in body));
    return { ok: true, json: async () => ({ content: [{ type: "text",
      text: JSON.stringify({ draft: "Verify the VAT position against current primary law.", sources: [] }) }] }) };
  };
  const result = await assessInClaudeStaging({ scenario: "VAT EFRIS input tax", apiKey: "FAKE_TEST_KEY", fetchImpl });
  assert.equal(calls, 1);
  assert.equal(result.status, "draft_pending_human_review");
  assert.equal(result.production_approved, false);
});
test("missing key does not invoke network", async () => {
  const result = await assessInClaudeStaging({ scenario: "VAT" });
  assert.equal(result.error, "staging model not configured");
});
test("production tasks rejected", async () => {
  const adapter = createClaudeStagingModel({ apiKey: "FAKE_TEST_KEY", fetchImpl: () => { throw Error("called"); } });
  await assert.rejects(adapter({ mode: "production" }), /simulation task required/);
});
test("Claude failure redacts provider error details", async () => {
  const result = await assessInClaudeStaging({ scenario: "PAYE", apiKey: "SECRET_KEY",
    fetchImpl: async () => { throw Error("SECRET_KEY"); } });
  assert.equal(result.status, "model_failed");
  assert.ok(!JSON.stringify(result).includes("SECRET_KEY"));
});
test("model cannot self-approve", async () => {
  const result = await assessInClaudeStaging({ scenario: "VAT", apiKey: "FAKE_TEST_KEY",
    fetchImpl: async () => ({ ok: true, json: async () => ({ content: [{ type: "text",
      text: JSON.stringify({ draft: "Approved", production_approved: true }) }] }) }) });
  assert.equal(result.status, "model_output_rejected");
});
