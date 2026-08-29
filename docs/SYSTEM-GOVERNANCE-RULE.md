# System governance (kit HOW)

**Tier: CONTRACT** · Last verified: 2026-08-16

This file is Norfolk Kit implementation notes. It is not a second canon.

Universal WHAT/WHY lives in the private Norfolk-Group/norfolk-ai-product-os. Kit owns executable HOW. If this file and Product OS disagree, Product OS wins. Do not copy Product OS policy into this file; link it.

## What wins

Follow Product OS governance/fundamental-governance.md. Do not keep a second precedence list here.

In this repo, the agent contract is AGENTS.md (decision 0009). CLAUDE.md is @AGENTS.md plus a Claude-only appendix. It is not a second contract.

## How /docs governs this repo

docs/README.md is the router: change type → files to read first. A file not in that index is not part of the kit contract.

Tiers and freshness follow Product OS governance/knowledge-tiers.md:

- CONTRACT binds. Deviating needs owner approval.
- REFERENCE explains. Keep it accurate; it cannot add a new obligation.
- Every file here declares its tier and Last verified: YYYY-MM-DD.
- A CONTRACT file unverified for 90+ days is flagged, not auto-trusted. Stale docs are worse than absent docs.

/docs outranks the code as observational evidence. If they disagree, that is a finding: quote the doc, quote the code, stop. Do not silently rewrite the doc to match the code.

Decisions live in docs/decisions/NNNN-short-title.md, append-only. Never edit an accepted record to reflect a new choice. Write a new one and mark the old Superseded by.

Plans live in docs/plans/ as YYYY-MM-DD-<name>.md. A plan does not outrank an ADR. CE-compound learnings live in docs/solutions/ (REFERENCE).

UI work reads design-system.md first. Design tools are tools, not a second system (0020 / 0021).

Never put a credential in /docs. Reference the Doppler key name.

## Gates that actually run

Do not describe honor-system checks as CI.

- kit-guard (.github/workflows/kit-guard.yml) — PR to main. Blocks brand-boundary writes, unclaimed kit-managed paths, and deletions. See tools/kit-guard/check.mjs.
- quality (.github/workflows/quality.yml) — lint, typecheck, unit/production tests, build, Storybook, pnpm docs:artifacts:check, Playwright.
- pnpm docs:artifacts:check — generated docs/artifacts/ must match source. Artifacts are generated, never hand-written, and must open with no server.

Index completeness and tier-header presence are reviewer conventions until a real check exists. Do not invent a docs-sync gate.

## What this file used to be

The previous body was a full v2 policy, bannered superseded during Product OS migration and kept for provenance. That duplicate policy is removed. History is git. Product OS decisions/0001-product-os-is-canonical.md is why.

Verified Product OS paths exist: governance/fundamental-governance.md, governance/knowledge-tiers.md, decisions/0001-product-os-is-canonical.md.
