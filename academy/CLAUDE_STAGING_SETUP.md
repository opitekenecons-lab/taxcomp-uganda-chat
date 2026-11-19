# Claude AI is the selected TaxComp Academy model provider

The previous Gemini staging prototype is retired from this branch. Use `academy/claude_staging.mjs` with Anthropic's Messages API.

This is a **server-side, simulation-only** model adapter. It reuses the existing TaxComp knowledge bridge, 18-role router and review-only output gate.

## Setup (private staging only)
1. Provision a restricted Anthropic API key in a server-side secret manager, never in frontend files or GitHub.
2. Supply `apiKey` to `assessInClaudeStaging({ scenario, apiKey })` from a trusted private staging process.
3. Confirm the selected model ID is enabled for your Anthropic account. The default model ID is an example of a Claude Sonnet model and may need updating.
4. Run `node --test academy/tests/*.test.mjs` and separately run supervised real-model assessment cases.
5. Independently verify Uganda legal sources and effective dates before scoring legal answers.

No key was provisioned, no real Claude request was made, and no production deployment occurred in this change.

**Do not expose this function as a public HTTP endpoint.** Authentication, per-user rate limits, budgets, audit logging and tenant isolation must be implemented and tested first. The adapter has no tools for URA submissions, messaging, payments or deployment. Its output is not professional certification or client advice.
