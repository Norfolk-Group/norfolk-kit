# Docs Index

**Tier: CONTRACT** · Last verified: 2026-08-05

This is a **router, not a summary** for the Kit implementation. Find the row matching the change you're about to make and read those files first. The private Norfolk AI Product OS candidate owns universal doctrine and wins cross-repository conflicts. Legacy universal policy in Kit is being replaced with concise implementation notes and must not be treated as a second editable canon.

## Route by change type

| You are changing… | Read first |
|---|---|
| UI, styling, components, layout, motion | `design-system.md` · `artifacts/` |
| Database schema, migrations, data model | `architecture.md` · `decisions/0003-*` |
| API surface, tRPC procedures, MCP tools | `api.md` · `architecture.md` |
| Auth, sessions, roles, permissions | `security.md` · `decisions/` (auth records) |
| File upload/download, storage, video | `decisions/0002-presigned-direct-uploads.md` |
| Money, fees, returns, investor-facing math | `business-logic.md` — **and full review panel** |
| Deployment, environments, secrets | `config-and-env-map.md` |
| Anything, if it contradicts a documented decision | `decisions/` — surface the conflict, don't resolve it silently |

## Files

| File | Tier | Covers |
|---|---|---|
| `SYSTEM-GOVERNANCE-RULE.md` | CONTRACT | How docs govern changes; precedence; tiers; enforcement |
| `architecture.md` | CONTRACT | System structure, data flow, infrastructure, constraints |
| `business-logic.md` | CONTRACT | Domain rules, workflows, roles, edge cases |
| `api.md` | CONTRACT | Procedures, inputs/outputs, authz, error handling |
| `design-system.md` | CONTRACT | Visual foundations, components, layout, UX, forbidden patterns |
| `security.md` | CONTRACT | Auth, sessions, permissions, data handling, threat notes |
| `config-and-env-map.md` | REFERENCE | Doppler keys by name, environments, deploy wiring |
| `decisions/` | CONTRACT | One record per decision — includes what each rules out |
| `plans/` | REFERENCE | Active plans; `plans/archive/` for superseded ones |
| `artifacts/` | REFERENCE | Generated HTML: components, motion, icons, architecture, navigation |

## Tiers

- **CONTRACT** — binding. Deviating requires explicit owner approval.
- **REFERENCE** — explanatory. Keep accurate, update freely, no approval needed.

Only CONTRACT files gate a change.

## Conventions

- Every file declares its tier and `Last verified: YYYY-MM-DD` at the top.
- A CONTRACT file unverified for 90+ days is flagged for review, not auto-trusted.
- Decisions are append-only: never edit an accepted record to reflect a new choice — write a new one and mark the old `Superseded by`.
- Plans are named `YYYY-MM-DD-<name>.md`, updated as work progresses, moved to `plans/archive/` when done.
- Never put a credential in any file here. Reference the Doppler key *name*.
