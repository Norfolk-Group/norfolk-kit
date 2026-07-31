# 0012 — Naming orchestrators, agents, specialists and minions

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Ricardo
**Prior art:** `src/lib/agent-taxonomy.ts` (built for H-Analytics; this record generalises it rather than replacing it)

## Decision

Every project uses the same four-tier vocabulary and the same naming register. The rules below are not style preferences — they are what lets a user build one mental model and carry it between apps.

### The tiers

| Tier | What it is | Visible to users? |
|---|---|---|
| **Orchestrator** | Owns an outcome. Decides what happens and in what order. Delegates; rarely does the work itself. | Yes, prominently |
| **Agent** | Does one kind of work well. Named, addressable, has a personality. A user can reasonably ask for one by name. | Yes |
| **Specialist** | An Agent scoped to a narrow domain, usually one of many peers under an Orchestrator (H-Analytics: 16 researchers under Gustavo). | Yes, usually as a group |
| **Team** | A named grouping of Agents working one part of a pipeline. | Yes |
| **Swarm** | The collective noun for many units running at once. A description, never a name. | Yes, as a label |
| **Minion** | Ephemeral worker. No personality, no name, exists for one unit of work. | **No — hidden by default** |

### The rules

1. **People get human first names. Systems get thing-names.** Gustavo, Marco, Rebecca, Iris, Costantino, Giorgio, Pietro, Vito, Valentina are agents — they have a name because a user might address them. "The Analyst" and "Slide Factory" are systems — capabilities, not colleagues. Never a human name for a system, never a product name for an agent.

2. **The register is Italian first names, and it stays that way.** Not decoration — consistency is what makes the cast feel like one company rather than a pile of features. A new agent takes an Italian first name that no existing agent has.

3. **Label format is `<Name> · <Role>`.** "Gustavo · Analyst Orchestrator". The name carries recognition, the role carries meaning. Neither alone is enough — a name with no role is opaque to a new user, a role with no name is forgettable.

4. **Minions are never surfaced.** A user should never learn the word. If a minion's work needs reporting, its Orchestrator reports it. Exposing them turns a clean two-level mental model into an org chart nobody asked for.

5. **One source of truth per project: `src/lib/agent-taxonomy.ts`.** Every UI surface imports labels from it. **No hardcoded agent strings anywhere.** Renaming an agent must be a one-line change, because it will happen.

6. **A name is a promise of continuity.** Rebecca means the same thing in every app she appears in. Reusing a name for a different job is worse than inventing one — it breaks the model the user built.

## Why this is worth a rule

Ricardo asked for this directly (2026-07-31). The reason it earns a decision record rather than a style note: these names appear in the UI, in animations, in reports, and in conversation with the copilot. Inconsistency shows up in front of clients and investors, and it is precisely the kind of thing that is trivial to hold from the start and tedious to correct later — every hardcoded string, every screenshot, every exported report.

Rule 5 is the load-bearing one. The others describe intent; rule 5 is what makes intent survivable.

## Consequences

- The copilot in the current architecture ([R27–R32](../brainstorms/2026-07-31-copilot-and-parity-requirements.md)) already has a name: **Rebecca · AI Co-Pilot**, per the existing taxonomy. New projects reuse her rather than inventing a copilot per app.
- `agent-taxonomy.ts` is currently under `src/**`, which is excluded from the default equip payload. It should ship with the copilot module when that exists, not before — a taxonomy with no agents in the app is clutter.

## Open, not decided here

The **animation naming system** remains unchosen — two fully specified candidates ("Opificio", Italian workshop register; "Bateria", Afro-Brazilian percussion register) were prepared and never picked. Note the tension this record creates: rule 2 fixes the *agent* register as Italian, which makes Opificio the consistent choice and Bateria a deliberate contrast. Still Ricardo's call, but it is no longer a free choice — it either matches the agents or deliberately does not.

## What this rules out

- **Cute system names for agents** ("Docbot", "ChartGPT") — breaks rule 1 and ages badly.
- **Numbered agents** ("Agent 3") — no recognition, no continuity, nothing for a user to hold on to.
- **Per-app copilot names.** One copilot identity across the portfolio; see rule 6.
