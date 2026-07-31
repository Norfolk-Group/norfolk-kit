# Owner's Guide — for Ricardo

**Tier: REFERENCE** · Last verified: 2026-07-31

This is the one document written for you, not for agents. It answers: what is all this, how do I use it, why is it the way it is, and what happens next. When you're lost, start here.

---

## What is this repo?

**`norfolk-kit` — you call it the core-stack — is Norfolk AI's toolbox.** Everything a project should start with or conform to lives here: the rules, the tools, the brand files, the tech-stack decisions, and (soon) the two skills that carry all of it into any repo. It is Norfolk IP; it gets *applied to* client work (KIT Capital's repos), but it lives in your house.

You have three GitHubs, one identity: **Norfolk-Group** (your companies — this repo lives here), **KIT-Capital** (client org you administer), **ricardo-cidale-personal** (the login your Codespaces use).

## How do I use it? — phrases that work

You never need a terminal. Say these to Claude Code, in any repo:

| Say | What happens |
|---|---|
| **"equip this repo"** *(once built)* | Kit tools/rules/brand added to the repo as a pull request you approve |
| **"tidy this repo"** *(once built)* | Repo audited against the standard layout; cleanup proposed as a PR; nothing silently deleted |
| **"plan it"** | Turns a finished brainstorm into a sequenced build plan |
| **"research X deeply"** | Parallel research agents against official sources, verdicts with citations |
| `claude-glm.sh` *(in a Codespace terminal, via* `doppler run --` *)* | Claude Code runs on GLM — the closest third-party model to Opus, for cheap bulk work |
| **"check model calibration"** | One command verifies every launcher still points at each provider's best model |

The full launcher list (8 models: Kimi, GLM, Qwen, Grok, DeepSeek, GPT, Gemini, Llama) is in `tools/launchers/README.md`.

## Where is everything?

| Looking for… | Go to |
|---|---|
| The rules that govern all work | `AGENTS.md` (one file, read by Claude Code *and* Cursor) |
| Why a decision was made | `docs/decisions/` — each record says what it **rules out**, so it can't be quietly undone |
| The settled tech stack + reasons + risks | `docs/brainstorms/2026-07-31-core-stack-requirements.md` (R10) and the visual: `docs/artifacts/core-stack.html` |
| The animations | `src/components/animations/` + the live catalog `docs/artifacts/motion.html` |
| The model launchers | `tools/launchers/` |
| Setup guides (Windows / Mac / Replit) | `docs/setup/` |
| This week's full requirements (R1–R17) | `docs/brainstorms/2026-07-31-core-stack-requirements.md` |

## Why is it this way? — the decisions in one breath each

- **Railway hosts everything** — the only platform that runs your actual apps without rewriting them; data lives elsewhere so a Railway outage can't destroy anything.
- **Neon + WorkOS + R2, not Supabase** — Supabase would downgrade two pillars to gain one dashboard, and its security model fights your architecture.
- **Voyage for AI search** — cheapest top-tier option, Anthropic's own pick, ~$3 to ever undo.
- **Docker stays invisible** — Codespaces and Railway already containerize everything; you never touch it.
- **`AGENTS.md` is the one rules file** — the vendor-neutral standard Cursor reads natively; Claude Code reads it through a one-line bridge. Cursor is welcome as a friend any time.
- **Plugins are pinned in the repo** — superpowers + compound-engineering + greptile load automatically in every clone; nobody edits settings by hand again.
- **Claude is the baseline; the fleet is a resource** — 8 third-party models as drivers or APIs, each verified against the provider's live catalog before being trusted.
- **Everything verified against official docs, never assumed** — the standing policy (R13), bought with two real mistakes this week (a fabricated package name; a double-encoding that corrupted three files).

## What's NOT done yet — the build list, in order

1. **Brand import** — curate 9 logo sets + avatars into `brand/` (sources mapped on your PC; 3 gaps flagged: KIT Partners needs a PNG export, Rituel needs a dark variant, Colliers is low-res)
2. **Decision records 0005+** — write this week's research verdicts into permanent records
3. **The equip skill** — then its first live run: equipping Obra Pía properly
4. **The tidy skill** + the canonical repo layout it audits against (drafted *with you* before it ever runs)
5. **Reviews with you** — governance rules read-through; design-system populated with real standards; avatar/logo picks blessed
6. **The consolidation** — retire Manus and Perplexity subscriptions as Claude Code absorbs their jobs; record the savings

Say **"plan it"** to have this sequenced formally, or pick any single line and say "do #1."

## Meanwhile, the other big thread

The **Obra Pía WorkOS auth swap** is queued in the Codespace (branch `feat/workos-auth`, prompt ready). Database and file storage already migrated and verified in production. After auth: deploy to Railway → test → point `investor.obrapia.co` at it → cancel Manus.
