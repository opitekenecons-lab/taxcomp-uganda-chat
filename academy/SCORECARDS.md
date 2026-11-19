# TaxComp AI Academy scorecards

The offline scorecard utility aggregates actual examination runner results by specialist agent. It never grants a credential or production permission, including for a 100% pass rate.

Run:
```bash
python -m academy.agent_runner --cases academy/cases/foundation.json --output academy-results.json -- python staging_agent.py
python -m academy.scorecards academy-results.json --output academy-scorecards.json
```

The runner command above requires a real, separately supplied `staging_agent.py`; no such working model is provided by the Academy.

An independently reviewed case count is **not inferred** from agent claims. It is zero unless the caller explicitly provides independently validated case IDs to the Python function. No passing grade, competency certificate, or deployment authorization is inferred from scores. Use only synthetic data until secure infrastructure and reviewer controls are verified.
