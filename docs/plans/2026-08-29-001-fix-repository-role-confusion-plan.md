---
title: "fix: Make Norfolk repository roles unambiguous"
type: fix
status: completed
date: 2026-08-29
---

# Fix: Make Norfolk repository roles unambiguous

## Summary

Norfolk has one application template but several adjacent repositories whose names, descriptions, or historical instructions make them look like competing starters or sources of policy. This change makes `Norfolk-Group/norfolk-kit` the sole project bootstrap, records the non-template roles of the surrounding shared repositories, and aligns the GitHub-facing labels with that model without deleting, renaming, or repurposing repositories.

---

## Problem Frame

GitHub currently marks only Norfolk Kit as a template, yet the Kit front page claims the deleted `norfolk-starter` is still active, Product OS lacks a description, archived HBG repositories still read like reusable foundations, and skill/brand repositories contain language that can be mistaken for company-wide authority. A human or agent cannot reliably tell where to start, which repository governs doctrine, or which repositories are merely sources, applications, or historical references.

## Requirements

- **R1. One project bootstrap:** `Norfolk-Group/norfolk-kit` is the only repository approved to initialize a Norfolk application.
- **R2. Explicit adjacent roles:** Product OS, Manual, brand, design/integration sources, agents, plugins, skills, sandboxes, and deleted predecessors each have a non-template role and lifecycle.
- **R3. Machine-checked uniqueness:** the checked registry rejects a second template, ambiguous or invalid entries, and starter routing anywhere except canonical Norfolk Kit.
- **R4. Kit-local inventory:** repository topology stays in Kit and is never copied into equipped product repositories.
- **R5. Accurate public labels:** GitHub descriptions and topics expose the role before someone opens a repository.
- **R6. No destructive cleanup:** no repository is deleted, renamed, archived, unarchived, or otherwise repurposed in this change; H-Analytics is out of scope.

## Scope Boundaries

- No application code or product behavior changes.
- No Product OS doctrine is authored in Kit; Kit records its operational adoption topology only.
- No repository deletion, rename, transfer, archive-state change, or default-branch change.
- No H-Analytics changes.

### Deferred to Follow-Up Work

- Remove competing company-wide authority language inside `manus-skills` through a repository-specific PR after reading that repository's own agent contract.
- Add legacy banners inside archived HBG repository READMEs if those repositories are explicitly approved for temporary unarchiving and maintenance.
- Decide whether the empty `general` repository should be archived; the present change labels it only.

---

## Context & Research

### Relevant Code and Patterns

- `.kit/payloads.json` and `.kit/markers.json` already model fail-closed organization and sensitivity policy.
- `tools/product-os-adopt/plan.mjs` and `tests/kit-guard/adoption-plan.test.ts` establish validated data plus blocking Vitest coverage.
- `docs/product-os-adoption.md` establishes that Product OS owns reusable WHAT/WHY while Kit implements HOW.
- `docs/plans/archive/2026-07-29-kit-consolidation.md` records the starter harvest and archive; live GitHub verification shows the repository was later deleted outside the complete retirement workflow.

### External State Verified

- `norfolk-kit` is the only live repository with GitHub's template flag.
- `norfolk-starter` no longer exists.
- `hbg-design-system`, `hbg-screens`, `hbg-twilio-telephony`, and `hbg-elevenlabs` are archived and read-only.
- Product OS, Manual, brand, agent, plugin, skill, and sandbox repositories are not templates.

---

## Key Technical Decisions

- Keep the registry scoped to canonical governance, handbook, brand, agent/plugin/skill, sandbox, and archived reusable HBG sources that could plausibly be mistaken for starters; normal product repositories and H-Analytics do not need an entry.
- Store the registry under `.kit/` but mark and exclude it as `kit-only`, so it governs Kit without becoming product payload.
- Use strict runtime validation and blocking unit tests rather than a network-dependent org controller.
- Normalize GitHub descriptions and role topics as a one-time metadata operation sourced from the checked registry.
- Treat historical plans and brainstorms as provenance; move superseded plans to the archive and add context instead of erasing their earlier decisions.

---

## Open Questions

### Resolved During Planning

- **Should every product repository be cataloged?** No. The ambiguity comes from shared/foundation repositories; products retain their normal product identity.
- **Should Kit create universal repository doctrine?** No. Product OS owns doctrine; this is Kit's operational adoption inventory.
- **Should ambiguous repositories be deleted or archived now?** No. Metadata and authority are clarified first; destructive lifecycle decisions remain separate.

### Deferred to Implementation

- Exact topic preservation behavior depends on each repository's existing live topics; role topics must be added without deleting unrelated topics.

---

## Implementation Units

### U1. Add the checked repository-role registry

**Goal:** Record one canonical application template and fail closed on ambiguous or unsafe role definitions.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Create: `.kit/repository-roles.json`
- Create: `tests/kit-guard/repository-roles.test.ts`
- Create: `tools/kit-guard/markers.mjs`
- Create: `tools/kit-guard/markers.d.mts`
- Modify: `.kit/markers.json`
- Modify: `.kit/README.md`
- Modify: `tools/kit-guard/check.mjs`
- Modify: `tools/kit-guard/write-manifest.mjs`

**Approach:**
- Define and validate strict repository, role, lifecycle, bootstrap, purpose, and starter-routing fields in the blocking test rather than adding a cross-repository controller.
- Require exactly one canonical template and require it to be the active Norfolk Kit entry.
- Require legacy, archived, and deleted entries to point new project starts only at canonical Norfolk Kit while active entries cannot claim a starter replacement.
- Make the registry more specifically `kit-only` than the existing `.kit/**` payload marker and explicitly exclude it from payload discovery.
- Share marker resolution between both guard CLIs, pin unmatched paths to `kit-only`, and reject any configured less-restrictive default.

**Patterns to follow:**
- `.kit/payloads.json`
- `tools/product-os-adopt/plan.mjs`
- `tests/kit-guard/adoption-plan.test.ts`

**Test scenarios:**
- Happy path: the committed registry validates and resolves Norfolk Kit as the sole canonical template.
- Edge case: repository slugs that differ only by case are rejected as duplicates.
- Error path: a second canonical template, unknown field, invalid enum, or non-Kit canonical slug is rejected.
- Error path: legacy/archived/deleted entries without valid starter routing, active entries with a starter replacement, and a second `project-starter` role are rejected.
- Integration: both guard CLIs execute against a temporary repository; the inventory stays out of payload discovery and unmarked content is refused.

**Verification:**
- The real registry passes strict validation and every invalid fixture fails for the expected reason.
- `pnpm test` blocks role ambiguity without any CI workflow change.

---

### U2. Reconcile Kit documentation and historical drift

**Goal:** Give people and agents one clear repository map and remove active contradictions.

**Requirements:** R1, R2, R4, R6

**Dependencies:** U1

**Files:**
- Create: `docs/repository-roles.md`
- Modify: `README.md`
- Modify: `docs/README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/product-os-adoption.md`
- Modify: `docs/SYSTEM-GOVERNANCE-RULE.md`
- Modify: `docs/export-output-contract.md`
- Modify: `brand/README.md`
- Modify: `AGENTS.md`
- Modify: `.claude/skills/equip/SKILL.md`
- Move: `docs/plans/2026-07-29-kit-consolidation.md` → `docs/plans/archive/2026-07-29-kit-consolidation.md`
- Move: `docs/plans/2026-07-31-001-feat-core-stack-buildout-plan.md` → `docs/plans/archive/2026-07-31-001-feat-core-stack-buildout-plan.md`
- Modify: `docs/brainstorms/2026-07-31-core-stack-requirements.md`

**Approach:**
- Put a compact role table and decision rule near the top of the root README and route repository-topology changes through the docs index.
- Correct the deleted starter status and avoid mutable public/private claims about Product OS.
- Define Kit's brand directory as a governed distribution snapshot sourced from the brand repository.
- Archive superseded historical instructions with clear provenance, including the prohibition on acting against H-Analytics from those old plans.
- Align all descriptions and code fallbacks with the actual fail-closed `kit-only` unmatched default.

**Patterns to follow:**
- `docs/product-os-adoption.md`
- `docs/architecture.md`
- `docs/README.md`

**Test scenarios:**
- Test expectation: governance-link and fallback behavior are covered by focused validation plus the guard integration assertions.

**Verification:**
- Current docs contain no live claim that `norfolk-starter` exists or that multiple repositories are valid project starters.
- Current Kit docs distinguish Product OS doctrine, Kit implementation, Manual rendering, brand sourcing, tooling, products, and legacy references.
- Every current unmatched-default statement says `kit-only`.

---

### U3. Normalize GitHub repository metadata

**Goal:** Make the repository's role visible in the Norfolk GitHub list before a visitor opens it.

**Requirements:** R1, R2, R5, R6

**Dependencies:** U1, U2

**Files:**
- No repository files; reversible GitHub descriptions and topics only.

**Approach:**
- Set concise descriptions that explicitly say “not an application template” for adjacent shared repositories.
- Add one `repo-role-*` topic per cataloged repository while preserving unrelated topics.
- Present the registry-derived before/after preview and obtain explicit approval before each outward-facing metadata batch.
- Record unmistakable archived/legacy descriptions as approved next-maintenance labels; do not unarchive repositories merely to apply metadata.
- Label `general` as an empty legacy sandbox without changing its archive or branch state.

**Test scenarios:**
- Happy path: every cataloged live repository's description and role topic match the registry.
- Edge case: existing unrelated topics remain present after role-topic normalization.
- Error path: a repository that cannot be read or updated is reported and left unchanged rather than silently treated as synchronized.

**Verification:**
- A fresh GitHub API read shows one template and unambiguous descriptions/topics for every active cataloged shared repository; archived read-only repositories are reported as exceptions without unarchiving them.

---

### U4. Verify and prepare the change for review

**Goal:** Prove the registry, documentation, and existing application remain healthy.

**Requirements:** R1-R6

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `docs/plans/2026-08-29-001-fix-repository-role-confusion-plan.md` (status only at shipping)

**Approach:**
- Self-review the complete diff for scope creep, duplicate doctrine, payload leakage, and inaccurate live metadata.
- Run all required repository gates and report any skipped or failing gate honestly.

**Test scenarios:**
- Integration: lint, typecheck, tests, build, production test, Storybook build, artifact checks, and browser tests remain green.

**Verification:**
- The direct equivalents of every `pnpm verify` stage pass locally. The exact wrapper remains a CI gate because this host supplies newer Node 24.x / pnpm 11.19.0 runtimes while the repository pins Node 24.13.0 / pnpm 11.13.0.
- The final diff contains no H-Analytics change and no destructive repository operation.

---

## System-Wide Impact

- **Interaction graph:** Product OS supplies doctrine; Kit supplies the executable starter and adoption inventory; Manual renders; source/tooling repositories feed explicitly named concerns; product repositories adopt Kit.
- **Error propagation:** invalid registry data fails the existing test gate; failed GitHub metadata updates are surfaced per repository.
- **State lifecycle risks:** remote descriptions/topics are reversible; archive, rename, deletion, transfer, and default-branch state remain untouched.
- **API surface parity:** no application capability changes.
- **Integration coverage:** registry validation plus a post-update live GitHub read prove local and remote classifications agree.
- **Unchanged invariants:** Product OS remains doctrine owner; Kit remains implementation; equipped repositories do not receive Kit-local inventory.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Kit accidentally becomes a second Product OS | Keep the document operational and reference Product OS for doctrine. |
| Registry leaks into equipped repos | Exact `kit-only` marker, explicit payload exclusion, and a blocking test. |
| Metadata overwrites useful topics | Merge the role topic with existing topics; do not replace the topic set wholesale. |
| Historical documents re-trigger deleted or superseded work | Move superseded plans into the archive and preserve explicit provenance. |
| A metadata label is mistaken for archive approval | Do not change archive state; defer lifecycle decisions explicitly. |

---

## Documentation / Operational Notes

- Repository descriptions are intentionally short because GitHub truncates them in organization listings.
- The registry is the operational source for future metadata audits; it is not an always-on cross-repository controller.
- Any future shared repository that could be mistaken for a starter must be classified before it is advertised or adopted.

---

## Sources & References

- `README.md`
- `.kit/payloads.json`
- `.kit/markers.json`
- `docs/architecture.md`
- `docs/product-os-adoption.md`
- `docs/plans/archive/2026-07-29-kit-consolidation.md`
- Live GitHub repository metadata verified 2026-08-29.
