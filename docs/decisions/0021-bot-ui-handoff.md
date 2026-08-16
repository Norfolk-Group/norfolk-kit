# 0021 — Bot UI handoff: kit contract in, ZIP/HTML/Figma-link out, no parallel style

**Date:** 2026-08-16 · **Status:** Proposed

## Decision

Bots inherit the kit. A bot that produces UI delivers one of:

1. **Kit-faithful implementation** — code that follows `design-system.md` and passes kit gates.
2. **Handoff packet** — a structured artifact for a human or downstream agent to implement.
3. **CONTRACT patch** — a proposed change to `design-system.md` or this ADR, routed to Marco.

A pretty canvas is not a handoff.

---

## Owners

| Role | Owns |
|---|---|
| **Marco** | CONTRACT + broadcast. Design-system changes require Marco's approval. |
| **Livia** | Bot dashboard quality + proposed CONTRACT text. Reviews handoff packets. |
| **Product agents** | Domain results, not chrome. Deliver data and logic; defer UI to kit. |

---

## Handoff packet structure

A valid handoff packet contains:

1. **Surface kind** — focus (composer, form, single record) vs scan (list, table, dashboard). This determines density and layout rules per `design-system.md`.

2. **Kit binding** — explicit reference to which kit tokens, components, and patterns apply.

3. **One primary artifact**, one of:
   - Figma selection URL with `node-id` (required — plain file URL is insufficient)
   - Claude Design ZIP/HTML
   - Paper twin
   - Product PR (code implementing kit-faithful UI)

---

## Not a handoff

These do not qualify as handoff artifacts:

- PNG-as-PDF
- Replit-as-app
- Lovable/Relume/Framer dashboard
- Design MCP fetch (broken as of 2026-08, per 0020)
- "Looks like the kit" without explicit token binding

---

## Figma workflow

Authorize `https://mcp.figma.com/mcp` then use `figma-implement-motion` / `figma-use-motion`.

`Failed to load` is not `needsAuth` — do not retry authentication on load failure.

---

## Reports follow export-output-contract.md

Reports are documents, not screens. They follow the export contract, not this handoff protocol.

---

## Shell furniture

Shell components (sidebar, navigation, copilot column) follow 0017.

---

## Reference rows

| Reference | Status |
|---|---|
| Cloudflare copilot | ❌ not examined — stays blank |
| Codex IDE | ❌ not examined — stays blank |

These rows remain blank until examined. Do not fill with assumptions.

---

## First-wave kit-bare

Projects adopting kit governance with minimal UI burden:

- H-Analytics
- FAA
- Tuzman-Monitor
- obra-pia-team-portal
- saas-and-ai-vendor-expense

Adoption via `equip` + `kit-guard`.

---

## PR requirement

Every PR that touches UI must include:

```
Docs consulted: design-system.md, 0020, 0021, [others as relevant]
```

---

## Do not rewrite AGENTS.md src tree

The `Structure` section in AGENTS.md lists `src/procedures` + `src/db` while code uses `src/capabilities` + `src/adapters`. This is a **FINDING only** — flag it, do not "fix" it in a governance PR.

---

## Bounce rules

- Skip `design-system.md` changes → bounce to CONTRACT/Marco.
- Do not restyle from scratch → follow kit.
- Bounce other bots to 0020/0021 **only after this PR lands**.

---

## Why

1. **Design drift is expensive.** Every bot that invents its own styling creates integration work and visual inconsistency. The kit exists to prevent this.

2. **Handoff requires structure.** A screenshot or a "looks good" prototype cannot be implemented without reverse-engineering intent. The handoff packet makes intent explicit.

3. **Pretty is not done.** A polished canvas that does not bind to kit tokens is a design exploration, not a deliverable.

4. **Owners prevent committee.** Marco owns CONTRACT; Livia reviews quality; product agents deliver domain value. Clear ownership prevents design-by-argument.

## Consequences

- Bots that produce UI must choose: implement (kit-faithful), hand off (packet), or propose (CONTRACT patch).
- Handoff packets have a required structure; incomplete packets are rejected.
- UI PRs require explicit `Docs consulted` lines.
- Unexamined design references stay blank — no assumptions.
- First-wave projects adopt via `equip` + `kit-guard`.

## What this rules out

- Bots inventing UI styles outside the kit.
- Treating a pretty prototype as a handoff.
- Filling design-reference rows without examination.
- Merging UI PRs without `Docs consulted`.
- Using Lovable/Relume/Framer for dashboards.
- Running Replit prototypes as production apps.

## Reversal conditions

- If the kit proves too restrictive for a legitimate product need, propose a CONTRACT patch to Marco — do not work around it.
- If a design tool demonstrates reliable kit-token output, it may be added as an approved handoff source via ADR amendment.
