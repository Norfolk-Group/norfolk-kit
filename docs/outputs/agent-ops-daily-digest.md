# Agent Ops Daily Digest

**Tier: CONTRACT** · **Status:** Proposed · **Date:** 2026-08-16

Output surface declaration per ADR 0018. Not a dashboard screenshot. Not `norfolk-financial-monochrome` (ops, not a financial statement). Not Ciro's navy/gold books mail.

---

## Declaration

| Field | Value |
|---|---|
| **Family** | `agent-ops-daily-digest` |
| **Reader** | Ricardo Cidale |
| **Channel** | Resend HTML email to `ricardo.cidale@norfolkgroup.io` |
| **Schedule** | Weekdays 08:00 America/Chicago |
| **Profile** | Published HTML, email-constrained (tables, inline styles, 600px) |
| **Token set** | U12 light only |
| **Density** | Scan |
| **Freshness** | Stale after next weekday 08:00 CT |
| **Required sections** | Each agent lane, status, wins, issues |
| **Canonical** | The HTML Paolo sends. No PDF/DOCX sibling. |

---

## Token set

U12 light only — no inferred dark theme.

| Token | Value |
|---|---|
| `--background` | `#f6f4ed` |
| `--foreground` | `#172227` |
| `--primary` | `#28756b` |
| `--primary-quiet` | `#376a64` |
| `--destructive` | `#a33e35` |
| `--pending` | `#8c816b` |
| `--muted` | `#ecebe5` |
| `--muted-foreground` | `#526064` |
| `--quiet-foreground` | `#687276` |
| `--border` / `--input` | `#d6d5cd` |
| `--border-strong` | `#abb0ab` |
| `--divider` | `#deddd6` |
| `--ring` | `#84b8b1` |

---

## Typography

**Email exception:** no CDN, no Fontsource.

Font stack: `Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif`

---

## Status encoding

Status is a shape, not a pill. 8px dot inline with label.

| Status | Dot color | Hex |
|---|---|---|
| Ready | `--primary` | `#28756b` |
| Pending | `--pending` | `#8c816b` |
| Blocked | `--destructive` | `#a33e35` |
| Idle | `--quiet-foreground` | `#687276` |

No Lucide. No emoji.

---

## Voice

Thaler/Brooks register per `design-system.md`.

- Empty list → "None"
- No exclamation marks
- No "Oops"
- No cheerleading

---

## Owners

| Role | Responsibility |
|---|---|
| **Paolo** | Sends the digest |
| **Livia** | Owns template quality |
| **Marco** | Places this CONTRACT |

---

## Template

Reference implementation: [`agent-ops-daily-digest.html`](agent-ops-daily-digest.html)

Placeholders:
- `{{report_date}}` — human-readable date
- `{{as_of}}` — timestamp
- `{{agent_name}}` — agent identifier
- `{{lane}}` — agent lane
- `{{status_dot}}` — hex color for 8px dot
- `{{status_label}}` — Ready/Pending/Blocked/Idle
- `{{wins_html}}` — wins content or "None"
- `{{issues_html}}` — issues content or "None"

---

## Forbidden

- CDN
- Cards
- Second icon set
- Emoji
- Purple-on-white
- Geist / Space Grotesk
- Dashboard chrome
- Inferred dark theme
- Screenshot-as-digest
- Waiting on Figma MCP
