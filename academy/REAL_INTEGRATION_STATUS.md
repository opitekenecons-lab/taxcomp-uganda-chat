# TaxComp real architecture inspection — 2026-11-19

Inspected existing `index.html`, `run_taxcomp.py`, `wrangler.toml`, `worker/index.mjs` and `worker/knowledge.mjs` on main.

## Observed
- Existing application is a static/PWA web interface with tax calculators and a local Python server.
- Cloudflare Worker `worker/index.mjs` implements a single Uganda tax information chat assistant using Gemini and reviewed evidence notes, not a multi-agent orchestration system.
- `worker/knowledge.mjs` exposes `retrieveKnowledge(question)`, guidance notes, case notes, source links, and calculator suggestions.
- The notes include some FY 2026/27 rate claims and secondary sources. **These claims have not been independently verified in this development task** and must not become examination answer keys.
- Worker has a configured origin restriction and rate limiter. Do not weaken them or expose new privileged endpoints.

## What is now connected
`academy/knowledge_bridge.mjs` imports the **real** `retrieveKnowledge` implementation from the existing Worker. It offers an offline, simulation-only JSON interface that returns candidate notes/sources without asserting that they are current law or professional advice.

This is **real code-level retrieval integration**, but it is **not** a running AI specialist, a trained model, or an integration into the live chat. It does not call Gemini or any external service.

## Verify locally
```bash
node --test academy/tests/knowledge_bridge.test.mjs
echo '{"mode":"simulation_only","agent_id":"TAX-03","scenario":"VAT input tax EFRIS invoices"}' | node academy/knowledge_bridge.mjs
```

Next: independently verify Ugandan legal source material, implement an agent orchestration layer behind staging authentication, add explicit evaluator schemas and real model assessment, and seek human sign-off before any production merge or deployment.
