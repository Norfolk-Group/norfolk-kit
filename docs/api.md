# API

**Tier: CONTRACT** · Last verified: 2026-08-05

The API is an adapter over transport-neutral capabilities. A capability owns validation, authorization, attribution, and audit behavior once; tRPC, MCP, UI, reports, and schedulers provide caller-specific execution context.

## Capability surface

| Capability | Input | Output | Authorization | Exposure |
|---|---|---|---|---|
| `readReferenceStatus` | non-empty `subject` | subject, `ready`, attributable caller | `reference:read` | tRPC `reference.status`; MCP `reference_status` |
| `requestConsequentialAction` | named action and target | prepared state or structured approval requirement | action permission plus human-only policy | capability core only until an approved product adapter is added |

Caller context always contains `actorId`, `actorType`, `permissions`, `correlationId`, and `transport`. Adapters may enrich it; they may not omit or invent authorization facts.

## tRPC

`reference.status` accepts `{ subject: string }` with a length of 1–100 characters. Authorization failures map to tRPC `FORBIDDEN`. The React client is one ordinary caller of this route.

## MCP

`reference_status` exposes the same capability and returns both human-readable text and validated structured content. The integration test uses the SDK's real linked in-memory transports; it does not replace the MCP boundary with a mock.

Not every capability is automatically an MCP tool. Destructive, legal, payment, external-communication, and other consequential actions require a separately reviewed adapter and the shared human-only policy.

## HTTP

`GET /health` returns `{ "status": "ok", "database": "not-required" }`. It proves the reference host can start without an external service; it is not an authorization or dependency-health claim.

Synthetic `x-actor-*` headers exist only for local reference execution. Production mode rejects them until a verified WorkOS context adapter replaces the reference context factory.

## Errors

| Code | Meaning | Required client behavior |
|---|---|---|
| `FORBIDDEN` | caller lacks the capability permission | do not retry without changed authorization |
| `HUMAN_APPROVAL_REQUIRED` | an agent or unapproved path attempted a consequential action | show the named policy and route to the required human role |
| `VERIFIED_IDENTITY_REQUIRED` | production request lacks the WorkOS identity adapter | fail closed; do not trust caller headers |

Errors may be translated to a transport-native envelope, but codes, correlation IDs, and approval requirements remain stable. Logs and responses never contain credentials or raw session material.
