import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { agents } from "../agent_registry.mjs";

const load = name => JSON.parse(readFileSync(new URL(`../cases/${name}`, import.meta.url), "utf8"));

test("all 18 roles have a distinct advanced examination blueprint", () => {
  const cases = [...load("advanced-blueprints.json"), ...load("specialist-blueprints.json")];
  assert.equal(cases.length, 18);
  assert.equal(new Set(cases.map(c => c.id)).size, 18);
  assert.deepEqual(new Set(cases.map(c => c.agent_id)), new Set(agents.map(a => a.id)));
  for (const c of cases) {
    assert.equal(c.requires_authority, true);
    assert.equal(c.reference_answer_status, "REQUIRES_QUALIFIED_REVIEW");
    assert.ok(typeof c.scenario === "string" && c.scenario.length > 30);
    assert.ok(c.required_fields.includes("authorities"));
    assert.notEqual(c.scoring_enabled, true);
  }
});
test("blueprints cannot be silently scored as verified examinations", () => {
  for (const c of [...load("advanced-blueprints.json"), ...load("specialist-blueprints.json")]) {
    assert.notEqual(c.reference_answer_status, "VERIFIED");
  }
});
