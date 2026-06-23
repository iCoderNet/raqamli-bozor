---
trigger: always_on
---

---
name: research
description: Kick off two parallel researchers on a question and return a single merged, source-cited findings brief. Use before planning anything non-trivial.
---

# /research — parallel research

1. Restate the question in one line and split it into two non-overlapping lanes (e.g. internal codebase vs. external web/docs).
2. Spawn two `researcher` agents, one per lane, in parallel.
3. Merge their briefs into one, removing duplicates and resolving any contradictions (note which source wins and why).
4. Output: Question · Key findings (with sources) · Constraints & risks · Open questions · Sources.

No implementation, no design decisions — this stage only gathers facts for `architect`.
