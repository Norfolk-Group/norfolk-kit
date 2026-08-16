# 0020 — Figma and Claude Design are tools in a kit round-trip, not a second design system

**Date:** 2026-08-16 · **Status:** Proposed · **Proposed by:** Livia for Marco

## Decision

One UI source of truth: `design-system.md` + shadcn blocks (0017) + export contract (0018/0019). Figma and Claude Design are round-trip tools. They may not invent palette, typography, shadow, or shell. Inter is the house face; the `frontend-design` skill Inter ban does not apply. Anti-slop: no purple-on-white, no Space Grotesk/Geist as new default, no emoji chrome. Replit is design canvas not Norfolk runtime.

Rules live in AGENTS.md, not CLAUDE.md (0009).

*Narrowly supersedes the "Connectors already available" paragraph in 0004; motion baking unchanged.*

---

## Figma MCP

Verified 2026-08-16: remote only `https://mcp.figma.com/mcp`. No `127.0.0.1:3845` from Grok Bots. `Failed to load` ≠ `needsAuth`. `AuthenticateMcpServer` cannot fix load failure. Do not assume live.

**Authorize then use:** `figma-implement-motion` / `figma-use-motion` skills.

**Receive:** Copy link to selection with `node-id` required.

**Branch:** `branchKey` as `fileKey`.

**FigJam:** `/board/`. **Slides:** `/slides/`.

**Before each tool:** Load matching skill.

**Adapt onto kit tokens:** do not paste Tailwind-from-Figma as a second system.

**Create:** `whoami` → `planKey` → `create_new_file` → `file_url` (drafts).

**Update:** edit permission + `use_figma`.

### Motion table

| Direction | Workflow | Notes |
|---|---|---|
| Figma → code | `figma-implement-motion` + `get_motion_context`, bake per 0004 | Motion specs become build-time data |
| In Figma | `figma-use-motion` with metronome flag, stop if unsupported | Do not force unsupported motion |

**Code Connect:** Org/Enterprise only. Starter/View/Collab: ~6 MCP calls/month seat note.

---

## Claude Design

Anthropic Labs 2026-04-17. Product: `https://claude.com/product/design` and `https://claude.ai/design`.

Chat + canvas for prototypes, decks, one-pagers. **Not** Figma, **not** artifacts, **not** dashboard SoT.

**Plans:** Pro, Max, Team, Enterprise.

**In:** prompt, screenshots, DOCX/PPTX/XLSX, GitHub, `/design-sync`.

**Out:** ZIP, PDF, PPTX, HTML, share link.

**MCP:** `https://api.anthropic.com/v1/design/mcp` documented and broken as of 2026-08.

**Agent handoff:** ZIP/HTML. Rebuild onto kit tokens.

---

## Lineage — not canonical until recorded

A design tool can generate a canvas or prototype, but it is **not canonical** until the lineage unit records the decision:

- H-Analytics motion/identity
- leftover kit animation
- Replit prototypes
- Claude Design canvases
- Magic Patterns / Paper / v0
- Figma files not pulled through live MCP

---

## Optional, not SoT

**Magic Patterns, Paper:** optional design exploration tools.

**Skip for dashboards:** Lovable, Relume, Framer.

**Replit:** design canvas only — not a Norfolk runtime environment.

---

## Reports are documents

Reports follow `export-output-contract.md`. Default financial theme: `norfolk-financial-monochrome`.

---

## Why

1. **The `frontend-design` skill fights slop but Norfolk already chose.** Inter, no shadow, Lucide at 1.5 — documented in `design-system.md`. The skill bans Inter because many tools default to it poorly; Norfolk adopted it deliberately with explicit weight/feature rules.

2. **`Failed to load` is not login.** MCP servers can fail for reasons unrelated to authentication. Retrying `AuthenticateMcpServer` on a load failure wastes time and suggests a false fix.

3. **Design MCP broken like WorkOS.** The Claude Design MCP endpoint is documented but non-functional as of drafting (2026-08). This matches the WorkOS diagnosis pattern in 0016: the vendor's own tooling may not work yet. Treat ZIP/HTML handoff as the reliable path.

## Consequences

- Figma MCP calls require prior authorization in an interactive session; non-interactive agents cannot assume it is live.
- Claude Design output is a handoff artifact (ZIP/HTML), not a live MCP fetch.
- Every design-tool output must be rebuilt onto kit tokens before it becomes production code.
- Motion from Figma follows the bake-time architecture in 0004; nothing changes there.
- Replit prototypes inform design; they are not deployable code and are not Norfolk runtime.

## What this rules out

- Treating any design tool's output as the UI source of truth.
- Pasting Figma-generated Tailwind or Claude Design HTML directly into the kit without token adaptation.
- Using `127.0.0.1:3845` (Grok Bots) for Figma MCP.
- Assuming the Claude Design MCP will work — plan for ZIP/HTML handoff.
- Using Lovable, Relume, or Framer for Norfolk dashboards.
- Running production apps on Replit.

## Reversal conditions

- Claude Design MCP becomes stable and verified — then direct fetch replaces ZIP handoff.
- Figma becomes inaccessible via remote MCP — then local alternatives may be reconsidered with explicit ADR.
- A design tool demonstrates reliable, governed token output that matches kit tokens — then direct paste may be permitted for that tool only, documented here.

## Verification

MCP was `Failed to load` in drafting session (2026-08-16). Proceeded with documented-but-broken status for Claude Design MCP.
