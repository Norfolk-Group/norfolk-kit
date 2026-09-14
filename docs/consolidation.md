# Consolidation record

**Tier: REFERENCE** · Metadata/content audit: 2026-09-13.

## One destination, staged cutover

The owner approved **Norfolk AI Product OS & Starter Kit** in
`Norfolk-Group/norfolk-kit`. This record distinguishes the destination from work
already verified. No predecessor rename, archive or deletion is completed by
the front-door change. No customer application is being modified.

Kit baseline inspected: `a6228e7e33a92961352d95ee8e282ef6200edb6d`.
Product OS baseline inspected: `b241359765c1d1f2523a89df490ef486b24f3a38`.
These are audit snapshots, not release/adoption pins.

## Main consolidation candidates

| Repository | What the audit established | Destination / exit gate |
|---|---|---|
| `norfolk-kit` | Public; template; reference app on main; lock candidate.1 is proposed | Keep slug; owner front door and publication-safe handbook live here |
| `norfolk-ai-product-os` | Public metadata conflicts with private/publication-blocked source claims; release tooling depends on old identity | Migrate approved doctrine and tested release tooling into Kit before `legacy-norfolk-ai-product-os` + archive |
| `norfolk-manual` | Private; preservation, open-work and hosting checks required | Keep private contents out of public Kit; replace owner-facing function here; retire only after preservation and cutover |

The owner confirmed the consolidated repository stays **public** on 2026-09-13.
Public visibility is not permission to republish material whose own classification
forbids it. Do not put private audit details or customer content in this inventory.

### Product OS release blockers

The old source contains trust/signature verification, release authorization,
Doppler OIDC integration and a `product-os-release` environment. Its
`tools/release/preflight.ts` explicitly invokes GitHub releases against the old
repository identity. Source package version is candidate.5; README/release policy
and compatibility still refer to candidate.4. No published GitHub release was
found during this audit. Kit still proposes candidate.1.

Consequently, renaming first or marking the lock adopted would manufacture a
cutover that has not happened. Preserve immutable release evidence and verify the
new identity, trust, compatibility and rollback path before publication/adoption.

Evidence: [release preflight](https://github.com/Norfolk-Group/norfolk-ai-product-os/blob/b241359765c1d1f2523a89df490ef486b24f3a38/tools/release/preflight.ts),
[distribution contract](https://github.com/Norfolk-Group/norfolk-ai-product-os/blob/b241359765c1d1f2523a89df490ef486b24f3a38/adoption/distribution.md),
[current Kit lock](../product-os.lock.json).

## Other repositories: useful does not mean authoritative

| Repository / audited head | Useful material | Disposition and blocker |
|---|---|---|
| `NAI-claude-plugins` | Private source; details omitted | Check distribution consumers before any retirement; no private content imported |
| `cowork-skills` | Private source; details omitted | Content classification and consumer review before any selective promotion |
| `manus-skills` | Private source; details omitted | No wholesale import; preservation, publication and consumer checks first |
| `norfolk-ai-brand` / `a64f166a4080ed3461a2373f0ad6892206725acb` | Historical brand research and original assets | Reference, not current design policy; review original assets and rights before promotion |
| `general` | Historical candidate | Private source; no contents copied. Preserve refs/settings and check consumers before legacy/archive |
| `demo-repository` | Historical candidate | Private source; no contents copied. Preserve all branches and check consumers before legacy/archive |

Repository names alone do not establish permission to publish their contents.
Customer-specific voice prompts, pitch material and internal access context stay
out of the universal starter. Binary brand sources were inventoried, not approved
or exhaustively reviewed. Dedicated application/agent-content repositories remain
applications/content, not template candidates by name alone.

### Acceptance criteria for any promoted material

Any promoted material must match Kit hosting/storage choices, approved theme
tokens, format-specific report geometry, bundled fonts and the `AGENTS.md`
rule source. Authentication must use approved secret-safe mechanisms. Preserve
provenance and rights, publish only cleared reusable material, and keep third-party
skills as supported upstream references rather than vendored trees.

## Open work and compatibility

Kit [PR #17](https://github.com/Norfolk-Group/norfolk-kit/pull/17) contains useful
repository-role and payload-guard work but describes the former two-authority
destination. It is unmerged and is not silently incorporated by this change.
[PR #10](https://github.com/Norfolk-Group/norfolk-kit/pull/10) also changes governance
cutover wording. Reconcile both against decision 0023 before either merges.
Dependency updates are separate from this consolidation.

The owner guide generator reads one explicit source, `docs/OWNERS-GUIDE.md`.
It does not recursively import historical doctrine, migration evidence or private
Manual content. Its CLI and artifact remain Kit-local and do not ship in equip.

## Retirement checklist

1. Capture all branches/tags, open PRs/issues, settings and source provenance.
2. Preserve unique material in an access-appropriate destination; keep licenses.
3. Record accepted/rejected content and resolve policy conflicts explicitly.
4. Check code, marketplace installs, release identities, hosting, webhooks and
   external consumers. Empty GitHub deployment records do not prove no hosting.
5. Test restoration and the replacement's owner workflow and release/adoption path.
6. Add a prominent redirect, then perform the approved rename/archive and verify it.

No repository is deleted. No broad automatic adoption runs against existing apps.
The remaining content-publication and trusted-release gates are real blockers, not reasons
to represent this inventory as a completed source consolidation.

## 2026-09-14 execution checkpoint

PR #19 merged as `becf55398f3686d116a424073416e80c4bbd830b` with green
quality, CodeQL and Bugbot checks. The owner authorized executing the remaining
consolidation stages, including conditional predecessor renames and archives.
No deletion or customer-application adoption is included.

Local-only full-ref preservation now exists for both predecessors. Product OS
preservation covers 12 named refs plus HEAD; Manual covers 10 plus HEAD, including
its three branches and the open PR #2 head/merge state. Both complete-history
bundles were restored independently and passed `git fsck --full --strict`; all
exported ref SHAs matched. The Manual PR #2 patch was preserved and dry-run applied
to its restored merge-base. Private backups and metadata are outside public Kit.
This is source-recovery evidence, not a complete operational backup or retirement.

Remaining gates:

- Decide private versus sanitized public release distribution. Existing accepted
  source still specifies private bundles. Do not infer disclosure approval from
  the repository's public visibility or bulk-import validation/history material.
- Migrate and test release repository identity, signing authorization and provider
  trust; historical signed manifests and candidate tags remain unchanged.
- Verify external consumers and hosting. Empty Pages/hooks/deploy-key results
  do not prove the absence of integrations; GitHub App inventory was unavailable.
- Preserve/disposition open work and install successor notices before conditional
  rename/archive. Manual PR #2 is not merged or closed as a cleanup side effect.
- Verify actual rule/skill loading in each editor and a complete new-project
  setup. Local command/cache presence is not installation or session proof.

The workflow audit also found unsafe FOREIGN-file classification and blind
manifest discovery. Regression fixtures now require preserving unmanaged files,
explicit manifest selection and real filesystem/Git recovery checks. These are
prerequisites, not evidence that the source/release cutover has happened.
