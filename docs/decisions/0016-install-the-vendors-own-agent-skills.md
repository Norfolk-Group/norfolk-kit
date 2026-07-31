# 0016 — Install the vendor's own agent skills, before writing any integration

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Claude (CTO call)
**Cost of not having done this: two days on H-Analytics auth, and a duplicate WorkOS application that still needs cleaning up.**

## Decision

Before an agent integrates any vendor, **install that vendor's official agent skills and MCP server.** It is a kit-level category, not a per-project afterthought.

Confirmed available today:

| Vendor | Skills | MCP |
|---|---|---|
| **WorkOS** | `npx skills add workos/skills` — ~40 references incl. the vanilla Node/Express path; plus `workos doctor` | `https://mcp.workos.com/mcp` |
| **Cloudflare** | `claude plugin marketplace add cloudflare/skills` | five servers: docs, bindings, builds, observability, core |

Check for others when adopting any vendor. This is now a normal part of adoption, like reading the pricing page.

## Why this is worth a decision record

An agent integrating an unfamiliar service has two ways to proceed: reconstruct the integration from general knowledge and scattered docs, or follow the reference the vendor wrote for exactly this purpose. The first looks identical to the second while it is happening, and only diverges when it fails.

**H-Analytics is the worked example.** Express + Vite is not one of WorkOS's named quickstarts — Next.js, Remix and React Router are — so the agent had to find the less-discoverable "vanilla Node" pattern on its own. Two days went into reconstructing something WorkOS had already written down.

Worse, WorkOS documents **two valid but incompatible integration shapes**: backend-driven (`@workos-inc/node`, the server owns the OAuth exchange and seals the session cookie) and SPA-driven (`@workos-inc/authkit-react`, the browser owns it via PKCE and needs its origin registered separately). Both are correct. Half of each is not, and produces failure that looks like a configuration problem. An agent improvising is *likely* to mix them; an agent following the vendor's reference is not.

## The deeper rule

Two failures on the same day, same shape:

1. The agent could not **see** the system it was debugging — no WorkOS MCP in that repo's `.mcp.json`.
2. The agent did not **have the vendor's instructions** — no WorkOS skills installed.

Both are the same class of problem, and neither is fixed by a better prompt:

> **An agent's competence is bounded by what it can see and what it has been told. When it fails, ask what was missing from those two before concluding it was reasoning badly.**

Two days of apparently-poor work turned out to be entirely reasonable work done blindfolded. The fix is inventory, not instruction.

## Consequences

- `.mcp.json` in the kit carries `workos` alongside `neon` (it already did — H-Analytics simply had not been equipped, which is the argument for the equip verb in one sentence).
- Adopting a vendor means checking for their skills and MCP **first**, and recording the result — including "none exist", so nobody re-checks.
- Vendor diagnostics (`workos doctor`) run before hand-debugging. They exist precisely for the state we spent an hour reconstructing manually.

## Facts worth keeping, verified against WorkOS docs 2026-07-31

- **API keys are environment-scoped, not application-scoped.** A per-application key count of zero does not mean that application is broken. *(This corrects an over-read made earlier today from the admin API.)*
- **Production keys are viewable once, at creation.** Staging keys can be re-read. Lose a production key and it must be regenerated.
- **Production forbids `http://` and `localhost` in redirect URIs.** Staging permits both.
- **Wildcards cannot be used on public-suffix domains** — WorkOS names `*.vercel.app` and `*.ngrok-free.app`. `*.app.github.dev` is the same shape, so **Codespaces URLs cannot be registered by wildcard** and each new Codespace breaks auth. Do WorkOS work locally, or route previews through a subdomain you own with wildcard DNS.
- **`http://localhost:*/auth/callback` is supported** — a port wildcard, localhost only.
- **Invite-only is one dashboard toggle** ("Sign up", per environment) plus SDK-issued invitations. Ricardo's "two modes" requirement is a switch, not a build.
- **`authenticateWithCode` has 8 documented non-error branches** an integration must handle — `email_verification_required`, `mfa_enrollment`, `organization_selection_required`, `sso_required` and others. **A happy-path-only integration throws on all of them**, which is its own multi-day debugging session waiting to happen, and belongs in the auth module from the start.
