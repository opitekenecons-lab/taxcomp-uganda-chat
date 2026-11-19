# Examination blueprint coverage — all 18 specialist roles

The Academy now has one advanced **unscored** examination blueprint for each of its 18 registered specialist roles, across `advanced-blueprints.json` (five existing cases) and `specialist-blueprints.json` (13 additional cases).

These are **not validated legal exams**. All advanced blueprints require qualified human review, verified Ugandan primary legal sources, effective dates and reference answers before they can be scored or used to evaluate legal competence.

The foundation file contains separate synthetic arithmetic and evidence-handling exercises; those are not proof of Uganda tax-law competence.

The Node coverage test checks that every registered role has exactly one advanced blueprint and that no blueprint claims verified answers.

Run `node --test academy/tests/*.test.mjs` locally. No Claude session or API key is required. No production deployment, filing, professional certification or client advice is authorized.
