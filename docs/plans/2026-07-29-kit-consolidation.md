# Kit consolidation

**Status: In progress** · Started 2026-07-29

Consolidating three overlapping starter efforts into one canonical kit.

## The three sources

| Source | Holds | Disposition |
|---|---|---|
| `Norfolk-Group/norfolk-kit` *(this repo)* | Stack decisions, governance, devcontainer, MCP config, alt-model launchers | **Canonical.** Everything converges here. |
| `Norfolk-Group/norfolk-starter` | `nai-` skill wrappers, setup guides (Win/Mac/Replit), Cursor + `.agents` config, setup health-check scripts, `.github/` CI — *plus* a conflicting Next.js/Prisma/Clerk app scaffold | **Harvest, then archive.** The operating layer is stack-agnostic and worth keeping; only the app scaffold conflicts. |
| `H-Analytics/norfolk-starter/` *(directory)* | An earlier in-repo attempt at the same idea | **Inspect, then remove.** Check for anything not already superseded. |

## Done

- [x] `norfolk-kit` created in `Norfolk-Group`, private, marked as a template repo
- [x] Governance rule hardened from the v1 Dropbox template (precedence, tiers, decision records, CI gates, freshness, anti-bloat, HTML artifacts) → `docs/SYSTEM-GOVERNANCE-RULE.md`
- [x] Docs index/router + CONTRACT/REFERENCE skeletons
- [x] Decision records 0001–0003 (stack · direct uploads · one SQL dialect)
- [x] Devcontainer that installs Doppler + Claude Code and puts launchers on PATH
- [x] `.mcp.json` — neon, workos, railway, context7, shadcn (all keyless/OAuth)
- [x] Six alt-model launchers + shared lib, carried over verbatim from H-Analytics
- [x] Secret scan on everything committed — clean

## Next

- [ ] **Harvest from `norfolk-starter`** — the 12 `nai-` skills, the three setup guides, `.cursor`/`.cursorrules`/`.agents`, `scripts/check-norfolk-setup.*`, and `.github/` workflows. Review each against this kit's stack before copying; some `nai-` skills may reference Prisma/Clerk and need rewording for Drizzle/WorkOS.
- [ ] **Then** archive `norfolk-starter` with a README pointing here. Not before — archiving first would bury the skills.
- [ ] Inspect and remove the `norfolk-starter/` directory inside H-Analytics.
- [ ] Application scaffold: `src/procedures/`, Drizzle schema, WorkOS auth module, R2 presigned-upload module (with `forcePathStyle`), Resend setup, Sentry init, tRPC + MCP server wiring, `package.json`, `railway.toml`.
- [ ] `pnpm docs:artifacts` generator + the five HTML artifacts (components, motion, icons, architecture, navigation) per §10 of the governance rule.
- [ ] The CI gates the governance rule promises: docs-sync check, index-completeness check, tier-header check, artifact-freshness check. **Until these exist, the enforcement claims in the governance rule are aspirational — that gap is itself a doc–code conflict and should close soon.**
- [ ] Decide whether `hbg-design-system` (shared UI components, themes, icons, charts) becomes the basis of a `@kit/ui` shadcn registry.

## Open question

Whether the `nai-` wrapper concept survives at all. It predates this kit's governance layer and may overlap with it — a `nai-review` wrapper and this kit's three-tier review rule could contradict each other. Resolve before copying the skills over, not after.
