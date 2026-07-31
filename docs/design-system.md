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

### Spacing · Radii · Shadows
The spacing scale. The radius scale and what each level is for. Where shadows are permitted.

### Icons and line weight — **DECIDED, applies to every Norfolk project**

> *Ricardo, 2026-07-31: "I love design of Perplexity logo and very thin wireframes. I also like the iconography of Manus."*
>
> The common thread across all three references is **monoline geometry at low stroke weight** — forms built from strokes of a single consistent thickness, thinner than most defaults, with geometric rather than organic construction. This is the house style.

**Library: Lucide.** One library, no exceptions. It is shadcn's default (so every block arrives with it), it is monoline by construction, and — critically — its stroke width is a prop rather than baked into the artwork.

**Stroke width: `1.5`.** Lucide's default is `2`, which reads chunky and generic. `1.5` is the thin-wireframe register Ricardo is describing. Set once, globally:

```tsx
<LucideProvider strokeWidth={1.5}>
```

Never override per icon. An icon at a different weight in one corner of a screen is the exact drift this file exists to prevent.

| Context | Size | Stroke |
|---|---|---|
| Inline with body text | 16px | 1.5 |
| Buttons, nav, toolbars | 18–20px | 1.5 |
| Empty states, feature marks | 32–48px | **1.25** — thinner, because stroke weight reads heavier as size grows |
| Below 14px | — | **don't.** Sub-14px monoline at 1.5 turns to mud. Use a label. |

**Hairlines match.** Borders, dividers and table rules are `1px`. The point of a thin-wireframe aesthetic is that *everything* is thin — an icon at 1.5 next to a 2px border looks like an accident.

**When Lucide lacks an icon:** first check whether the concept can use an existing icon (it usually can — inventing a bespoke metaphor is worse than reusing a familiar one). If genuinely absent, draw it on Lucide's own 24×24 grid at 1.5 stroke with round caps and joins, and add it here. **Never mix in a second icon set** — Heroicons, Feather and Phosphor all look almost right and land subtly wrong beside Lucide.

**Ruled out:** filled/solid icon sets, duotone, two icon libraries in one app, emoji as interface icons, and raising stroke weight to "make icons more visible" (the fix for that is size or contrast, not weight).

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
