# Opitekene AI Tax Professional Academy — v0.1

Status: DESIGN / NOT TRAINED / NOT CERTIFIED. Development branch only. No production changes.

## Purpose
Develop and evaluate 18 specialist TaxComp agents against CPA(U)-informed accounting competencies and advanced Uganda tax-advisory tasks. These are software agents, NOT licensed CPAs, tax agents, lawyers, or independent signatories.

## Common foundation for every agent
1. Financial accounting: double entry, ledgers, accruals, reconciliations, controls.
2. Financial reporting: IFRS/IAS, including IAS 12, recognition, disclosure, and reconciliations.
3. Auditing and assurance concepts: evidence, risk, materiality, skepticism, ethics (not audit opinion issuance).
4. Business and company law, governance, financial management and professional ethics.
5. Uganda tax administration: TIN, registrations, returns, payment, objection workflow, confidentiality.
6. Research discipline: verified statutory text, amendments, commencement dates, applicable periods, case law, official URA guidance.
7. Numerical discipline: deterministic, versioned calculators; cross-footing; reconciliation; edge-case tests.
8. Client work: engagement scope, evidence inventory, working papers, peer challenge, final human approval.

Reference curriculum: ICPAU 2026 CPA brochure (2023–2027 syllabus), especially Papers 1, 5, 7, 9, 11, 12, 16, 17 and 18.
https://www.icpau.co.ug/sites/default/files/downloads/2026%20Students%27%20CPA%20brochure%20-%20Tertiary%20Institutuions.pdf

## Specialist tracks (18)
| ID | Agent | Advanced practical examination |
|---|---|---|
| TAX-01 | Chief Tax Officer | Integrate multi-tax client engagement; prioritize risks; coordinate reviewers |
| TAX-02 | Corporate Income Tax Accountant | Reconcile profit to taxable income, capital allowances, losses, credits |
| TAX-03 | VAT Accountant | Reconcile input/output VAT, exemptions, zero-rating, adjustments |
| TAX-04 | EFRIS Specialist | Match invoice and ledger populations; exception register |
| TAX-05 | PAYE Accountant | Payroll reconciliation, taxable benefits, withholding and reporting |
| TAX-06 | WHT Accountant | Withholding events, certificates, tax credits and exceptions |
| TAX-07 | International Tax Specialist | Cross-border tax characterization, treaty and PE research |
| TAX-08 | Transfer Pricing Specialist | Related-party mapping, comparability and documentation gaps |
| TAX-09 | Customs & Excise Accountant | Classification research, valuation and duty scenarios |
| TAX-10 | Rental & Property Tax Accountant | Rental-income schedules, property-related obligations |
| TAX-11 | SME Tax Accountant | Taxpayer segmentation, presumptive-tax eligibility and registration |
| TAX-12 | Tax Audit Specialist | Tax health check with traceable findings and evidence |
| TAX-13 | Tax Dispute Specialist | URA assessment review, objection evidence and deadline analysis |
| TAX-14 | Tax Planning Specialist | Compare lawful scenarios, risks, assumptions and effective dates |
| TAX-15 | Tax Research Specialist | Source-verified opinion with quotations, links and date applicability |
| TAX-16 | Tax Compliance Manager | Client obligation calendar, dependencies and deadline escalation |
| TAX-17 | Tax Financial Reporting Specialist | IAS 12 current/deferred tax and disclosure workpapers |
| TAX-18 | Tax QA Reviewer | Independently challenge all of the above, reject unsupported claims |

## Assessment framework
- Stage A: closed-book diagnostic against independently prepared reference answers.
- Stage B: open-source research and interpretation exercises, with primary source citations.
- Stage C: numerical and accounting casework with deterministic reference results.
- Stage D: adversarial tests: conflicting documents, outdated tax rates, forged citations, missing evidence, prompt injection.
- Stage E: supervised end-to-end simulated client cases.
- Stage F: limited, authorized real-world pilot only after security/legal approval.

## Release gates
- 100% of material statutory/case citations independently verifiable.
- 100% pass of critical deterministic calculation regression tests.
- Zero unauthorized disclosure, filings, client outreach, payments, or final professional opinions.
- Mandatory human review of client deliverables; qualified professional sign-off when required.
- All unresolved ambiguity surfaced as exceptions, never silently guessed.
- Full reproducibility: model/prompt version, source version, tax period, calculator version, input hashes, reviewer decision.
- A documented benchmark score threshold for non-critical tasks, established before testing, with independent review.
- A failed critical case blocks promotion and triggers remediation/retest.

## Architecture and security
- Versioned legal-source repository with provenance and effective dates.
- Deterministic tax computation service; LLMs may explain but not invent tax rules.
- Per-client row-level security, private encrypted storage, least-privilege tool access.
- Task orchestrator with agent registry, work queues, structured outputs, retry limits, human approval gates.
- Separate preparer and QA reviewer; no self-approval.
- Prompt injection defenses and untrusted-document isolation.
- Staging-only initially. No production deployment or external messages without MD approval.

## First training sprint
1. Inventory existing TaxComp agent/code structure and tax-rule coverage.
2. Assemble legally sourced, effective-date-indexed Uganda tax knowledge corpus.
3. Prepare 10 independently solved benchmark cases each for CIT, VAT, PAYE, WHT, research and QA.
4. Implement evaluation harness with numerical assertions, citation checks and access-control tests.
5. Run baseline; record failures; improve prompts/tools/rules; rerun until gates pass.
6. Report per-agent status: Not Started / In Training / Failed / Passed Simulation / Pilot Approved / Production Approved.

## Governance
Managing Director controls strategic priorities and releases. Statutory or regulated professional approvals remain with legally eligible humans. AI must never claim to hold CPA, ICPAU membership or URA tax-agent registration.

Sources:
- ICPAU syllabus: https://www.icpau.co.ug/sites/default/files/downloads/2026%20Students%27%20CPA%20brochure%20-%20Tertiary%20Institutuions.pdf
- URA tax agents: https://ura.go.ug/en/tax-agents-registration/
- URA FAQ: https://ura.go.ug/en/dt-faqs/
