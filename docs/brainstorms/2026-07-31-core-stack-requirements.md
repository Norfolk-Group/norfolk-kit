---
date: 2026-07-31
topic: core-stack-equip-and-tidy
---

# Core-Stack: Equip & Tidy Any Repo Without Touching a Terminal

## Problem Frame

Ricardo runs a growing portfolio of repos (H-Analytics, Obra Pía investor portal, FAA, muxy-case, more coming) as a non-programmer CTO working through Claude Code. Today every new project re-decides its stack, and every existing repo drifts into its own layout, accumulating stale files, scattered docs, and junk. Standardizing by hand requires GitHub/git fluency Ricardo doesn't have and shouldn't need — the July 30 session proved it: equipping one repo with launchers took an hour of chmod, auth, stash, and GPG failures, each needing hand-holding.

`Norfolk-Group/norfolk-kit` already exists as the canonical template (governance rules, docs skeletons, MCP configs, alt-model launchers, motion library). What's missing: brand assets, a documented canonical repo layout, and — most importantly — a **hands-free way to apply the kit to any repo, new or existing, and keep it applied over time**.

## Requirements

- **R1. One toolbox, not one tool.** `norfolk-kit` is the single canonical repo (Ricardo's term: "core-stack"), but it is explicitly a **toolset** — independent tools that each work alone (launchers, brand assets, governance rules, skills, calibration checker, docs skeletons, canonical layout), housed together. The "equip" verb is just the hand that carries the right tools into a repo; no tool requires the others. Nothing kit-related is maintained anywhere else.
- **R2. "Equip this repo" — additive, spoken in plain English.** From a Claude Code session in any repo, saying "equip this repo" causes Claude Code to read the kit from GitHub, compare against what the repo already has, add what's missing, skip or flag what conflicts, and deliver the result as a pull request. It never overwrites existing work without flagging it, and never requires Ricardo to run a git or shell command.
- **R3. "Tidy this repo" — reorganizing, also plain English, also PR-only.** Audits any repo against the kit's canonical layout: misplaced files, stale artifacts, dead scaffolding, junk at root. Proposes moves and archivals as a PR. **Never silently deletes** — questionable items move to `archive/` with a dated note; true deletions are listed for explicit approval in the PR description.
- **R4. Two separate verbs, deliberately.** Equip (adds, run ~once) and Tidy (moves/archives, run periodically) stay separate skills so a mid-project equip can never trigger an unrequested reorganization. Both live in the kit itself, so improving them once improves them for every repo.
- **R5. Brand assets join the kit — nine brands, canonical list set by Ricardo (2026-07-31).** A `brand/` area with one folder per brand, plus avatars and a short usage note (which variant on dark vs light, minimum sizes). All sources located on Ricardo's PC (Dropbox → `Cidale Interests/Companies/…`); import is a *curation*, not a bulk copy — source folders mix canonical logos with screenshots, third-party partner marks, and duplicates.

  | Brand | Source | Status |
  |---|---|---|
  | Norfolk AI | `Norfolk AI/Brand_Assets/Logos/drive-download…` | Full color set (azul/branco/gradiente/amarelo/wireframe, PNG+SVG) + animated mp4 |
  | Cidale | `…Brands/Cidale` | 2 files only (signature-dark, workspace) — thin but canonical |
  | Norfolk Consulting Group | `…Brands/Norfolk` | Vortex export set (1x/2x/4x/SVG/LinkedIn/Google), Knight chess-horse (+gold), .ai/.eps sources |
  | KIT Capital | `…Brands/KIT Capital` | Spherical (transparent+solid), flat PNG/JPG |
  | KIT Capital Partners | same folder, `Kitcapital partners - azul/branco.ai` | **Gap: .ai sources only — needs PNG/SVG export before import** |
  | Obra Pía | `…Brands/KIT Capital/Logo Obra Pia 1.png` (+@2x), `…Brands/Obra Pia/…Foundation Logo.png` | Good |
  | El Claustro | `Obra Pia/El Claustro/From Clarena/LOGO_ EL CLAUSTRO 2025…` | Official 2025 set (RGB A–D PNG + CMYK/RGB PDF) |
  | La Plage | `El Claustro/From JuanK/Rituel/Logos/LOGO LA PLAGE.png` | Single variant |
  | Rituel du Sol | same folder, `RITUEL DU SOL PNG BLANCO.png` | **Gap: white-only — unusable on light backgrounds; request/derive a dark variant** |
  | Colliers | `…Brands/Colliers/colliers logo.png` | **Gap: 3KB file, likely low-res — verify before relying on it** |

  Bonus found in the same JuanK folder: **Le Petit Salón** and **Salón du Ciel** logos (sister venues to La Plage/Rituel du Sol) — include unless Ricardo objects. Avatars: Synthesia `RC Avatar 1` / `RC Avatar 2 Field`.
- **R6. Canonical layout is documented, not implied.** A single file in the kit defines the standard repo anatomy (where code, docs, scripts, tools, brand, artifacts, and archive live) and what counts as junk. Tidy audits against this file, so tightening the standard once tightens it everywhere.
- **R7. Ricardo's total workflow is: say the verb, review the PR summary in plain English, click approve.** Any design that requires more GitHub skill than clicking "Merge" fails the requirement. (Claude Code may click it for him with confirmation.)
- **R8. Works in every environment he uses** — local Claude Code, Codespaces, desktop app — without per-machine setup beyond what the kit's own equip step installs.
- **R9. The Claude Code skill/plugin bundle is part of the kit.** Equip ensures every environment has the full standard set enabled: **all Superpowers skills** (brainstorming, TDD, systematic-debugging, verification, worktrees, etc.), **compound-engineering** (Every's plugin — ce-brainstorm/plan/work/review), and **greptile**, matching the org-wide plugin standard already in Ricardo's global config. Today this took a hand-written settings.json edit in the Codespace (2026-07-31); after Equip it's automatic.
- **R10. Settled tech-stack pillar ("must-have providers") — RESOLVED 2026-07-31 by four-agent deep research** (July-2026 pricing/docs verified against official sources; full reports in session task outputs, to be distilled into kit decision records):

  | Category | Settled on | Decisive evidence |
  |---|---|---|
  | Hosting | **Railway, alone** | Only option running the actual stack (long-lived Express servers, cron, workers, WebSockets) without an architecture rewrite; Vercel functions cap at ~13 min and kill long-running servers. Split option rejected: two dashboards/bills/CORS for CDN benefits a Vite SPA doesn't need. ~$5–15/mo per app. **Risk on record:** May-2026 8-hour Railway outage (GCP account suspension), 44 incidents/90 days — mitigated because Neon+R2 keep data off Railway; add a status monitor. |
  | Database | **Neon** (reaffirmed) | Branching is near-free and instant vs Supabase's ~$10/mo per branch; 80% storage price cut post-Databricks acquisition. |
  | Auth | **WorkOS** (reaffirmed) | Built for invite-only portals + enterprise SSO future; 1M MAU free; admin UX a non-programmer can run. |
  | File storage | **Cloudflare R2** (reaffirmed) | $0 egress forever vs $0.09/GB — structurally decisive for a document-download portal. |
  | **Supabase** | **Not adopted.** | Would downgrade DB (branching) and auth (enterprise) to gain one dashboard; its RLS/client-direct model fights the tRPC architecture; would burn this week's completed migrations. **Revisit trigger:** realtime collaboration (presence/live cursors) becoming a hard requirement — and even then evaluate a standalone realtime service first. |
  | Embeddings | **Voyage AI — portfolio standard** | Cheapest frontier option ($0.06/M vs $0.12–0.15); post-MongoDB-acquisition trajectory is investment (voyage-4 Jan 2026, voyage-context-4 Jun 2026); still the only vendor Anthropic names. Quality deltas at our scale are noise; full re-embedding escape hatch costs ~$3. **Risk:** future Atlas-exclusive steering by MongoDB. |
  | Docker | **Kit posture: invisible by design** (all claims verified) | Codespaces already runs every session in a container (devcontainer.json); Railway auto-containerizes via **Railpack** (Nixpacks' successor, zero config); the standard OCI image is real anti-lock-in insurance for the app artifact (not a one-click account move). **No Dockerfiles in the kit; writing one is an exception requiring a decision record.** Known legitimate exceptions: self-hosting Docker-only tools (e.g. Documenso), headless-Chrome/PDF rendering, polyglot Node+Python services. |
  | Secrets / Email / Errors | **Doppler / Resend / Sentry** (unchanged, in production) | Not re-opened; working. |
- **R12. Visual explainers are first-class kit outputs.** Ricardo's preferred way to absorb and keep decisions is HTML — text, diagrams, or both. Every major kit decision or system therefore gets a self-contained HTML one-pager (like the motion catalog already in the kit, and the core-stack overview produced with this brainstorm), stored in the kit's `docs/artifacts/` and matching governance rule §10. Explaining in prose only, when a diagram would serve better, fails the requirement.
- **R11. Review pass over the three foundational documents, with Ricardo.** As part of kit completion (not deferred): (a) the **Fundamental Rules of Governance** (SYSTEM-GOVERNANCE-RULE v2) — read together, amend, re-bless; (b) the **canonical folder organization** (R6's layout file) — drafted then walked through with him before Tidy ever runs against it; (c) **design standards** — the kit's design-system.md is currently a skeleton; populate it with the real standards (brand palettes from R5's assets, typography, the motion library's vocabulary, forbidden patterns) so equipped repos inherit actual design law, not an empty template.

## Success Criteria

- Equipping a fresh repo or an old one takes minutes of Ricardo's attention, not an hour of terminal pain (the July 30 baseline).
- Running Tidy on H-Analytics or Obra Pía produces a reviewable PR that Ricardo can understand and approve without asking what any change means.
- Six months in, all active repos share the same recognizable anatomy — opening any of them feels familiar.
- The kit's rules changed once → next equip/tidy pass propagates the change everywhere. No repo-by-repo hand editing.

## Scope Boundaries

- **Not** a public product — private to Norfolk/KIT orgs.
- **Not** automatic enforcement (no bots pushing unrequested changes). Verbs run when Ricardo asks; scheduled runs are a possible later phase, opt-in.
- **Not** a migration of app code — Equip/Tidy touch structure, tooling, docs, and assets, never rewrite application logic.
- **Not** cross-org secret management — Doppler remains the secrets story; the kit only documents key *names*.
- Brand: Norfolk AI assets only in v1; other companies later.

## Key Decisions

- **Claude Code is the courier, not scripts or manual copying.** Skills + the kit repo replace installers, template-syncing bots, and hand copy-paste. Rationale: adapts to each repo's reality, explains itself in plain English, and matches how Ricardo actually works. (Decided by Claude in CTO capacity; Ricardo delegated mechanism decisions.)
- **PRs are the only write path.** Both verbs produce branches + PRs, never direct commits to main. Safety and reviewability over speed.
- **Adopt "core-stack" as the friendly name; repo stays `norfolk-kit`.** Avoids a rename while using Ricardo's vocabulary in docs and skill language.
- **The existing template-repo flag stays.** "Use this template" remains the fastest path for brand-new repos; the Equip skill covers the (more common) existing-repo case. Same source, two doors.

## Dependencies / Assumptions

- `Norfolk-Group/norfolk-kit` exists with governance, launchers, MCP config (done as of 2026-07-30).
- Cross-org access from Codespaces requires the `gh auth login` dance once per environment (hit on July 30); the Equip skill should detect and walk through it — or the kit repo gets made internal/public-to-org to remove the friction. **[Deferred to planning]**
- Brand source files are on Ricardo's PC (Dropbox paths recorded above); one-time upload into the kit needed from this machine.

## Outstanding Questions

### Resolve Before Planning
*(none — mechanism decisions were delegated and are recorded above)*

### Deferred to Planning
- [Affects R2][Technical] Skill distribution: copied into each repo's `.claude/skills/` by Equip vs. fetched live from the kit vs. packaged as a Claude Code plugin marketplace. Plugin route may be cleanest for "improve once, works everywhere."
- [Affects R3][Technical] Canonical layout draft: derive from H-Analytics' current structure (most mature) or design fresh and migrate everyone toward it.
- [Affects R2, R8][Technical] Codespaces cross-org auth: solve in-skill (guided login) or at the org level (kit visibility). 
- [Affects R5][Needs research] Best canonical file set from the avatar folders (several variants exist; pick with Ricardo at import time).

## Next Steps
→ `/ce:plan` for structured implementation planning
