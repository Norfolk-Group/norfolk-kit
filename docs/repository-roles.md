# Repository Roles

**Tier: REFERENCE** · Last verified: 2026-08-29

Norfolk has one project bootstrap: [`Norfolk-Group/norfolk-kit`](https://github.com/Norfolk-Group/norfolk-kit). It is the only repository that may be selected through GitHub's **Use this template** flow for a Norfolk application.

The machine-readable inventory is [`.kit/repository-roles.json`](../.kit/repository-roles.json). Its inclusion rule is narrow: canonical governance, handbook, brand, agent/plugin/skill, sandbox, and archived reusable HBG source repositories that could be mistaken for starters. It is not a portfolio database, does not list ordinary products, and excludes H-Analytics.

## Read the inventory

Each live registry entry has one role, bootstrap policy, lifecycle, purpose, GitHub description, and role topic. Archived entries mark `githubMetadataWrite` as `blocked-by-archive`; their descriptions are the approved next-maintenance labels, not a claim that GitHub accepted a write while the archive was read-only. Deleted predecessors live in a separate `deletedRepositories` section so they cannot be mistaken for repositories whose GitHub metadata can still be managed.

The historical `Norfolk-Group/norfolk-starter` repository was deleted after its retained material was harvested into Norfolk Kit. Formal retirement evidence remains incomplete; it is not a second starter.

## How the pieces relate

- **Product OS owns WHAT and WHY.** Kit may implement its approved doctrine; Kit does not amend it.
- **Kit owns the reusable HOW.** New applications begin here, and existing applications adopt from here through explicit, non-destructive branches.
- **Manual renders; it does not govern.** Its currently verified source is Norfolk Kit; it is neither editable policy nor a starter.
- **Brand separates source from distribution.** `norfolk-ai-brand` holds upstream research and source material. Kit's `brand/` directory is the approved, payload-governed distribution snapshot.
- **Agent and skill repositories are narrow tools.** Their local instructions do not become Norfolk-wide policy.
- **Archived design and integration repositories are evidence, not dependencies.** Their `projectStarterReplacement` points new applications to Kit; it does not claim Kit already has feature parity. Promote an approved reusable pattern into Kit instead of extending the archive.

## Changing a role

Change the registry, its blocking test, and this page together. Before applying the matching GitHub description/topic, show a before/after metadata preview and obtain explicit approval for that outward-facing write. The validator requires exactly one canonical template and rejects ambiguous lifecycle or replacement records.

Role labels do not authorize deletion, renaming, transfer, archive-state changes, or default-branch changes. Those remain separate outward-facing actions requiring explicit approval.
