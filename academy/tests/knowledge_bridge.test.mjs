import test from "node:test";
import assert from "node:assert/strict";
import { examineQuestion } from "../knowledge_bridge.mjs";

test("TaxComp existing knowledge retriever is accessible in simulation", () => {
  const result = examineQuestion({ agent_id: "TAX-03", mode: "simulation_only", scenario: "VAT input tax EFRIS invoices" });
  assert.equal(result.agent_id, "TAX-03");
  assert.equal(result.status, "research_material_only");
  assert.ok(result.reviewed_guidance_notes.length > 0);
  assert.equal(result.final_client_advice, false);
  assert.equal(result.submitted_to_ura, false);
});
test("simulation cannot be invoked as live advice", () => {
  const result = examineQuestion({ agent_id: "TAX-03", mode: "production", scenario: "VAT" });
  assert.ok(result.error);
});
test("knowledge retrieval does not assert verification of source candidates", () => {
  const result = examineQuestion({ agent_id: "TAX-15", mode: "simulation_only", scenario: "Uganda company income tax" });
  assert.ok(result.limitations.some(x => x.includes("Source URLs are candidates")));
});
