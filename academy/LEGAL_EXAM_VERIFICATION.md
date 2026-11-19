# Legal examination answer-key gate

The new `assess_readiness(blueprint, answer_key)` validates required answer-key fields, source metadata, reviewer attestation fields and tax-period dates before a case can enter **manual** validation.

**Crucially, metadata completeness is not legal verification.** A plausible URL, reviewer name or qualification string can be fabricated. Even when `ready_for_manual_validation` is true, `scoring_enabled` remains false. There is no automatic mechanism to enable grading, professional certification or production deployment.

Qualified reviewers must independently check official Uganda legal text, amendments, commencement, applicability, tax-period boundaries, legal interpretation and reference calculations. Only then can a separate authenticated approval and scoring process be designed.

The examples in tests use fake reviewer details and placeholder URLs solely to test structure. They are not authorities or legal conclusions.

Run offline: `python -m unittest discover -s academy/tests -v`. Claude access is not required.
