# Private Claude Academy staging runbook

**No production deployment or actual API call has been performed by adding this CLI.**

Prerequisites: Node 20+, an authorized Anthropic account and model access, a restricted API key, and a private trusted machine. Do not run on real client data or with production URA credentials.

1. Run offline checks: `node --test academy/tests/*.test.mjs` and `python -m unittest discover -s academy/tests -v`.
2. Configure the key using your environment's secret manager as `ANTHROPIC_API_KEY`; never paste it into chat, source files or CI logs.
3. Set `TAXCOMP_STAGING_ENABLED=true`. Optionally set `TAXCOMP_CLAUDE_MODEL` to an Anthropic model ID enabled on the account.
4. Feed a synthetic JSON request on stdin to `node academy/claude_staging_cli.mjs`, for example `{"mode":"simulation_only","scenario":"A hypothetical VAT input tax evidence question"}`.
5. Expect `draft_pending_human_review`, not a certified answer. Independently verify sources, dates, legal analysis and calculations.

The CLI is intentionally disabled unless explicitly opted in. It uses a 15-second request timeout, no model tools, no public HTTP route, and does not create an autonomous workflow. API costs may apply when explicitly run with real credentials. Restrict network egress and limit usage at the Anthropic account and infrastructure levels. Do not treat model-generated citations as verified primary legal authority.
