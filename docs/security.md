# Security

**Tier: CONTRACT** · Last verified: 2026-08-05

## Authentication

WorkOS AuthKit is the sole approved production authentication provider. Products must verify the WorkOS session server-side and translate it into a caller context before exposing any capability. Clerk is not supported.

The reference app accepts synthetic `x-actor-*` headers only outside production so tests can exercise caller attribution without a tenant. `createHttpContext` fails closed with `VERIFIED_IDENTITY_REQUIRED` in production until the WorkOS adapter is installed. These headers are not an authentication protocol and must never be enabled on a deployed application.

## Sessions

Production sessions use WorkOS-managed identity and an integrity-protected, secure, HTTP-only cookie with environment-specific `WORKOS_COOKIE_PASSWORD`. Return intent is allowlisted and integrity protected. OAuth transaction state, CSRF protection, replay limits, rotation, expiry, logout, organization switching, and session-recovery behavior are implemented in the later first-party AuthKit unit; no product may improvise a second session system meanwhile.

## Authorization model

Server-side capability authorization is authoritative. UI checks only improve presentation. Every caller supplies attributable identity, permissions, correlation ID, and transport; every adapter invokes the same capability policy. The named `human-only-consequential-actions-v1` policy covers external communication, deletion, moving money, and accepting legal terms. Agents may prepare work but cannot approve these actions.

## Data handling

- Credentials and environment values live in Doppler; `.env.example` contains names only.
- Neon environments are separate and self-identifying. Destructive production work is refused and schema migrations are forward-only in CI.
- Files move directly between the client and R2 or Stream using short-lived grants. Express records metadata but never proxies file bytes.
- Audit records contain actor, capability/action, outcome, correlation ID, and time. They do not contain secrets, raw WorkOS sessions, or unnecessary client content.

## Threat notes

This foundation defends against authorization drift between tRPC and MCP, agent bypass of human-only actions, accidental production trust in synthetic headers, optional-module residue, and external network dependencies in review artifacts.

It does not yet constitute a deployable authentication implementation, a complete abuse/rate-limit system, or a product threat model. Each product must complete WorkOS integration, role mapping, retention, rate limits, security-event logging, and domain-specific threats before production use.
