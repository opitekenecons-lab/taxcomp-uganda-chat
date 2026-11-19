import test from "node:test";
import assert from "node:assert/strict";
import { assessInStaging, createGeminiStagingModel } from "../gemini_staging.mjs";

test("staging Gemini mock generates a review-only draft", async () => {
  let called = 0;
  const fakeFetch = async (url, options) => {
    called++;
    assert.match(url, /generativelanguage.googleapis.com/);
    assert.equal(options.headers["x-goog-api-key"], "FAKE_TEST_KEY");
    assert.equal(JSON.parse(options.body).generationConfig.responseMimeType, "application/json");
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{
      text: JSON.stringify({ draft: "Insufficient primary legal evidence; verify with a qualified reviewer.", sources: [] })
    }] } }] }) };
  };
  const result = await assessInStaging({ scenario: "VAT input tax EFRIS", apiKey: "FAKE_TEST_KEY", fetchImpl: fakeFetch });
  assert.equal(called, 1);
  assert.equal(result.status, "draft_pending_human_review");
  assert.equal(result.production_approved, false);
});
test("missing staging key never invokes the network", async () => {
  const result = await assessInStaging({ scenario: "VAT", fetchImpl: () => { throw Error("called"); } });
  assert.equal(result.error, "staging model not configured");
});
test("model cannot run non-simulation tasks", async () => {
  const model = createGeminiStagingModel({ apiKey: "FAKE_TEST_KEY", fetchImpl: () => { throw Error("called"); } });
  await assert.rejects(model({ mode: "production" }), /simulation task required/);
});
test("model errors do not disclose API keys", async () => {
  const result = await assessInStaging({ scenario: "VAT", apiKey: "SECRET_STAGING_KEY",
    fetchImpl: async () => { throw new Error("SECRET_STAGING_KEY"); } });
  assert.equal(result.status, "model_failed");
  assert.ok(!JSON.stringify(result).includes("SECRET_STAGING_KEY"));
});
