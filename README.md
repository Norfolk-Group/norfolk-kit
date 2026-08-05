# Norfolk Kit

The executable starter and reference implementation for Norfolk AI products and client engagements. One runnable stack and one capability architecture let each product begin from a tested baseline instead of re-litigating infrastructure.

The private **Norfolk AI Product OS** owns canonical doctrine, standards, and rationale. Kit implements a compatible “how”: application scaffolding, adapters, components, modules, checks, and adoption tooling. Client accounts—including KIT Capital—consume this system but do not define Norfolk AI identity or own its reusable IP.

**Status:** the U12 reference foundation is runnable locally on `feat/product-os-reference-foundation`; it has not been published or adopted. `Norfolk-Group/norfolk-starter` is **not retired**. Its unique content must be preserved and parity-checked before a separate archive or deletion approval. Tracked in [`docs/plans/`](docs/plans/).

## The stack

| Layer | Choice |
|---|---|
| Workspace | GitHub Codespaces + devcontainer |
| Secrets | Doppler (`dev` / `stg` / `prd` configs) |
| Hosting | Railway |
| Auth | WorkOS AuthKit |
| Database | Neon Postgres + Drizzle ORM (pgvector when needed) |
| Docs & image storage | Cloudflare R2, presigned direct uploads |
| Video | Cloudflare Stream + tus resumable *(only media-heavy projects)* |
| Email | Resend |
| Errors | Sentry |
| API / capability core | tRPC — every capability is a typed procedure |
| In-app AI | Vercel AI SDK (model-agnostic) |
| Agent access | MCP server wrapping the same tRPC procedures |
| UI | shadcn/ui + Tailwind + CSS-variable theming |
| Async / scheduled | Claude Managed Agents *(when needed)* |

Rationale for each choice — and what each one **rules out** — is in [`docs/decisions/`](docs/decisions/). Read those before proposing a swap.

## Start a new project

```bash
# 1. Create the repo from this template (GitHub UI: "Use this template", or:)
gh repo create Norfolk-Group/my-app --template Norfolk-Group/norfolk-kit --private

# 2. Open it in a Codespace. The devcontainer installs Doppler, Claude Code,
#    pnpm deps, and puts the alt-model launchers on PATH automatically.

# 3. Point it at its secrets
doppler login
doppler setup                      # create/pick the Doppler project + dev config

# 4. Run
doppler run -- pnpm dev
```

Then edit `doppler.yaml` — replace `CHANGE-ME` with the Doppler project name.

## Run the reference foundation

```bash
pnpm install --frozen-lockfile
pnpm dev:server     # Express + tRPC on 3000
pnpm dev            # React + Vite on 5173
```

`pnpm verify` runs lint, type checks, unit/integration tests, production build and launch, Storybook, offline-artifact freshness, and the pinned Playwright viewport matrix. Install the pinned Chromium once with `pnpm exec playwright install chromium`.

The local reference uses synthetic caller headers so adapter parity can be tested without a tenant. Production mode rejects them. A product must install the verified WorkOS AuthKit context before exposing capability routes.

## Accounts to provision per project

Each is independent; do them in parallel. Every credential goes **into Doppler only** — never into a file, never into a commit, never pasted into a third-party agent platform.

| Service | Creates | Doppler keys |
|---|---|---|
| [Neon](https://console.neon.tech) | project + `dev`/`production` branches | `DATABASE_URL` |
| [Railway](https://railway.app) | project linked to the GitHub repo | *(reads Doppler via `DOPPLER_TOKEN`)* |
| [WorkOS](https://dashboard.workos.com) | organization + AuthKit config | `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`, `WORKOS_REDIRECT_URI` |
| [Cloudflare R2](https://dash.cloudflare.com) | bucket + scoped API token | `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` |
| [Resend](https://resend.com) | API key + verified sender domain | `RESEND_API_KEY`, `FROM_EMAIL` |
| [Sentry](https://sentry.io) | project | `SENTRY_DSN` |

See [`.env.example`](.env.example) for the complete key surface.

**Railway → Doppler wiring:** generate a **service token** scoped to the `prd` config only, read-only (Doppler → project → `prd` → Access → Service Tokens). Put it in Railway's Variables as `DOPPLER_TOKEN`, and set the start command to `doppler run -- pnpm start`. Never use a personal token for this.

## What's in here

```
.devcontainer/     Codespace definition + bootstrap (Doppler, Claude Code, deps, PATH)
AGENTS.md           the vendor-neutral agent contract; CLAUDE.md imports it
.mcp.json          MCP servers: neon, workos, railway, context7, shadcn
doppler.yaml       which Doppler project/config this repo resolves to
.env.example       every expected key, names only
docs/              the project contract — see docs/README.md for the index
src/capabilities/  transport-neutral authorized application capabilities
src/adapters/      tRPC and MCP adapters over the same capability core
src/client/        React reference interface and Storybook specimens
src/server/        Express host and Drizzle boundary
tools/artifacts/   deterministic self-contained review artifact builder
tools/launchers/   run Claude Code against Kimi / GLM / Qwen / Grok / DeepSeek / GPT
```

## Governance

`docs/` is the source of truth. Before any code or UI change, read the relevant docs, follow them, and update them in the same PR. The full rule — including precedence when sources disagree, the CONTRACT/REFERENCE tiers, decision records, and the CI gates that enforce all of it — is [`docs/SYSTEM-GOVERNANCE-RULE.md`](docs/SYSTEM-GOVERNANCE-RULE.md).

Two rules worth stating on the front page because they are the most commonly violated:

1. **No secrets in code, ever.** Doppler is the only home for credentials.
2. **`/docs` outranks the code.** If they disagree, that's a bug to surface — not a licence to quietly rewrite the doc to match whatever the code happens to do.
