# Staging model adapter

`assessWithModel` accepts an **injected trusted function** and returns a draft for human review. It connects to the existing TaxComp knowledge retrieval and the 18-role simulation router. It does not configure Gemini or make API calls itself.

## Example (synthetic, not a real LLM)
```js
import { assessWithModel } from "./academy/model_adapter.mjs";
const result = await assessWithModel({
  scenario: "VAT input tax evidence for a hypothetical Ugandan business",
  model: async ({ scenario }) => ({ draft: `Review facts for: ${scenario}` })
});
console.log(result.status);
```

## Safety and release requirements
- Keep the adapter in private staging; it is not a public API.
- Implement actual model invocation only in an authenticated, rate-limited staging backend, with explicit egress restrictions and least-privilege secrets.
- The prompt's prohibition of external actions is **not** a security boundary; the model must never receive tools or credentials for URA submissions, messaging, payments or deployment.
- Validate citations and effective dates independently. Do not treat the existing knowledge summaries as enacted law or as examination answer keys.
- The `model_draft` field is unverified text and cannot be automatically published or sent.
- The adapter does not make the agent qualified, licensed, or certified.
- Run the test suite and benchmark against practitioner-reviewed answer keys before considering production.
