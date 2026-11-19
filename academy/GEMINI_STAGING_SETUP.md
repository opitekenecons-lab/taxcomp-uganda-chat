# Gemini staging adapter — configuration and limits

`academy/gemini_staging.mjs` is a **server-side, simulation-only** integration with the Gemini generateContent API. It uses the existing TaxComp knowledge bridge, specialist router and review-only draft gate.

- No API key has been supplied or deployed by this change.
- No live model call has been performed; automated tests use a mocked fetch implementation.
- Do not put the API key in browser code, GitHub commits, CI logs or client messages. Provide it only as a secret in a private staging runtime.
- This adapter is **not an authenticated HTTP endpoint**. Do not expose it publicly until staging authentication, rate limits, usage caps and audit logs are independently implemented and tested.
- It grants no agent any tools for URA filings, outbound messaging, payments or deployment.
- A model-produced draft must be independently verified for current primary Uganda law, effective dates, arithmetic and case holdings before professional use.
- This is not CPA certification or tax-agent registration.

Tests: `node --test academy/tests/*.test.mjs`.

To run real model assessments later, use an authenticated private staging backend that supplies `apiKey` from a secret store and invokes `assessInStaging({scenario, apiKey})`; do not expose the raw model function to untrusted users.
