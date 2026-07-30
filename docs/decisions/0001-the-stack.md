# 0001 — The stack

Date: 2026-07-29
Status: Accepted

## Decision

Every Norfolk / KIT Capital project uses: GitHub Codespaces · Doppler · Railway · WorkOS AuthKit · Neon Postgres + Drizzle · Cloudflare R2 (+ Stream for video) · Resend · Sentry · tRPC · Vercel AI SDK · MCP server · shadcn/ui + Tailwind.

## Why

The same twelve decisions had been made from scratch on H-Analytics and again on the Obra Pía portal, with FAA and muxy-case queued behind them. Re-deciding costs days per project and produces subtly different stacks that can't share tooling, runbooks, skills, or governance.

Each choice earns its place by removing a category of future work:

- **Codespaces** — machine independence; no "works on my laptop" state.
- **Doppler** — one secret store, `dev`/`stg`/`prd` configs, `doppler run --` injection. No `.env` on disk anywhere.
- **Railway** — already the hosting pattern; reads secrets from Doppler via a read-only service token.
- **WorkOS AuthKit** — managed auth. Auth is the highest-consequence code to hand-roll.
- **Neon + Drizzle** — one SQL dialect across all projects (see 0003), branching for dev/preview, pgvector when embeddings are needed.
- **R2 / Stream** — S3-compatible object storage in the same Cloudflare account as everything else; media cost decoupled from compute (see 0002).
- **tRPC** — end-to-end types, and the substrate that makes agent-native parity possible rather than aspirational.
- **Vercel AI SDK** — a *library*, not the hosting platform. Model-agnostic, so the in-app assistant can run on Claude, Kimi, GLM, or Qwen without a rewrite.
- **MCP server** — wraps the same tRPC procedures, so agents and humans share one code path.
- **shadcn/ui** — components live in the repo rather than in `node_modules`, so a library update can never restyle the product overnight, and theming is CSS variables by design.

## What this rules out

- Adding a second database dialect, auth provider, storage provider, or email provider to a project without a new decision record.
- Cloudflare Workers as the runtime — it would require an Express rewrite for no user-visible gain. Cloudflare's *media* products work fine from any backend.
- Vercel as the hosting platform (Railway holds that slot). The Vercel **AI SDK** is unaffected — it is a library and is in the stack.
- Hosting-platform-specific lock-in generally: no service whose data or auth cannot be exported.

## Reversal conditions

A layer changes only with a superseding record explaining what broke. Cost alone is not sufficient at current scale — every free tier here comfortably covers a portal-sized workload.
