---
trigger: always_on
---

---
name: challenge
description: Run the critical_thinker agent to pressure-test a plan, decision, or idea before implementing. Surfaces assumptions, the strongest objection, alternatives, and the cheapest decisive test.
---

# /challenge — pressure-test before building

1. Take the current proposition (problem framing, architect plan, or decision).
2. Hand it to the `critical_thinker` agent.
3. Return: restated proposition, tagged assumptions, ranked objections (blocking first), a better alternative if any, the cheapest decisive test, and a verdict (proceed / proceed-with-changes / reconsider).

Run this BETWEEN architecture and implementation. If the verdict is "reconsider", loop back to `architect` before any code is written.
