import test from "node:test";
import assert from "node:assert/strict";
import { runCli } from "../claude_staging_cli.mjs";

const sink = () => {
  let output = "";
  return { stdout: { write: s => { output += s; } }, getOutput: () => output };
};
async function* input(value) { yield value; }

test("CLI disabled by default without network access", async () => {
  const s = sink();
  const code = await runCli({ env: {}, stdin: input("{}"), stdout: s.stdout });
  assert.equal(code, 2);
  assert.equal(JSON.parse(s.getOutput()).error, "staging disabled");
});
test("CLI requires a server-side key", async () => {
  const s = sink();
  const code = await runCli({ env: { TAXCOMP_STAGING_ENABLED: "true" }, stdin: input("{}"), stdout: s.stdout });
  assert.equal(code, 2);
  assert.equal(JSON.parse(s.getOutput()).error, "Anthropic key not configured");
});
test("CLI rejects non-simulation payload before calling model", async () => {
  const s = sink();
  const code = await runCli({
    env: { TAXCOMP_STAGING_ENABLED: "true", ANTHROPIC_API_KEY: "FAKE_TEST_KEY" },
    stdin: input(JSON.stringify({ mode: "production", scenario: "VAT" })), stdout: s.stdout
  });
  assert.equal(code, 1);
  assert.equal(JSON.parse(s.getOutput()).error, "invalid staging input or model response");
});
