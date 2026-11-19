// Explicit opt-in, server-side local staging CLI. Never expose via a public route.
import { assessInClaudeStaging } from "./claude_staging.mjs";
import { pathToFileURL } from "node:url";

export async function runCli({ env = process.env, stdin = process.stdin, stdout = process.stdout } = {}) {
  if (env.TAXCOMP_STAGING_ENABLED !== "true") {
    stdout.write(JSON.stringify({ error: "staging disabled" }) + "\n");
    return 2;
  }
  if (!env.ANTHROPIC_API_KEY) {
    stdout.write(JSON.stringify({ error: "Anthropic key not configured" }) + "\n");
    return 2;
  }
  let input = "";
  try {
    for await (const chunk of stdin) {
      input += chunk;
      if (input.length > 4000) throw new Error("invalid input");
    }
    const payload = JSON.parse(input);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("invalid input");
    if (payload.mode !== "simulation_only") throw new Error("invalid input");
    const result = await assessInClaudeStaging({
      scenario: payload.scenario,
      requested_agent_id: payload.requested_agent_id,
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.TAXCOMP_CLAUDE_MODEL || undefined
    });
    stdout.write(JSON.stringify(result) + "\n");
    return result.error || result.status !== "draft_pending_human_review" ? 1 : 0;
  } catch {
    stdout.write(JSON.stringify({ error: "invalid staging input or model response" }) + "\n");
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runCli();
}
