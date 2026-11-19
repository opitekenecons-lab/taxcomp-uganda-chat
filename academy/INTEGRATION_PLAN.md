# TaxComp agent integration checklist

**Current state:** Evaluation harness and executable adapter are committed, but no real TaxComp agent has been connected or trained. No production changes.

## Agent interface
Implement a staging-only executable accepting JSON on stdin:
- `mode: simulation_only`
- `case_id`, `agent_id`, `scenario`, `required_fields`
- `forbidden_actions`: submission, client advice, external messages, payments

Return JSON on stdout with `agent_id` and case-specific outputs. Errors should be returned as JSON, not secrets or stack traces.

## Next engineering tasks
1. Identify actual application entrypoints and deployment architecture before modifying any existing TaxComp components.
2. Wire a staging-only agent adapter using least-privilege credentials and an outbound-action denylist enforced by the host, not just prompt instructions.
3. Build a primary-source registry with URL, law/version, commencement, tax period and independent reviewer.
4. Commission reference answers from a qualified Ugandan tax practitioner for CIT/VAT/PAYE/WHT/IAS 12.
5. Expand cases to cover adverse evidence, ambiguous periods, fraud attempts, and invented citations.
6. Implement independent citation validation. The current evaluator only checks fields, and cannot authenticate an agent's `verified_by_human` claim.
7. Run automated tests and actual agent evaluations in CI; attach immutable evidence and reviewer decisions.
8. Seek MD approval before merging, production deployment, client outreach or filings.

## Commands
```bash
python -m unittest discover -s academy/tests -v
python -m academy.agent_runner --cases academy/cases/foundation.json --output academy-results.json -- python path/to/staging_agent.py
```

**Security:** Running arbitrary executables is unsafe unless the command is trusted and sandboxed. The adapter is a developer-only tool, not a remotely exposed API. Do not provide customer data, URA credentials, or production API keys.
