# 0009 — AGENTS.md is canonical; Claude Code and Cursor share one rules source

Date: 2026-07-31
Status: Accepted

## Decision

The project contract lives in `AGENTS.md` at repo root. `CLAUDE.md` is a one-line `@AGENTS.md` import plus a short Claude-specific appendix. Plugins are pinned in a checked-in `.claude/settings.json`. Skills live in `.claude/skills/` (open Agent Skills format). MCP config is duplicated once — `.mcp.json` (Claude) and `.cursor/mcp.json` (Cursor) — changed together. Devcontainers install Claude Code via Anthropic's official feature (`ghcr.io/anthropics/devcontainer-features/claude-code`).

Applied to this repo the day it was decided (commit 2208e77).

## Why

Everything verified against official sources 2026-07-31 (origin R14; per the R13 verify-don't-assume policy):

- AGENTS.md is the vendor-neutral cross-editor standard — donated to the Linux Foundation's Agentic AI Foundation (Dec 2025, co-founded by Anthropic) — read natively by Cursor, Codex, Gemini CLI, Copilot, and others.
- Claude Code reads CLAUDE.md, not AGENTS.md; Anthropic's own docs prescribe the `@AGENTS.md` import as the bridge. One rules source, zero drift, both editors.
- `enabledPlugins` at project scope is officially supported — every clone/Codespace gets superpowers + compound-engineering + greptile automatically, ending hand-edited settings.
- Cursor reads `.claude/skills/` directly (skills became the open Agent Skills standard) — skills written once serve both editors.
- No sharing mechanism exists for MCP config between the tools; near-identical schemas make one duplicated file the honest, cheap answer.
- Cursor dropped `.cursorrules` from its documentation entirely; the legacy formats in the retired starter were correctly abandoned.

Validation verdict on the kit at decision time: ~90% aligned with official guidance, zero contradictions.

## What this rules out

- Rules content living in CLAUDE.md directly (it goes in AGENTS.md).
- `.cursorrules` or `.cursor/rules/*.mdc` for kit purposes.
- Hand-rolled Claude Code installs in devcontainers.
- Divergent per-editor rule sets — the drift this architecture exists to prevent.

## Reversal conditions

Fragmentation of the AGENTS.md standard, or Claude Code shipping native AGENTS.md reading (which would simplify, not reverse, this design).
