# 0023 — One Product OS and Starter Kit entry point

**Tier: CONTRACT** · **Date:** 2026-09-13 · **Status:** Accepted

## Decision

Ricardo approved `Norfolk-Group/norfolk-kit` as the one go-to repository,
named **Norfolk AI Product OS & Starter Kit**, for new applications,
existing-project assessments and changes to Norfolk standards. The owner manual
is maintained here, with generated portable copies, not as a competing policy source.

## Why

Separate starter, doctrine, manual and historical skill repositories caused
confusion about where to begin and which rules to change. One entry point must
explain the real implemented baseline and the remaining migration work.

## Transition, not fictional completion

This decision supersedes the *destination* of the prior two-repository migration.
It does not claim the former Product OS source, release environment or adopters
have already moved. Until a reviewed cutover lands, their existing source and
signed-release references remain valid compatibility inputs. Do not change
`product-os.lock.json` to adopted, rewrite signed manifests, replace trusted
repository identities or silently change application behavior.

Kit is the intake point for new standard proposals. For material still owned by
the former source, implement an explicit migration or linked reviewed change
rather than editing two contradictory policy copies.

`AGENTS.md` remains the canonical agent-rule source, with editor-specific bridges
only. This extends decision 0009's shared-rule approach to the owner's explicit
Cursor, Claude Code and Codex workflow. Installation and actual skill loading
must be verified separately for each editor.

## Retirement gates

Before renaming or archiving a predecessor: inventory all refs and open work;
preserve unique content with provenance; classify sensitive and third-party
material; verify consumers, release identities and hosting; test restoration;
provide a redirect and confirm the replacement works. Deletion is not authorized
by this decision. Applications are not predecessor templates merely because
their names contain Norfolk or AI.

Current blockers and dispositions live in [consolidation.md](../consolidation.md).
Repository visibility does not grant permission to redistribute private or
publication-blocked material. No customer app is adopted as a side effect.

## What this rules out

- Creating another Norfolk starter or separately editable owner manual.
- Treating historical Manus/brand/voice skills as current policy without review.
- Archiving repositories before preserving their unique work and consumers.
- Claiming a copied payload, declared plugin or passing build proves adoption.

## Reversal conditions

An owner-approved architectural decision with a documented reason, migration
plan and preserved compatibility; not convenience in one editor or project.
