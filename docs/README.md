# Docs Index

**Tier: CONTRACT** · Last verified: 2026-08-26

This is a **router, not a summary**. Start owner workflows at `OWNERS-GUIDE.md`.
Decision 0023 makes this repository the one Product OS and Starter Kit entry
point. Source/release cutover is still pending: preserve existing adopted
contracts and signed references, and surface conflicts rather than create a
second editable canon. See `consolidation.md` for verified migration blockers.

## Route by change type

| You are changing… | Read first |
|---|---|
| Starting, assessing or upgrading a project | `OWNERS-GUIDE.md` · `product-os-adoption.md` |
| Lifecycle, evaluation, testing or refactoring | `harness.md` · `../AGENTS.md` |
| Agent names, identities, roles or display overrides | `agent-naming.md` · `decisions/0012-*` |
| Repository roles, owner handbook or source consolidation | `decisions/0023-one-product-os-entry-point.md` · `consolidation.md` |
| UI, styling, components, layout, motion | `design-system.md` · `artifacts/` |
| Database schema, migrations, data model | `architecture.md` · `decisions/0003-*` |
| API surface, tRPC procedures, MCP tools | `api.md` · `architecture.md` |
| Auth, sessions, roles, permissions | `security.md` · `decisions/` (auth records) |
| File upload/download, storage, video | `decisions/0002-presigned-direct-uploads.md` |
| Money, fees, returns, investor-facing math | `business-logic.md` — **and full review panel** |
| Investor reports, PDF/HTML/DOCX/XLSX/CSV/PNG/PPTX exports | `export-output-contract.md` · `design-system.md` · `business-logic.md` |
| Admin-only named profiles (ICPs, fee cards, underwriting boxes) | `admin-catalog-contract.md` · `decisions/0022-*` |
| Deployment, environments, secrets | `config-and-env-map.md` |
| Anything, if it contradicts a documented decision | `decisions/` — surface the conflict, don't resolve it silently |
| Adopting or pinning a Product OS version | `product-os-adoption.md` |
| Brand marks, logos | `../brand/README.md` |

## Files

| File | Tier | Covers |
|---|---|---|
| `SYSTEM-GOVERNANCE-RULE.md` | CONTRACT | How docs govern changes; precedence; tiers; enforcement |
| `architecture.md` | CONTRACT | System structure, data flow, infrastructure, constraints |
| `business-logic.md` | CONTRACT | Domain rules, workflows, roles, edge cases |
| `api.md` | CONTRACT | Procedures, inputs/outputs, authz, error handling |
| `design-system.md` | CONTRACT | Visual foundations, components, layout, UX, forbidden patterns |
| `export-output-contract.md` | CONTRACT | Format-specific design, provenance, and verification for distributable reports |
| `admin-catalog-contract.md` | CONTRACT | Admin-gated named profiles: explained seeds, Admin wall, same procedures as chat |
| `security.md` | CONTRACT | Auth, sessions, permissions, data handling, threat notes |
| `config-and-env-map.md` | REFERENCE | Doppler keys by name, environments, deploy wiring |
| `decisions/` | CONTRACT | One record per decision — includes what each rules out |
| `decisions/0020-*` | CONTRACT | Figma and Claude Design are tools, not a second system (Accepted) |
| `decisions/0021-*` | CONTRACT | Bot UI handoff: kit contract in, ZIP/HTML/Figma-link out (Accepted) |
| `decisions/0022-*` | CONTRACT | Admin-gated catalogs sit behind the Admin wall (Accepted; first shipped in Tamarindo) |
| `plans/` | REFERENCE | Active plans; `plans/archive/` for superseded ones. Also holds CE plans. |
| `solutions/` | REFERENCE | CE-compound learnings. One file per learning, frontmatter, refreshed by `ce-compound-refresh`. |
| `outputs/` | CONTRACT | Per-family output surface declarations. See `export-output-contract.md` for the governing rules. |
| `product-os-adoption.md` | CONTRACT | How kit adopts a pinned Product OS release. Kit cannot amend doctrine. |
| `../brand/README.md` | CONTRACT | Canonical marks. Equip + kit-guard enforce the Norfolk vs client boundary. |
| `OWNERS-GUIDE.md` | REFERENCE | Human-facing owner guide. Not an agent contract. |
| `harness.md` | REFERENCE | Full work cycle, evidence gates and read-only structural assessment |
| `agent-naming.md` | CONTRACT | Persona-first names, stable identities, resolver and visibility rules |
| `consolidation.md` | REFERENCE | Repository inventory, privacy/release blockers and retirement gates |
| `decisions/0023-one-product-os-entry-point.md` | CONTRACT | One owner entry point; staged source/release consolidation |
| `setup/` | REFERENCE | Codespace and Claude Code operator setup. |
| `artifacts/` | REFERENCE | Generated HTML: owner guide, components, motion, icons, architecture, navigation |

## Tiers

- **CONTRACT** — binding. Deviating requires explicit owner approval.
- **REFERENCE** — explanatory. Keep accurate, update freely, no approval needed.

Only CONTRACT files gate a change.

## Conventions

- Every file declares its tier and `Last verified: YYYY-MM-DD` at the top.
- A CONTRACT file unverified for 90+ days is flagged for review, not auto-trusted.
- Decisions are append-only: never edit an accepted record to reflect a new choice — write a new one and mark the old `Superseded by`.
- Plans are named `YYYY-MM-DD-<name>.md`, updated as work progresses, moved to `plans/archive/` when done.
- `docs/plans/` holds kit plans and CE plans. A CE plan does not outrank an ADR.
- Never put a credential in any file here. Reference the Doppler key *name*.
