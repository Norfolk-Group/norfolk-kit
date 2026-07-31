# 0014 — Agentic-native architecture, and never being locked to one model vendor

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Ricardo
**Supersedes:** decision 1 of [0013](0013-agent-runtime-tool-runner-on-railway.md)
**Ricardo, 2026-07-31:** *"The most important architecture decision is that all apps must be agentic native architected apps and I know CMA is king of that but I will forever depend on Anthropic so I will need choices depending on the app. Agents also need to learn and get better."*

## Decisions

1. **Every app is agentic-native.** Not "has an AI feature" — architected so an agent is a first-class user of the system.
2. **No lock-in to one model vendor.** The agent loop runs through a provider-agnostic layer. Swapping models is configuration, not a rewrite.
3. **Agents must be able to learn.** An app's agent should get better with use, not perform identically on day 400 as on day 1.

## 1. Agentic-native — and why it is already decided

This is the same rule as R26, arrived at from the other direction.

**Agentic-native means: every capability is a callable procedure, and an agent is not a second-class caller.** A screen that reaches past that layer is not just untidy — it is a capability the agent can never have. Ricardo's own phrase, *"create once and use many,"* is the whole architecture in four words.

Recording it here as the *most important* decision is the right weight. It is the one choice that cannot be retrofitted: everything else on this list can be added later at reasonable cost. Agentic-native cannot. An app built without it is rebuilt, not upgraded.

**Nothing new to build.** tRPC is the layer, the constraint is already binding, the Manual app is the first thing built under it.

## 2. Model portability — this reverses yesterday's runtime choice

### The conflict

[0013](0013-agent-runtime-tool-runner-on-railway.md) chose **Tool Runner**, an Anthropic SDK feature. It was the smallest thing that worked and it works only with Anthropic models. Ricardo's requirement makes that unacceptable — and he is right to insist. Frontier model leadership has changed hands repeatedly, and an app that can only run one vendor's models inherits that vendor's pricing, availability, and roadmap permanently.

### The decision — corrected once more, and this is the version that holds

Ricardo clarified within the hour, and the clarification is sharper than the original:

> *"do not rule out CMA because I'd rather not depend on Anthropic. Most apps will run very seldomly so dependence is no big deal. What I fear is that OpenAI or KIMI will have a better SDK and I won't be able to change."*

**The fear is SDK lock-in, not model lock-in.** Those need opposite responses, which is why the first two attempts at this decision were both wrong.

A provider-agnostic wrapper protects against *model* switching. It does nothing about the scenario Ricardo actually fears — a materially better agent framework appearing from OpenAI, Moonshot, or someone not yet named. In that case a wrapper is not a shield; it is one more thing to tear out.

**What actually protects against it is already built: the tools are not owned by the runtime.**

Under agentic-native (decision 1), every capability lives in a tRPC procedure. The agent runtime is glue — a few hundred lines that hand Claude a tool list, run the loop, and stream results. Rewrite that glue for a new SDK and **every capability survives untouched**, because the capabilities were never inside the SDK.

That is the whole protection. It is structural, it is free, and it is the same rule as "create once, use many."

### Therefore: the runtime is a deliberately late, deliberately cheap decision

| | Cost to change later |
|---|---|
| Agentic-native architecture | Rebuild the app |
| Tool definitions (tRPC procedures) | They *are* the app |
| **Agent runtime / SDK** | **A few hundred lines of glue** |

This record has now changed its runtime answer twice in one day — Tool Runner, then AI SDK, now this — each time correctly, given new information. That is the signal: **it is the wrong decision to be making now.** It is the cheapest thing on the list to change and the most sensitive to information we do not yet have.

**Decision: no runtime is chosen until an app needs one.** Build the tools. Keep the glue thin and quarantined in one file. Choose the SDK when there is something to run, and re-choose it freely whenever a better one appears — because it will.

**CMA (Claude Managed Agents) is explicitly NOT ruled out.** [0013](0013-agent-runtime-tool-runner-on-railway.md) deferred it partly on per-session cost, which assumed steady interactive use. Ricardo's "most apps will run very seldomly" removes that objection entirely: $0.08 per session-hour, billed only while actually running, is negligible for an app used a few times a week — and it buys away sandbox and infrastructure work. For low-traffic, occasionally-run apps it may well be the *best* option, not merely an acceptable one.

The AI SDK remains the client-side choice (`useChat`, data-not-components). That is a UI decision and unaffected by any of this.

### Why "choices depending on the app" is the sharper requirement

Ricardo did not only ask to avoid lock-in — he asked for **per-app model choice**. Different apps have different economics: an investor portal answering a few careful questions a day should use the strongest model available; a high-volume internal tool should not. He already runs eight model launchers locally for exactly this reason (decision 0010).

So the model is **configuration, per app, per task** — not a constant compiled into the architecture. This also means the fleet doctrine he already applies to development applies to production.

### What this does NOT mean

- **Not lowest-common-denominator.** An app may use provider-specific capability where it genuinely wins. The requirement is that switching costs a change, not a rewrite.
- **Not a self-built abstraction.** R32 was explicit about not hand-coding plumbing. Use the SDK's layer; do not invent one.

## 3. Agents that learn — the honest state of this

Ricardo: *"Agents also need to learn and get better. I used Pinecone in the past and they had the beginnings of that. Seems like every frontier model is working on something like that, like Dreaming."*

### What we can build today, with what is already in the stack

**Nothing new is needed to start.** Decision [0007](0007-voyage-embeddings.md) chose Voyage embeddings and pgvector on Neon. That is the same capability Pinecone provides — vector storage and retrieval — without a fourth data store. Pinecone was the right tool when it was the only tool; it is now a hosted version of something Postgres does natively.

Three levels, in increasing order of ambition and decreasing order of certainty:

1. **Retrieval memory** *(buildable now)* — the agent recalls prior conversations, documents, and decisions relevant to what is being asked. Embeddings in pgvector. This is what most "learning" in shipped products actually is, and it is genuinely valuable.
2. **Corrective memory** *(buildable now, needs design)* — when a user corrects the agent, the correction persists and applies next time. Cheap, high-impact, and the thing users actually notice. Interacts with the designer agent's contract problem ([R36](../brainstorms/2026-07-31-designer-agent-requirements.md)) — the same class of fix: a written record beats a fresh derivation.
3. **Consolidation / offline improvement** *(research territory)* — the agent reflects between sessions and reorganises what it knows.

### On "Dreaming" — flagged, not assumed

**I do not know what specific product Ricardo means, and I am not going to guess.** There is genuine active research on memory consolidation and offline/idle-time computation, and the term may refer to a specific frontier product, a research paper, or a general description. Given the standing rule to verify rather than recall — created after fabricating a package name — this needs checking against sources before anything is designed around it.

**Action:** confirm what "Dreaming" refers to before level 3 is planned.

### The sequencing point

Levels 1 and 2 are buildable with the current stack and deliver most of the felt value. Level 3 is a research bet. Building 1 and 2 does not block 3, and doing them first means the memory substrate exists whenever 3 becomes real.

## What this rules out

- **Any architecture where the agent is bolted on after the UI.** The one irreversible mistake.
- **Model names hardcoded in application logic.** Model choice is configuration.
- **Adding Pinecone.** pgvector + Voyage covers it without a fourth data store (see [0007](0007-voyage-embeddings.md), [0001](0001-core-stack.md)).
- **Designing around "Dreaming" before confirming what it is.**
