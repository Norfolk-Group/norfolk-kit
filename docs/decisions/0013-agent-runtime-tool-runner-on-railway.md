# 0013 — Agent runtime: the loop runs in our own server. Not Workers, not Managed Agents

**Date:** 2026-07-31 · **Status:** Accepted, then **amended the same day** · **Decided by:** Claude (CTO call, documented for Ricardo)

> ## ⚠️ Amendment, 2026-07-31 — decision 1 reversed
>
> This record originally chose **Tool Runner** for the agent loop. Tool Runner is an Anthropic SDK feature and works only with Anthropic models.
>
> Hours later Ricardo stated a requirement that makes that wrong: *"I will forever depend on Anthropic so I will need choices depending on the app."* Model portability is a requirement, not a preference.
>
> **Revised decision: the loop runs through the Vercel AI SDK's provider-agnostic agent abstraction, not Tool Runner.** Same place (our Express process on Railway), same tools (tRPC procedures), swappable model. See [0014](0014-agentic-native-and-model-portability.md) for the full reasoning.
>
> Everything else in this record stands unchanged: no Workers, Managed Agents deferred, AI SDK v7 on the client, data-not-components.
>
> Left visible rather than rewritten. The original reasoning was sound *given what was known* — it optimised for the smallest thing that worked, and portability had not yet been stated as a constraint. The lesson is about sequencing, not judgement: **runtime choices should not be made before the portability requirement is known**, because that requirement eliminates otherwise-attractive options.
**Context:** [copilot & parity requirements](../brainstorms/2026-07-31-copilot-and-parity-requirements.md) (R26–R32)
**Verified against official docs 2026-07-31.** Ricardo named "Cloudflare worker", "Vercel SDK", "Claude Managed Agent SDK" and "Cursor dev agents". Those are four different things at four different layers, and one of them was a conflation of two products. Researched rather than assumed.

## Decisions

1. **The copilot's agent loop runs in our existing Express process on Railway**, using the Anthropic **Messages API + Tool Runner** (`client.beta.messages.tool_runner`).
2. **Cloudflare Workers are not adopted.** R2 stays; no compute moves to Cloudflare.
3. **Managed Agents are not adopted now**, but are the right answer later for one specific job.
4. **Vercel AI SDK v7** provides the copilot's client, using the data-not-components pattern.

## 1. Why Tool Runner, not the Claude Agent SDK

Three distinct Anthropic products, commonly conflated:

| | What it is | Where it runs |
|---|---|---|
| **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) | The Claude Code agent loop as a library — file tools, bash, git | Your process; spawns a bundled Claude Code binary |
| **Managed Agents** (public beta, `managed-agents-2026-04-01`) | Anthropic runs the loop *and* a per-session sandbox | Anthropic's infrastructure |
| **Tool Runner** (`client.beta.messages.tool_runner`) | A loop-driver over the plain Messages API: call Claude → run your functions → feed results back → repeat | Your process, your functions |

The Agent SDK is built for **coding agents** — reading files, running bash, editing repos. Our copilot's tools are "query these investors", "export this report", "navigate to that screen". Handing it a filesystem-and-bash agent would be both the wrong shape and a needlessly large attack surface for a tool driven by an authenticated end user.

Tool Runner is exactly the missing piece and nothing more. We already have the tool surface (tRPC procedures, per R26) and the execution context (WorkOS-authenticated user, Neon, R2, Resend). We only need something to drive the loop.

**This is a direct consequence of the parity rule.** Because every capability is already a procedure, the agent runtime's only job is to call them. Had parity not been decided first, we would be shopping for a platform to build capabilities *in*, which is a much larger and more locked-in choice.

## 2. Why not Cloudflare Workers

Ricardo named Workers, and decision [0005](0005-railway-alone.md) says Railway alone. The honest question is whether Workers do something Railway cannot.

**They do not, for this system.** Verified:

- Workers' advantage is edge execution in 300+ cities, zero idle cost, and spike absorption. None is a need here — one server, a defined user base, no traffic-spike problem.
- The CPU limits would *not* have blocked us (30s default, configurable to 5 min; waiting on the Anthropic API is not billed CPU, and wall-clock is unlimited while the client stays connected). So this is not a "can't" — it is a "no reason to".
- For inbound SMS/RCS webhooks and scheduled jobs, a Worker is not meaningfully better than a Railway endpoint plus cron. Delivery timing is dominated by carrier latency, not by where our server sits.

Cloudflare does have a real Agents SDK (stateful agents on Durable Objects, with SQLite, WebSockets and hibernation). It is a legitimate product. It is also a second place code lives, a second deployment story, a second set of limits, and a second thing to debug at 2am — bought for capability we do not need.

**Adopting it would trade a real cost for a theoretical benefit.** Decision 0005 stands.

*Revisit if:* genuinely global users where edge latency is felt, or a workload whose idle cost on Railway becomes material.

## 3. Managed Agents — later, for one specific job

Not now: the copilot is interactive, scoped to a logged-in user's session, and short-lived per request. Managed Agents is built for autonomous, long-running, container-isolated work, priced at $0.08 per session-hour on top of tokens, and is not currently eligible for Zero Data Retention.

It becomes the right answer for **unattended background work** — "generate this month's investor report and email it" running at 3am with no user present. Worth revisiting when that exists, not before.

## 4. Vercel AI SDK v7 — and the trap in it

Current major is **v7**; packages `ai` and `@ai-sdk/react`.

**The important finding:** the obvious way to render charts and spinners into a conversation — AI SDK RSC's `streamUI`, where the model streams React components — is **explicitly not recommended for production by Vercel's own docs**, which direct users to migrate to AI SDK UI.

The recommended pattern is better for us anyway: **tools return data, our React code decides what to render.** The model never chooses components. That keeps rendering under our control, removes an obvious injection surface, and avoids any Next.js/RSC dependency — which matters because our stack is Vite, not Next.

**Client-side tool execution is supported**, and it is the mechanism for R30 ("the copilot changes the screen"). A tool declared without a server-side `execute` surfaces to the browser, which performs the navigation and returns the result. Server tools and browser tools appear to the model as one list — which is what R30 requires.

*Flagged honestly:* Vercel's documented examples are Next.js-only. The transport is plain HTTP streaming and framework-agnostic by design, so Vite + Express is sound, but it is a community pattern rather than a documented one. Expect to write the adapter.

## 5. Cursor dev agents — real, and available

Both exist and are documented: a headless CLI (`cursor-agent -p`, JSON/stream output, for CI) and a **Background Agent API** (REST; create runs, stream progress via SSE, push commits, open PRs) — public beta, paid plan required. No gap; usable when we want agents doing repo work rather than app work.

## 6. Comms, for the record

- **Twilio RCS is generally available** (since Aug 2025, 20+ countries, automatic SMS fallback). One planning constraint: **sender onboarding is a manual, Twilio-mediated brand-verification step, not an API call.** Budget calendar time, not developer time.
- **Resend supports inbound email.** Configure MX, subscribe to `email.received`; the webhook carries metadata and the body is fetched separately. So R31's "check emails" needs no new vendor.

## What this rules out

- **A second compute platform** for the foreseeable future. One place code runs.
- **Model-chosen UI components.** Tools return data; we render.
- **Building an agent loop by hand.** Tool Runner exists; R32 was explicit about not hand-coding plumbing.
