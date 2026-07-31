# 0010 — Fleet doctrine: Claude is the baseline, everything else is a resource

Date: 2026-07-31
Status: Accepted

## Decision

Claude models are the baseline for judgment-heavy, agentic, and investor-facing work. Eight third-party models run as cost-control drivers through the kit's launchers — Kimi, GLM, Qwen, Grok, DeepSeek, GPT, Gemini, Llama — and as API resources through the Vercel AI SDK. Every launcher slug is verified against the provider's live catalog before being trusted, and registered in `check-models.mjs` so calibration drift is checkable with one command. Each repo records its default driver in its AGENTS.md (bulk/mechanical → cheap fleet; judgment/investor-facing → Claude).

## Why

- The capability gap is real and measured: at research time, Claude Opus led the nearest fleet model by ~17 points on SWE-bench Pro (79.2 vs GLM-5.2's 62.1). The fleet's value is cost, not parity — GLM-5.2 is the closest stand-in for bulk work.
- The launcher approach rides documented Anthropic environment variables (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_DEFAULT_*_MODEL`) — validated against official docs 2026-07-31, not undocumented internals.
- Slugs rot: providers ship new flagships every few months. The verified-slug rule plus `check-models.mjs` exists because a stale slug silently degrades quality or 404s. (Gemini and Llama slugs were probed live on adoption day: `google/gemini-3.6-flash`, `meta-llama/llama-4-maverick` — the latter carrying an honest second-opinion posture note.)
- Per-repo default-driver assignments turn the global cost-discipline rule into checked-in policy instead of per-session memory (origin R20).

## What this rules out

- Adding a provider or model slug without live-catalog verification and a `CONFIGURED` entry in `check-models.mjs`.
- Application code depending on launchers (dev tooling only — apps use the Vercel AI SDK lane).
- Ad-hoc per-session model choices for repo work where an AGENTS.md assignment exists.
- Treating any fleet model as Claude-equivalent for auth, money math, or investor-facing output.

## Reversal conditions

Doctrine, not a vendor bet — membership changes via new records as the frontier moves. If a fleet model demonstrably closes the agentic gap on real work here, its posture note updates with the evidence.
