# 0003 — Neon Postgres is the only database dialect

Date: 2026-07-29
Status: Accepted

## Decision

Every project uses Neon Postgres with Drizzle ORM, and pgvector where embeddings are needed. No project introduces a second SQL dialect.

## Why

The Obra Pía portal originally ran MySQL/TiDB, and keeping it would have been the cheaper move *for that one project* — restore a dump and carry on. The cost lands elsewhere: every governance gate, backup runbook, migration skill, and shared script forks into MySQL and Postgres variants, permanently, to serve a single app.

Paying a one-time conversion (schema `mysql-core` → `pg-core`, mechanical query rewrites, data reload) bought a single dialect across the whole portfolio. The conversion took hours and the app is small; the fork would have been forever.

Postgres also wins on merits at this scale: pgvector is mature and already proven in H-Analytics, Neon's branching gives instant per-environment databases, and the Drizzle/WorkOS/tutorial ecosystem is Postgres-first.

## What this rules out

- MySQL, TiDB, PlanetScale, SQLite-in-production, and any other dialect, for any project on this kit.
- A separate vector database. Vectors live in Postgres via pgvector — one store, one backup, one access-control model.
- Per-project ORM choices. Drizzle everywhere, so migrations and schema review look the same in every repo.

## Reversal conditions

An actual scaling wall that Postgres cannot clear — which a portal-sized workload will not reach. Distributed-SQL capabilities are not a reason to adopt distributed SQL.
