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

- [x] **Harvest from `norfolk-starter`** — DONE 2026-07-31. Kept: the three setup guides (→ `docs/setup/`) and the check/restore scripts (→ `tools/setup/`). **Not kept: the 12 `nai-` skills** — read before deciding (nai-feature, nai-finance sampled in full): they are thin persona-wrapper routers ("You are Rafael…", "You are Isabela…") that route work into styles now handled with far more depth by the standard superpowers + compound-engineering bundle (R9), and they're built on named human personas — the pattern deliberately removed elsewhere in the kit. Their one durable idea (cost-aware work sizing) already lives in Ricardo's global rules. `.cursor`/`.cursorrules` not kept — Cursor isn't in the toolchain; `.github/` workflows were Next.js/Prisma-specific.
- [x] **Then** archive `norfolk-starter` — DONE 2026-07-31, description updated to point here, repo archived (read-only; delete later if desired — Ricardo authorized full deletion, archive chosen as the free reversible version of the same intent).
- [ ] Inspect and remove the `norfolk-starter/` directory inside H-Analytics.
- [ ] Application scaffold: `src/procedures/`, Drizzle schema, WorkOS auth module, R2 presigned-upload module (with `forcePathStyle`), Resend setup, Sentry init, tRPC + MCP server wiring, `package.json`, `railway.toml`.
- [ ] `pnpm docs:artifacts` generator + the five HTML artifacts (components, motion, icons, architecture, navigation) per §10 of the governance rule.
- [ ] The CI gates the governance rule promises: docs-sync check, index-completeness check, tier-header check, artifact-freshness check. **Until these exist, the enforcement claims in the governance rule are aspirational — that gap is itself a doc–code conflict and should close soon.**
- [ ] Decide whether `hbg-design-system` (shared UI components, themes, icons, charts) becomes the basis of a `@kit/ui` shadcn registry.

## Open question

Whether the `nai-` wrapper concept survives at all. It predates this kit's governance layer and may overlap with it — a `nai-review` wrapper and this kit's three-tier review rule could contradict each other. Resolve before copying the skills over, not after.
