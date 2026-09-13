---
title: Consolidate the Norfolk Product OS front door and owner workflow
type: refactor
status: active
date: 2026-09-13
---

# Consolidate Norfolk Product OS and Starter Kit

**Tier: REFERENCE** · Source: Ricardo's approved one-repository recommendation, 2026-09-13.

## Summary

Make `Norfolk-Group/norfolk-kit` the owner's one starting point for new projects,
existing-project assessment and standards changes. Preserve working applications,
release trust and source history while consolidating the former separate roles.

---

## Requirements

- R1. Keep the Kit slug and identify it as Norfolk AI Product OS & Starter Kit.
- R2. Provide one plain-English owner guide with stack, governance, tools, design,
  exports and paste-ready workflows for Cursor, Claude Code and Codex.
- R3. Generate portable owner artifacts from the same source, not independent policy.
- R4. Inventory predecessor repositories and dependencies before demotion.
- R5. Never copy private/customer material into a public repository, silently
  rewrite adopted locks, remove checks or modify excluded applications.
- R6. Owner follow-up: keep the consolidated Kit public and make it a practical
  full-lifecycle harness from ideation/context through evaluation, testing,
  review and refactoring, including safe read-only assessment of project setup.
- R7. Include H-Analytics-style persona-first agent naming without changing that app.

## Scope boundaries

H-Analytics and its related design repository are excluded from changes. The
owner's naming follow-up permits a narrow read-only inspection of naming sources;
no other inspection, PR action or monitoring is included. No application adoption,
deployment, secret provisioning, deletion or
subscription cancellation is part of this change. No third-party skill trees
will be vendored. Pending Kit PRs #10 and #17 remain separate work and are not
silently merged or closed.

Owner confirmed public visibility. Private source stays excluded unless explicitly
cleared for publication; no private-to-public bulk import is authorized.
Source consolidation and predecessor retirement remain conditional on privacy,
release-consumer and hosting checks; front-door documentation must not claim
those steps already happened.

---

## Context and decisions

- `README.md`, `docs/OWNERS-GUIDE.md` and `docs/README.md` are existing entry points;
  improve them instead of adding a competing manual.
- `AGENTS.md` is the canonical agent rule source; `CLAUDE.md` imports it.
- `product-os.lock.json` is proposed, not adopted. Preserve its signed-release
  semantics and historical coordinates until a tested migration exists.
- `.kit/markers.json` distinguishes kit-local material from equipped payloads.
- `tools/artifacts/build.ts` demonstrates deterministic, self-contained artifacts.
- `docs/decisions/0018-export-surfaces-are-format-specific-contracts.md` governs
  report design separately from the interactive UI.
- `docs/solutions/README.md` contains no prior consolidation solution to reuse.

---

## Implementation units

### U1. Owner front door and decision

**Requirements:** R1, R2, R5. **Dependencies:** none.

**Files:** `README.md`, `docs/README.md`, `docs/OWNERS-GUIDE.md`,
`docs/decisions/0023-one-product-os-entry-point.md`.

**Approach:** establish the approved destination and three owner actions;
distinguish today's implemented baseline from pending source/release cutover.
Explain actual checked-in tools and known setup gaps rather than promise
automatic editor plugin installation. Keep historical ADRs unchanged.

**Test expectation:** no application behavior changes. Check links, source
claims and every copy-paste prompt for approval, privacy and rollback boundaries.

**Verification:** owner can start, assess and propose an update using the guide
without selecting a second starter or treating a pending migration as finished.

### U2. Portable owner artifact

**Requirements:** R2, R3, R5. **Dependencies:** U1's Markdown source.

**Files:** `tools/owner-guide/build.mjs`, `tests/artifacts/owner-guide.test.ts`,
`docs/artifacts/owner-guide.html`, `.kit/markers.json`, `package.json`.

**Approach:** deterministic offline HTML generated from the owner guide, with
navigation, source digest, selectable/copyable prompts and print layout. Reuse
installed browser tooling for PDF, without changing application renderers.
Do not add runtime dependencies or network assets. Explicitly keep owner tools
and company guide out of equipped payloads.

**Test scenarios:** generated output escapes literal markup; heading navigation
resolves; source code blocks preserve exact prompts; source changes are detected
by freshness checking; a broken/missing source fails rather than writing success;
offline browser copy/print and narrow viewport remain usable.

**Verification:** deterministic rebuild and actual offline browser checks pass;
PDF is visually inspected before being described as a validated deliverable.

### U3. Consolidation inventory and conditional retirement

**Requirements:** R4, R5. **Dependencies:** live source/dependency audit.

**Files:** `docs/consolidation.md` plus predecessor notices only where safe.

**Approach:** record exact heads, roles, unique material, privacy classification,
consumers, preservation destination and exit gates. Identify public-doc conflicts
without treating repository visibility as permission to republish private content.
Rename/archive only after preservation and dependency checks pass. Never infer
that absent README or a 404 proves an empty repository.

**Test expectation:** no application behavior change; verify inventory against
live GitHub, links and changed repository metadata against approved disposition.

**Verification:** every candidate has a reasoned disposition or concrete blocker;
no retirement is recorded as complete without actual GitHub confirmation.

### U4. Review and delivery

**Requirements:** R1–R5. **Dependencies:** U1–U3.

**Files:** accumulated diff and owner artifacts.

**Approach:** self-review, independent documentation/safety review and actual
project gates. Preserve exact dependency pins. Push/open a focused PR under the
owner's implementation authorization; merge only under standing green-check
authorization after required checks and review findings are resolved.

**Verification:** lint, typecheck, tests, builds and applicable freshness/browser
checks pass. Skipped or blocked checks and partial migration are disclosed.

### U5. Read-only project harness assessment

**Requirements:** R2, R5, R6. **Dependencies:** existing agent/docs/quality contracts.

**Files:** `tools/harness/check.mjs`, `tests/kit-guard/harness.test.ts`,
`docs/harness.md`, `package.json`, owner guide and docs index.

**Approach:** accept an explicit local project root; inspect only allowlisted
non-secret configuration and contract paths. Return machine-readable findings
and a short human summary for missing structure, rule bridge, quality commands
and adoption evidence. Never mutate target files, execute their scripts, read
secrets, or equate structural checks with runtime/release readiness. Do not
require optional services or silently migrate existing projects.

**Test scenarios:** complete fixture; missing contracts; malformed configuration;
missing/placeholder quality commands; explicit proposed versus adopted lock;
source-path escape through symlink; no configuration values in error output;
target files unchanged after check. Verify exit status reflects blockers.

**Verification:** isolated fixtures prove read-only behavior and useful failures;
the Kit self-assessment reports real gaps without weakening existing gates.

---

### U6. Lifecycle and agent identity integration

**Requirements:** R6, R7. **Dependencies:** U1, U5 and existing naming decision 0012.

**Files:** `AGENTS.md`, `docs/agent-naming.md`, lifecycle/owner guides, docs index,
and payload markers.

**Approach:** make the full sequence explicit, record evidence and interrupted-run
handoffs in the existing plan, and define representative evaluations before code.
Distill persona-first naming into a reusable contract with stable IDs, centralized
resolution and project-specific visibility. Preserve existing names and apps.

**Verification:** independent consistency review, shipped references resolve,
owner artifact stays fresh, aggregate quality and browser gates pass. Document
that lifecycle gates are a workflow, not an implemented state-machine service.

## Risks and implementation-time questions

- Private Manual hosting/source migration needs access-safe cutover; ask the
  owner about target visibility before moving its content.
- Product OS trusted release coordinates, external Actions and adopters may
  depend on the old slug. Inventory and migrate before renaming it.
- Existing open PR #17 implements a different two-authority model. Do not lose
  its useful guard fixes or call its unmerged content part of main.
- Local Node/pnpm differs from exact project pins. Use the pinned runtime where
  available; otherwise report the mismatch and use CI as the exact-version gate.
- User approval of consolidation does not authorize changing customer apps.

Rollback: documentation/tool changes revert as a normal PR. Repository archives
are reversible but only follow preservation; no deletions are planned.

## Implementation evidence, 2026-09-13

U1/U2/U5/U6 implemented; U3 inventory complete but source migration/retirement
remains conditional. U4 local verification complete; GitHub gates/review pending.
No predecessor renamed, archived or deleted. No existing application changed.

Pinned Node 24.13.0 / pnpm 11.13.0 `pnpm verify` passed: lint, typecheck,
65 unit tests, builds, one production smoke test, Storybook, reference/catalog
freshness and seven browser tests. One POSIX source-symlink test was skipped on
Windows; two duplicate clipboard viewport tests were skipped to avoid host
clipboard races. All viewports exercised fallback selection. Real clipboard
copying verified on desktop. Existing Storybook chunk-size warnings remain.

Independent review findings fixed: heading/copy ID collisions, source-output
file aliases, private audit detail exposure, unsupported installed-stack claims
and naming-rule drift. Required heavy-review persona files were unavailable;
independent correctness/security/standards reviews were the disclosed fallback.
Final aggregate gates were run by the orchestrator, not inferred from agent reports.

The eight-page PDF was rendered offline using Chromium 151.0.7922.34 and visually
inspected. Prompt pagination was repaired and rechecked. HTML is the deterministic
checked-in artifact; local PDF evidence is a dated snapshot, not another policy.
The structural self-assessment correctly returned `assessment-required`, with
proposed-adoption and unverified editor/runtime warnings.
