# AI Tax Academy: initial executable evaluation scaffold

This is a **training and testing harness**, not a deployed or trained agent system.

Run from repository root with Python 3.10+:

```bash
python -m unittest discover -s academy/tests -v
python -m academy.evaluator academy/cases/foundation.json path/to/agent-submissions.json
```

The example cases deliberately test accounting arithmetic and research-source discipline **without asserting unverified Uganda tax rates**. A passing result does not confer CPA status, tax-agent registration, professional competence, or permission to advise clients.

Agent submissions are a JSON object keyed by case ID, containing `agent_id` and the requested answer fields. A legal research answer must include an `authorities` array with `title`, `url`, `effective_from`, and `verified_by_human: true`. The evaluator only checks metadata presence, not authenticity; human source verification is mandatory and must be performed outside this scaffold.

Next: inspect actual TaxComp application structure, integrate an agent adapter, create independently validated Uganda tax cases, and add evidence-backed scoring, permissions and reviewer workflows. No production integration has been performed.
