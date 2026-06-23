---
trigger: always_on
---

---
name: review
description: Run the four reviewers (QA, security, SRE, client-critic) in parallel on the current change and return a single consolidated, deduplicated findings report.
---

# /review — parallel review fan-out

1. Identify the change under review (current diff / specified files).
2. Run these read-only agents IN PARALLEL on the same change:
   - `qa` — correctness, edge cases, test coverage.
   - `security` — vulnerabilities, secrets, unsafe patterns.
   - `sre` — performance, failure modes, observability, deploy/rollback.
   - `client_critic` — does it meet the client's real intent? UX/clarity.
3. Merge their outputs into ONE report:
   - Deduplicate findings that share a root cause.
   - Sort by severity (blocker/critical → major/high → minor/low).
   - For each: title, location, why it matters, suggested direction (not a patch).
4. End with a single verdict: SHIP / SHIP WITH FIXES / DO NOT SHIP, and the top 3 things to fix first.

Reviewers never edit code. If fixes are needed, hand the consolidated report to `fix_developer`.
