# 0005 — Railway, alone, hosts everything

Date: 2026-07-31
Status: Accepted

## Decision

Every product deploys to Railway. No Vercel hosting, no frontend/backend split across providers. (The Vercel **AI SDK** — a code library — remains in the stack and is unaffected.)

## Why

Four-agent research against official July-2026 sources (full report in the 2026-07-31 session outputs; distilled in the origin brainstorm's R10):

- Railway is the only candidate that runs the actual portfolio — long-lived Express 5 servers, cron, background workers, WebSockets, Python scripts — with zero architectural rewrite. Typical app cost: ~$5–15/mo on usage pricing.
- Vercel runs short-lived functions, not servers: 300s default / 800s max duration on Pro, WebSockets unsuitable for long sessions, per-seat pricing on top of metering. Moving there means re-architecting every app, not redeploying it.
- The split option (Vercel frontends + Railway APIs) buys CDN caching a Vite SPA doesn't need, at the cost of two dashboards, two bills, CORS plumbing, and two DNS targets — the opposite of the one-answer goal.
- Dark horses (Render, Fly, DigitalOcean) are competitive but none beats Railway enough to justify a mid-flight switch.

## Risk, on the record

Railway had an 8-hour platform outage in May 2026 (Google Cloud suspended their account) and a nontrivial incident rate (44/90 days at research time). **Accepted because the architecture already contains the mitigation:** data (Neon) and files (R2) live off Railway — an outage degrades availability, it can never destroy data. A status monitor should watch investor-facing apps.

## What this rules out

- Vercel as a hosting target for any product.
- Splitting one product's hosting across two providers.
- Migrating to Render/Fly/DO without a superseding decision record.

## Reversal conditions

Chronic reliability regression (sustained incident-rate worsening) or a hostile pricing change. Re-evaluate Render first — closest peer for this exact profile.
