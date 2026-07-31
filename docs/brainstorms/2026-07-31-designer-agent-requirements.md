---
date: 2026-07-31
topic: designer-agent
status: captured — with a reframe that changes what gets built
---

# The designer agent

## What was asked for

> "One gap in the process of creating apps is a designer agent. Imagine someone that would take care figuring out all the UI and UX of the app once I explain what I want. This human would have UX experience, would know Figma, would know Claude Design, and would know how to avoid AI Slop. Also would know about the million of details from login workflows, to tours, help and infotips, Admin section, preferences, modals, buttons, like a human who went to design school. I can do that but it takes too long and it seems like I am redoing the same thing over and over, and the AI frequently messes up something that was working ok."

## The reframe — read this before building anything

Two distinct pains are described, and they have different causes:

1. **"Redoing the same thing over and over."** A knowledge problem. The decisions exist only in Ricardo's head, so they are re-made from scratch each time.
2. **"The AI frequently messes up something that was working ok."** A **memory** problem, and a much more expensive one.

**A designer agent fixes the first and makes the second worse.**

An agent with taste but no record of prior decisions has *good* taste, freshly, every time. Asked to touch a screen, it re-derives choices that were already settled — and re-deriving is indistinguishable from breaking, because the thing that was working was a decision, not an accident. More capable agents regress harder here: they are more willing to improve what they find.

So the deliverable is not primarily a persona. It is:

> **A written design contract, an agent that must read it before touching UI, and a check that catches regressions.**

The agent is the delivery mechanism. The written contract is the fix. Build the persona alone and the second pain gets worse while feeling addressed.

### The gap that proves it

`docs/design-system.md` already exists in the kit — and is an **empty template**. Its own header reads *"Last verified: (set when first populated)"*. It is described as "the UI/UX source of truth… to prevent design drift, preserve intentional design decisions."

That file is exactly the fix, and nobody has filled it in. The pain being described is the direct, predictable consequence of an unpopulated design contract. **Populating it is the highest-value work here, and it does not need an agent to start.**

## Requirements

- **R36 — Design contract per project.** `docs/design-system.md`, populated, not a template. Every UI decision that has been made and should stay made. Read before any UI change; updated in the same PR when a change alters it (already mandated by the governance rule — currently unenforceable because the file is empty).
- **R37 — Designer agent.** A subagent that reads the contract, the brand, and the theme, then produces UI. Knows the standard furniture: login and recovery flows, empty states, loading states, error states, tours, infotips, admin sections, preferences, modals, confirmation vs destructive actions, form validation, focus order, keyboard paths. The "million details" a design graduate has internalised and an agent otherwise invents fresh each time.
- **R38 — Anti-regression.** A mechanism that makes "the AI changed something that was working" *visible before merge* rather than discovered later in use. Without this, R37 raises the rate of change and therefore the rate of unnoticed regression.
- **R39 — No AI slop, enforced not requested.** Ricardo's global rule already forbids it. The recurring failure modes are documented and specific (the same cream-and-terracotta palette, the same Inter/Space Grotesk pairing, emoji as section markers, everything centred, rounded cards with accent rails). A checklist an agent must answer against beats an instruction it may absorb.

## What already exists — inventory before building

| Asset | State |
|---|---|
| `docs/design-system.md` | In the kit, **empty template**. The gap. |
| `docs/design/animations/` | Component docs — real content |
| `artifact-design` skill | Live in Claude Code. Carries the anti-slop catalogue and a design-plan process. Prior art for R39. |
| Figma MCP | Connected. Read designs, write designs, Code Connect mapping. |
| shadcn MCP + 42 themes | Connected; see [themes.html](../artifacts/themes.html) |
| `norfolk.ai` | Ricardo has flagged it as carrying brand voice and character — unmined |
| Brand assets | 248 files in the kit |

Most of the machinery exists. What is missing is the written contract that tells it what to do.

## Sequencing — deliberately not "build the agent first"

1. **Populate `design-system.md` for one real project.** With Ricardo, once. Slow, and it is the thing that stops the repetition. Every subsequent project starts from a filled-in file rather than a blank one.
2. **Extract the reusable half into the kit** as a template with the universal decisions pre-made (focus states, error patterns, tap targets per R34, disclosure marks per R24a) and project-specific sections left blank.
3. **Then the agent** — because now it has something to read.
4. **Then anti-regression** — most valuable once the agent is changing things at speed.

Doing 3 before 1 produces a confident agent with no memory, which is the current situation with extra steps.

## Outstanding questions

### Resolve before planning
- **[Product] Is the designer agent one agent or two?** Deciding *what the experience should be* and *implementing it in components* are different skills; a human design team separates them. Recommendation: one agent, two modes — it must own the outcome, and splitting invites a handoff gap.
- **[Product] What is the agent's authority?** May it change an existing screen unasked if it violates the contract, or only flag it? Recommendation: flag, never silently change. Silent improvement is exactly the reported pain.

### Deferred to planning
- [Technical] How R38 detects regression — visual snapshots, a contract checklist per PR, or an adversarial reviewer agent. Interacts with the existing kit-guard pattern, which is the working precedent for machine-enforced rather than review-enforced.
- [Needs research] "Claude Design" — Ricardo has named it twice ("Claude Design 2 has wonderful templates"). Confirm exactly which product this is before designing around it.
- [Product] Where the designer agent sits: kit skill, subagent definition, or both.

## The naming question

Per decision [0012](../decisions/0012-naming-agents-orchestrators-specialists-minions.md), this agent needs an Italian first name and a role. It is an Agent, not an Orchestrator. Unassigned — Ricardo's call.
