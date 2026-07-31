@AGENTS.md

<!--
The project contract lives in AGENTS.md — the vendor-neutral, cross-editor
standard (Linux Foundation / Agentic AI Foundation) that Cursor, Codex,
Gemini CLI and others read natively. Claude Code reads CLAUDE.md, so this
file imports it (Anthropic's own documented pattern:
https://code.claude.com/docs/en/memory). Do not add rules here — add them
to AGENTS.md so every editor sees them. Claude-only notes below.
-->

## Claude Code specifics

- Plugins (superpowers, compound-engineering, greptile) are pinned in
  `.claude/settings.json` — they load automatically in every clone.
- Skills live in `.claude/skills/` — the open Agent Skills format, which
  Cursor also reads directly. Write once, both editors use them.
- MCP servers: `.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor)
  carry the same servers — the one tolerated duplication, since the two
  schemas are near-identical but not shareable. Change both together.
