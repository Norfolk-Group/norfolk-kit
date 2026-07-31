# 0008 — Docker is invisible by design

Date: 2026-07-31
Status: Accepted

## Decision

No project writes Dockerfiles, installs Docker Desktop, or manages containers by hand. Containerization happens where the platforms already do it: Codespaces (every workspace runs in a devcontainer) and Railway (every deploy auto-containerized by Railpack, Nixpacks' successor). Writing a Dockerfile is an exception that requires its own decision record.

## Why

All claims verified against official docs 2026-07-31 (origin R10):

- GitHub Codespaces runs every session inside a Docker container defined by `devcontainer.json` — the team already uses containers daily, writing zero Docker config.
- Railway's current default builder (Railpack) builds standard Node apps into OCI containers with zero configuration; a Dockerfile is honored if present but never required.
- The standard OCI image is genuine anti-lock-in insurance for the *application artifact*: moving to Render/Fly/DO/a VPS is a modest task, not a rewrite. (It is not a one-click account migration — platform glue re-wires by hand.)
- With every stateful service managed (Neon, R2, Doppler, Resend), there is no day-to-day reason for the owner or the kit to touch Docker directly.

## Known legitimate exceptions (each still needs a record when triggered)

- Self-hosting a Docker-only tool (e.g. Documenso for e-signatures).
- Custom system dependencies — headless Chrome / PDF rendering pipelines.
- Polyglot single-service builds (Node + Python in one container).

## What this rules out

- Dockerfiles or docker-compose in the kit or in equipped repos without a decision record.
- Docker Desktop as assumed local tooling.
- Kubernetes or self-managed container orchestration at this portfolio's scale.

## Reversal conditions

Not a vendor bet — a posture. Revisit only if the portfolio starts self-hosting multiple Docker-only tools, at which point a managed container platform decision record supersedes this.
