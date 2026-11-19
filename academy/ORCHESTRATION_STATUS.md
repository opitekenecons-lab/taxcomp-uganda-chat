# AI Tax Academy orchestration status

The registry defines all 18 specialist role identifiers. The staging-only `routeSimulation` function routes synthetic questions to a specialist plus the research role and a **pending** QA review. It imports the real TaxComp `worker/knowledge.mjs` through the Academy bridge.

This is **not** an AI multi-agent system yet: there are no autonomous model calls, trained agents, tax computations, live legal-source validation, client access, professional sign-offs or URA submissions. The QA role is a placeholder and does not review answers. The routing heuristic is deliberately simple and can select the wrong specialist.

Run locally:
```bash
node --test academy/tests/*.test.mjs
```

Next steps: authenticate a staging-only service, integrate an actual model behind least-privilege tool controls, independently verify Uganda law and tax periods, run scored cases, and require human approval before any production deployment.
