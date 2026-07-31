# 0017 — The app shell is assembled from shadcn blocks, not written

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Ricardo (direction) + Claude (composition)
**Ricardo, 2026-07-31:** *"i like this stuff https://ui.shadcn.com/"* — pointing at it twice, including the blocks page.

## Decision

Every app starts from the same shell, composed from shadcn **blocks** — which are full page templates, not components — themed per decision 0017's sibling on themes, and wired to the auth module.

| Surface | Source | Why |
|---|---|---|
| Login | `login-03` (default) | Centred, muted background, logo above the form. Needs no photography, works for every app, puts the brand where the eye lands. |
| Login, client-facing | `login-02` (variant) | Two-column with cover image. For Obra Pía, La Plage, El Claustro — where real property photography makes the first screen feel like the place. |
| App shell | `dashboard-01` | Sidebar, charts, data table. Most of an app in one command. |
| Navigation | `sidebar-07` | Collapses to icons — the pattern already needed for small screens (R34). |
| Copilot column | **hand-built** | shadcn has no right-hand conversational panel. This is the one genuinely new piece. |

Installed with `npx shadcn add <block-id>`.

**Two login options, not five.** More than two and "every login screen looks about the same" stops being true — which was the actual requirement.

## Why this changes the cost estimate

Earlier today the kit was described as having "no app scaffold — every project still starts from nothing," and that was treated as a large gap. It is smaller than it looked.

Ricardo's requirement — *"every login screen should look about the same and have the same functionality"* — is not a build. **It is a choice made once.** The screen was never the expensive part; the thousands went into WorkOS wiring, repeatedly, because the wiring was re-derived per project while the screen was always a command away.

So the auth module is: **a block (chosen), plus wiring (done once, properly), plus a preflight (so failure is legible).** Only the middle third was ever hard.

## What still has to be written

Blocks give layout. They do not give:

1. **The WorkOS wiring** — backend-driven `@workos-inc/node`, following the vendor's own skill rather than improvised (decision 0016).
2. **The eight `authenticateWithCode` branches** — `email_verification_required`, `mfa_enrollment`, `organization_selection_required`, `sso_required` and the rest. A happy-path integration throws on all of them. This is the part that becomes a multi-day debugging session, twice, if skipped.
3. **The preflight** — reports "Staging has no redirect URI registered" instead of a generic OAuth error. Today's diagnosis, automated.
4. **The two modes** — open vs invite-only. One WorkOS toggle plus SDK invitations.
5. **The copilot column** — no block exists.

## Consequences

- The kit ships a **composition recipe plus the wiring**, not a copy of shadcn. Blocks are installed from source at their current version; vendoring them would fork an upstream that improves.
- The shell already has a visual reference: [`themes.html`](../artifacts/themes.html) shows sidebar + main + copilot column across three themes and three screen sizes. That page is the target, not a sketch.
- Because blocks are full pages, the theme decision and R34 (iOS, small screens) apply to them directly — a block that does not fold down for a phone is not usable, and must be adapted rather than accepted.

## What this rules out

- **Hand-writing login, sidebar or dashboard layouts.** Solved upstream, better, free.
- **A menu of five login styles.** Two.
- **Vendoring shadcn blocks into the kit.** Install from source; do not fork what improves without us.
