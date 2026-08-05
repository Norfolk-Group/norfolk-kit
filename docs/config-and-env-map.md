# Config and Environment Map

**Tier: REFERENCE** · Last verified: 2026-08-05

Configuration values live in Doppler. This repository records names, ownership, and wiring only.

## Environments

| Environment | Doppler config | Database | Host |
|---|---|---|---|
| local/Codespace | `dev` | Neon development branch when required | Vite 5173; Express 3000 |
| staging | `stg` | Neon staging branch | Railway staging service |
| production | `prd` | Neon production branch | Railway production service |

## Keys by name

`.env.example` is the authoritative key list. U12 requires no value for its default health, capability, test, Storybook, or artifact paths. A product enables integrations only after its Doppler project and least-privilege vendor credentials exist.

## Reproducible toolchain

- Node `24.13.0`: `.nvmrc`, `package.json`, Codespace, and CI.
- pnpm `11.13.0`: `packageManager`, Codespace bootstrap, and CI.
- Dependencies are exact-pinned in `package.json` and resolved by `pnpm-lock.yaml`.
- pnpm permits the pinned `esbuild` lifecycle script explicitly; no other dependency build is implicitly trusted.
- Playwright uses its lockfile-pinned Chromium with locale `en-US`, timezone `UTC`, device scale 1, and named desktop/tablet/mobile viewports.
- Inter `5.3.0` is bundled from `@fontsource/inter`; the app, Storybook, and offline artifact do not fetch a font.

## Deploy wiring

Railway receives a read-only Doppler service token scoped to `prd`. Its start command is `doppler run -- pnpm start`. `pnpm build` creates `dist/client` and `dist/server`; the production entry point is `dist/server/server/index.js`.

Production capability routes remain intentionally unavailable until the verified WorkOS adapter replaces the synthetic development context. Health remains database-independent for platform liveness.
