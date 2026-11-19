import test from "node:test";
import assert from "node:assert/strict";
import { agents } from "../agent_registry.mjs";
import { routeSimulation } from "../orchestrator.mjs";

test("all 18 agent roles are registered with unique IDs", () => {
  assert.equal(agents.length, 18);
  assert.equal(new Set(agents.map(a => a.id)).size, 18);
});
test("VAT routes to specialist, research and QA", () => {
  const result = routeSimulation({ scenario: "VAT input tax EFRIS invoices" });
  assert.equal(result.specialist.id, "TAX-03");
  assert.equal(result.research.id, "TAX-15");
  assert.equal(result.quality_review.id, "TAX-18");
  assert.equal(result.submitted_to_ura, false);
  assert.equal(result.production_approved, false);
});
test("PAYE routes to PAYE specialist", () => {
  assert.equal(routeSimulation({ scenario: "PAYE payroll salary reconciliation" }).specialist.id, "TAX-05");
});
test("reject live operation and unknown agents", () => {
  assert.ok(routeSimulation({ scenario: "VAT", mode: "production" }).error);
  assert.ok(routeSimulation({ scenario: "VAT", requested_agent_id: "TAX-99" }).error);
});
test("requested specialist can override heuristic routing", () => {
  assert.equal(routeSimulation({ scenario: "Tax research", requested_agent_id: "TAX-17" }).specialist.id, "TAX-17");
});
