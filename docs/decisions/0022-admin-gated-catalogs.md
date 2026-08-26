# 0022 — Admin-gated catalogs sit behind the Admin wall, not on blue Assumptions

**Date:** 2026-08-26 · **Status:** Accepted · **Decided by:** Ricardo
**First shipped in:** Tamarindo / Nico (`Admin → ICPs`)  
**Companion:** [`admin-catalog-contract.md`](../admin-catalog-contract.md)

## Decision

A **catalog** is a closed, named set of domain profiles (ideal contract
profiles, fee cards, underwriting boxes). Each profile is explained, seeded
from cited research, and computed live on the server.

Writes are **admin only**. The editor is a second-level Admin submenu
(Home first; rail replaces the first-level sidebar). The explained cards
open in the main pane. UI and the agent call the same `list` / `get` /
`set` procedures.

Blue variables stay on Assumptions. Published Deal Terms stay on Deal
Terms. Do not collapse the three.

## Why

Tamarindo needed six property ICPs, two auto ICPs, and two aircraft ICPs —
named, explained, and editable only behind the Admin wall. Putting those
keys on the member Assumptions list made a permission slip look like a
what-if. Putting the editor inside the 240px rail hid the explanation.
A leftover book-level ticket beside the catalog let the engine ignore the
profiles.

The pattern is the product of that contact with reality, not a Tamarindo
exception. The next Norfolk app that has a countable box should start
here instead of rediscovering it.

## What this rules out

- Marking catalog keys member-visible (`visibility: "user"` / blue).
- The only editor being a grey accordion on Assumptions.
- Chat `set` succeeding for a non-admin.
- A parallel ticket/term/rate the engine still prefers.
- Inventing a seed without a source.
- Stacking a second sidebar beside Home for this surface.
- Cramming explained cards into the narrow rail.

## Consequences

- Equip and new apps treat `docs/admin-catalog-contract.md` as CONTRACT.
- A product may name the procedures `{domain}.*` (`icp.*`, `catalog.*`).
  The verbs and the admin gate do not change.
- Host and ORM stay the product’s (Tamarindo: Workers + Prisma). Kit
  defaults (Railway + Drizzle) map the nouns; they do not force a migrate.
- The Manual **renders** this ADR. It does not fork a second copy.

## Reversal conditions

Only if a product’s catalog is genuinely a member what-if — every profile
is a personal case input, not a company permission slip. That is a
different noun. Do not weaken this ADR to cover it; write a new one.
