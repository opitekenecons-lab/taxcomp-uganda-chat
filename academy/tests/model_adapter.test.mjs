import test from "node:test";
import assert from "node:assert/strict";
import { assessWithModel } from "../model_adapter.mjs";

test("trusted injected model produces review-only draft", async () => {
  const result = await assessWithModel({ scenario: "VAT EFRIS input tax", model: async (task) => ({
    draft: "Review the invoice evidence and applicable period; no legal conclusion.",
    sources: task.source_candidates
  }) });
  assert.equal(result.status, "draft_pending_human_review");
  assert.equal(result.model_draft.agent_id, "TAX-03");
  assert.equal(result.quality_review.status, "not_executed_human_review_required");
  assert.equal(result.final_client_advice, false);
});
test("no configured model fails closed", async () => {
  assert.ok((await assessWithModel({ scenario: "VAT" })).error);
});
test("model cannot self-approve production", async () => {
  const result = await assessWithModel({ scenario: "VAT", model: async () => ({
    draft: "Approved", production_approved: true
  }) });
  assert.equal(result.status, "model_output_rejected");
});
test("model cannot submit to URA", async () => {
  const result = await assessWithModel({ scenario: "VAT", model: async () => ({
    draft: "Filed", submitted_to_ura: true
  }) });
  assert.equal(result.status, "model_output_rejected");
});
test("model errors do not expose secrets", async () => {
  const result = await assessWithModel({ scenario: "VAT", model: async () => {
    throw new Error("SECRET-DO-NOT-LEAK");
  } });
  assert.equal(result.status, "model_failed");
  assert.ok(!JSON.stringify(result).includes("SECRET-DO-NOT-LEAK"));
});

test("blank draft rejected", async () => {
  const result = await assessWithModel({ scenario: "VAT", model: async () => ({ draft: "  " }) });
  assert.equal(result.status, "model_output_rejected");
});
