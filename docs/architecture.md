# Architecture

**Tier: CONTRACT** · Last verified: 2026-08-29

Norfolk Kit is the executable reference implementation of the Norfolk AI Product OS. Product OS owns doctrine and rationale; Kit demonstrates the compatible implementation pattern. A product may replace adapters and modules, but it may not bypass the capability, authorization, or audit boundaries described here.

This architecture belongs to the sole application template. Adjacent Norfolk repositories have distinct non-template responsibilities recorded in [`repository-roles.md`](repository-roles.md); their local instructions do not override this implementation or Product OS doctrine.

## System shape

```text
React client ─┐
tRPC caller ──┼─> transport adapter ─> capability service ─> data/integration ports
MCP caller ───┤                         │
report/job ───┘                         └─> authorization + audit policy
```

- `src/capabilities/` contains transport-neutral application capabilities, validation boundaries, authorization policy, idempotency/audit hooks, and optional-module lifecycle behavior.
- `src/adapters/trpc/` and `src/adapters/mcp/` translate caller-specific input and execution context into the same capabilities.
- `src/server/` is the Express 5 host. The reference health path has no database dependency; products connect Neon through Drizzle when persistence is required.
- `src/client/` is the React/Vite client. Storybook renders its real components, and `tools/artifacts/` builds the same source into an offline single-file specimen.
- `src/server/db/` establishes the Drizzle/Postgres boundary without putting an external database in the default runtime.

## Data flow

Every call supplies actor ID, actor type, permissions, correlation ID, and transport. The capability—not the transport—authorizes the operation and returns an attributable result. Consequential actions use the shared `human-only-consequential-actions-v1` policy and record the denial or prepared state before an adapter responds.

Media bytes never cross Express. Products obtain a short-lived presigned grant and transfer directly to R2 or Stream as required by [decision 0002](decisions/0002-presigned-direct-uploads.md).

## Infrastructure

- Node 24.13.0 and pnpm 11.13.0 are pinned by `.nvmrc`, `package.json`, and the Codespace image.
- Vite builds the client; TypeScript builds the Express server; Railway runs `pnpm start` through Doppler.
- WorkOS AuthKit is the only approved production identity source. The U12 reference uses synthetic headers only outside production and fails closed in production until the WorkOS identity adapter is installed.
- Neon/Postgres and Drizzle are the persistence standard. The reference server starts without a database so clean installs and capability tests are deterministic.
- Storybook React-Vite and Playwright use the real component source. The offline artifact is generated with `vite-plugin-singlefile` and must make no external request.

## Constraints and known limits

- This foundation does not yet implement the full WorkOS interaction contract, database migrations, R2, Resend, Sentry, or product modules. Later Product OS units install them through explicit adapters and manifests.
- Existing animation sources are preserved but remain outside the default TypeScript and lint programs until the motion-lineage reconciliation unit supplies their missing component aliases and governed runtime dependencies.
- The sample capability and module are synthetic reference behavior, not client business logic.
- Optional modules are absent by default and must declare routes, configuration keys, and a runtime entry in one manifest so removal leaves no orphan configuration.

## Boundaries

- Clients and adapters never decide authorization.
- Capability services never read HTTP, tRPC, MCP, UI, or scheduler globals.
- Adapters may set transport-specific timeouts, streaming, retry, and identity translation; they may not duplicate business or permission policy.
- Database code does not enter the default health or capability path.
- Model vendor and agent runtime choices remain configuration outside capability code.
- No client identity, credential, product-specific palette, or client-derived business rule belongs in Kit.
