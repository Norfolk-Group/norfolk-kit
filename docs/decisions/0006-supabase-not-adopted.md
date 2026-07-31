# 0006 — Supabase not adopted; the composed stack stands

Date: 2026-07-31
Status: Accepted

## Decision

Neon (database) + WorkOS (auth) + Cloudflare R2 (files) remain the stack. Supabase — the bundled alternative — is not adopted, for any pillar.

## Why

Researched head-to-head against official July-2026 pricing/docs (origin R10):

- **Database:** Neon's copy-on-write branching is near-instant and near-free; Supabase branches are full instances at ~$10/mo each. Neon also cut storage pricing 80% post-acquisition.
- **Auth:** WorkOS is purpose-built for invite-only portals with an enterprise-SSO future and an admin UI a non-programmer can operate; Supabase Auth is consumer-grade with DIY enterprise features.
- **Files:** R2 egress is $0 forever; Supabase charges $0.09/GB past a shared pool — structurally wrong for a document-download portal.
- **Architecture:** Supabase's core model (RLS + client-direct queries) is opposed to the tRPC-procedures architecture, which centralizes authorization in application code by design. Adopting it means paying for a flagship feature and then bypassing it.
- **Timing:** the Neon and R2 migrations completed the same week this was decided — re-migrating would burn working production infrastructure to downgrade two pillars and gain one dashboard.

## What this rules out

- Adopting Supabase for database, auth, storage, or edge functions.
- "Consolidation" arguments that trade capability for dashboard count.

## Revisit trigger

Realtime collaboration (live presence/cursors) becoming a hard product requirement — the one pillar the composed stack has no answer for. Even then: evaluate a standalone realtime service before a platform migration.
