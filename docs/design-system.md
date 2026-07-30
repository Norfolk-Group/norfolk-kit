# Design System

**Tier: CONTRACT** · Last verified: *(set when first populated)*

This file is the UI/UX source of truth for this project. It documents the visual foundations, component standards, layout rules, UX principles, accessibility requirements, interaction patterns, and forbidden UI patterns that all agents and developers must follow. Its purpose is to prevent design drift, preserve intentional design decisions, and keep every UI change consistent with the established product experience.

> **New project:** this is a skeleton. Populate every section before the first UI work, and set `Last verified`. An empty design system is not a licence to improvise — it's a blocking task.

---

## Visual foundations

### Colour
Every colour as a literal token with its value. Never introduce a colour that isn't here.

| Token | Value | Used for |
|---|---|---|
| `--background` | | page surface |
| `--foreground` | | body text |
| `--primary` | | primary action |
| `--destructive` | | destructive action |
| `--muted` / `--muted-foreground` | | secondary surfaces and text |
| `--border` / `--input` / `--ring` | | edges and focus |

State which themes exist (light / dark / named variants) and which tokens differ per theme.

### Typography
Families, where each is loaded from, and the scale — sizes, weights, line-heights, letter-spacing. Note any font used for one specific purpose only.

### Spacing · Radii · Shadows · Icons
The spacing scale. The radius scale and what each level is for. Where shadows are permitted. Which icon library is canonical — **one library**, named, with a rule for what to do when the needed icon is missing.

## Component standards

For each: which variants and sizes exist, when to use which, and which states are defined (default / hover / focus / active / disabled / loading / error / empty).

Buttons · Forms · Inputs · Cards · Modals & dialogs · Tables · Alerts · Loaders & skeletons · Empty states · Navigation · Badges · Tooltips

## Layout rules

Grid. Breakpoints with pixel values. Responsive behaviour. Mobile patterns vs desktop patterns. Maximum content widths. How wide content (tables, diagrams, code) is handled.

## UX principles

- **Accessibility** — contrast minimums, focus visibility, keyboard navigation, semantics, motion-reduction support.
- **Interaction** — what's clickable and how it signals that; hover vs focus; destructive-action confirmation.
- **Error handling** — where errors appear, tone, and what the user can do next.
- **Loading** — skeleton vs spinner vs optimistic; what appears within 100ms.
- **Animation** — the permitted durations and easing curves, and what each is for. New motion uses an existing curve.
- **Feedback** — how success is confirmed; toast vs inline vs redirect.

## Forbidden patterns

The most important section. Be specific.

- UI anti-patterns that must not be introduced.
- Visual styles ruled out (and why).
- Components that must not change without approval.
- Legacy quirks that exist for a known reason — with the reason, so nobody "fixes" them.
- Intentional constraints (e.g. one icon library only; no colour outside the token set; no inline styles).

---

## Rules of engagement

Do not locally "improve" colours, typography, spacing, components, layouts, animations, or interaction behaviour unless explicitly requested or clearly consistent with this file. Introduce a new reusable pattern → add it here in the same PR. A change that conflicts with this file is a **design-system change requiring explicit approval**, not an implementation detail.

The generated artifacts in [`artifacts/`](artifacts/) are the visual companion to this file — every primitive in all its states, the motion catalog, and the icon set, rendered and openable in a browser. Review changes there, not only in code.
