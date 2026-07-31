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

### The decision

**The agent loop runs through the Vercel AI SDK's provider-agnostic layer** — already in the stack (v7, `ai` + `@ai-sdk/react`, with a first-class `Agent` abstraction since v6). Same process, same tools, swappable model.

| | Tool Runner | AI SDK |
|---|---|---|
| Providers | Anthropic only | Anthropic, OpenAI, Google, and others behind one interface |
| Loop | Handled | Handled |
| Client streaming | Roll your own | `useChat`, already chosen |
| Cost of switching model | Rewrite the loop | Change a line |

The AI SDK is a slightly thicker abstraction. That is the price of the requirement, it is small, and it is worth paying.

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
