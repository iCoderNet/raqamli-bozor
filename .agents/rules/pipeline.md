---
trigger: always_on
---

---
name: pipeline
description: Run the full delivery pipeline end-to-end — research, architecture, implementation, parallel review, fix, and docs. Use for non-trivial features or changes.
---

# /pipeline — full delivery flow

Orchestrate the change through every stage. Skip a stage only if it is clearly unnecessary, and say so.

1. **Research (parallel ×2).** Spawn two `researcher` agents with NON-overlapping lanes — e.g. researcher-1 = this codebase, researcher-2 = web/docs/prior art. Collect both briefs.
2. **Architecture.** Hand the briefs to `architect`. Get an ADR-lite + a numbered, file-level implementation plan with a test strategy.
3. **Implementation.** Hand the plan to `developer` (the only code writer). It implements step by step and keeps build + tests green.
4. **Review (parallel ×4).** Run `qa`, `security`, `sre`, and `client_critic` together on the diff. Each returns severity-tagged findings.
5. **Fix.** Hand all findings to `fix_developer`. It deduplicates, fixes blockers/critical first, adds regression tests, re-verifies.
6. **Docs.** Hand the final, fixed change to `documentation` for README / API / CHANGELOG / runbook updates.

Report a one-paragraph summary per stage. Stop and surface any blocker immediately instead of pushing through.
