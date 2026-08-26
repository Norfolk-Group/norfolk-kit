# Admin-gated catalogs

**Tier: CONTRACT** · Last verified: 2026-08-26

Governing ADR: [`decisions/0022-admin-gated-catalogs.md`](decisions/0022-admin-gated-catalogs.md).  
First implemented in Tamarindo / Nico. Map the nouns; do not copy that host.

A catalog is not a blue-variable group. It is a closed set of named
profiles that define the box. Members may read it when the product
needs them to. Only an admin may write it.

## Nouns

| Noun | Meaning |
|------|---------|
| **Catalog** | The closed set of named profiles for one domain. |
| **Profile** | One named row: identity, explanation, seed, live computed outputs. |
| **Family** | A partition of the catalog. Mix weights sum inside a family. |
| **Seed** | The researched default. Cited. Restorable. |
| **Research note** | Why this seed, with sources. Label FACT / OPINION / ASSUMPTION. |
| **Admin wall** | Second-level rail that **replaces** the first-level sidebar. First command is Home. |

Blue variables (member what-ifs) and published Deal Terms are other nouns.
Do not store catalog writes on either.

## MUST

1. Count the profiles in the product contract. Do not hide extras.
2. Explain each profile on the admin editor: who, what, where, why this seed.
3. Restrict `set` to **admin**. `list` / `get` may be investor-visible.
4. UI and the agent call the same procedures.
5. Recalculate on the server after a write. The engine reads the live
   profile keys.
6. Cite every seed. Offer restore-to-seed per profile.
7. Open the catalog from Admin (or the product’s equivalent wall).
8. Render the explained editor in the **main pane**. The rail is navigation.

## MUST NOT

1. Mark catalog keys member-editable.
2. Leave the only editor as a grey accordion on Assumptions.
3. Let a non-admin `set` succeed (an empty `applied` list is not the gate).
4. Keep a parallel ticket/term/rate the engine still prefers.
5. Invent a seed without a source, or paste a screenshot as the live number.
6. Stack a second sidebar beside Home for this surface.
7. Put the explained cards inside the narrow rail.

## Procedures

| Procedure | Does |
|-----------|------|
| `{domain}.list` | Every profile, with explanation + live math |
| `{domain}.get` | One profile + engine slices the product owns for that id |
| `{domain}.set` | Admin only. Writes that profile. Recalculates. |

Tamarindo uses `icp.list` / `icp.get` / `icp.set`. A future product may use
`catalog.*`. Same verbs, same gate.

Assumptions (`model.setVariables` or the product equivalent) may persist
the same keys for an admin already on the catalog page. One store, two
doors — not a second write path with different authz.

## Shell

Second-level Admin rail, assembled from the kit shell (ADR 0017), not a
one-off. Home is the first command and returns to the first-level
sidebar. Catalog content is a workspace in the main pane, the same slot
statements and other primary workspaces use.

## Agent-native

Honor list / get / (admin) set in chat. Refuse a member who asks to
change a profile. Do not invent a seed.

## Product binding

The product names the families and the seeds. Kit does not ship
Tamarindo’s six+two+two ICPs. It ships this gate.
