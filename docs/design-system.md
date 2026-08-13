# Design System

**Tier: CONTRACT** · Last verified: 2026-08-13

This file is the UI/UX source of truth for this project. It documents the visual foundations, component standards, layout rules, UX principles, accessibility requirements, interaction patterns, and forbidden UI patterns that all agents and developers must follow. Its purpose is to prevent design drift, preserve intentional design decisions, and keep every UI change consistent with the established product experience.

The U12 executable reference uses the small neutral foundation below. It proves the component, Storybook, browser-review, and offline-artifact pipeline; it is not a client brand or the completed Product OS design canon. Products inherit approved Norfolk foundations and then declare their product, brand, theme, density, and output contracts before extending this reference.

## Output surfaces

An investor PDF, published report HTML, workbook, CSV, image, or deck is not a
responsive screen captured in another file format. These outputs have different
reading distances, geometry, interaction models, durability, and verification
needs. [`export-output-contract.md`](export-output-contract.md) is the binding
format-specific contract: declare a report profile before building it, use
document-only tokens and renderers where required, and verify data parity and
visual integrity independently for every distributed format.

The interactive design system governs exploration. The output contract governs
circulation. Neither silently wins over the other.

The default financial-output theme is deliberately monochrome for statements,
with restrained accent colors reserved for charts. It bundles Inter, IBM Plex
Sans Condensed, and IBM Plex Mono; defines minimum readable point sizes; and
requires generous chart padding. These report fonts and colors are a separate
theme surface—not permission to change the application's selected theme.

---

## Visual foundations

### Colour
Every colour as a literal token with its value. Never introduce a colour that isn't here.

| Token | Value | Used for |
|---|---|---|
| `--background` | `#f6f4ed` | warm neutral page surface |
| `--foreground` | `#172227` | body text |
| `--surface` | `rgba(255, 255, 255, 0.55)` | quiet raised surface |
| `--primary` | `#28756b` | primary action and ready state |
| `--primary-quiet` | `#376a64` | small labels on light surfaces |
| `--destructive` | `#a33e35` | destructive or error state |
| `--pending` | `#8c816b` | indeterminate/pending state |
| `--muted` | `#ecebe5` | secondary surface |
| `--muted-foreground` | `#526064` | secondary text |
| `--quiet-foreground` | `#687276` | tertiary metadata |
| `--border` / `--input` | `#d6d5cd` | edges and inputs |
| `--border-strong` | `#abb0ab` | interactive edge |
| `--divider` | `#deddd6` | internal rule |
| `--ring` | `#84b8b1` | visible focus |

The reference foundation defines light only. A product may not infer a dark or branded palette by transforming these values; it declares an approved theme contract first.

### Typography
Inter is pinned through `@fontsource/inter@5.3.0` and bundled locally at weights 400, 500, and 600. No runtime font request is permitted. Body copy uses 400; controls and headings use 500 or 600. Display headings use responsive `2.5rem–5rem`, line-height `0.98`, and negative tracking; body copy uses `1rem–1.05rem` with line-height `1.6`. Numeric columns use tabular numerals.

### Spacing · Radii · Shadows
Use a 4px spacing base and compose at 8, 12, 16, 20, 24, 32, 48, and 64px. Controls have a minimum 44px target. Reference surfaces use 12px radius; pill controls use a full radius. Borders are 1px. The reference has no shadow: hierarchy comes from space, tone, and hairlines.

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

#### Icons carry meaning, not decoration

> *Ricardo, 2026-07-31, on Manus's sidebar: "good matching of icons."*

The reference is a list where **every item's icon says what that item is** — a chart for an analytics task, a waveform for an audio note, a video frame for a YouTube search, a building for a hotel design brief, a plain folder for a folder. Dozens of different glyphs in one column, and it reads as calm rather than noisy.

The discipline that makes that work is worth stating exactly, because getting it half-right produces the opposite:

> **Style is locked. Meaning varies.** Same library, same stroke, same size, same colour for every item in a list. The *only* thing that changes between rows is which glyph — and it changes because the content is genuinely different, never for variety.

Break that and it falls apart immediately: mixed weights read as a rendering bug, mixed sizes read as broken alignment, and coloured icons turn a list into a chart nobody can parse.

**So every list of mixed content maps content type → icon, declared in one place.** Not chosen per row by whoever wrote the row:

```ts
// one map, imported everywhere — same reasoning as agent-taxonomy.ts (0012)
export const CONTENT_ICONS = {
  spreadsheet: BarChart3,
  document:    FileText,
  presentation:Presentation,
  video:       Video,
  audio:       AudioLines,
  image:       Image,
  folder:      Folder,
  contract:    FileSignature,
  // …
} as const
```

**A generic fallback is mandatory** and must be deliberately dull — an unrecognised type gets the plain document glyph, never a guess. An icon that confidently means the wrong thing is worse than one that means nothing.

**Where this applies immediately:** the document management module (R23), the photo album (R25), and any file list. It is also why the copilot can label what it is doing with an icon that is *right* rather than ornamental.

**Ruled out:** per-row icon choices made ad hoc, colour used to distinguish content types in a list, and a "misc" icon that is visually interesting enough to look intentional.

#### …but not on everything — when to leave icons off

Manus icons every row. **Perplexity's sidebar icons the fixed navigation and leaves the session list as plain text.** Ricardo likes both. They are not in conflict; they answer different questions.

> **Icon a list when the reader is scanning for a *type*. Leave it plain when they are reading for a *name*.**

- **Fixed navigation** — New, Computer, Artifacts, Customize. A short, unchanging set learned by position and shape. Icons make it faster every day after the first.
- **A user's own content** — sessions, conversations, documents they titled. Unbounded, and the *title* is the information. An icon on every row adds a column of near-identical glyphs that must be visually skipped to reach the words.

Manus's list is genuinely mixed-type (a video, an audio note, a spreadsheet), so the icon carries real information. Perplexity's sessions are all the same type, so an icon would carry none.

**Test before adding one:** *does this glyph tell the reader something the text does not?* If every row would get the same icon, delete the column.

---

### The composer — from Perplexity's desktop app

The strongest available reference for Rebecca's panel, and Ricardo's own daily tool. What it gets right, worth copying deliberately:

- **The input is the hero.** Centred, generously sized, one soft focus glow. Everything else on the page is quiet so the eye starts in the one place that accepts action.
- **Controls live *inside* the composer, not around it.** Attach, mode (Search / Computer), model selector, voice — all within the input's border, as small pills. The screen has no toolbar, because the toolbar is the input.
- **The model is a visible, inline choice** (shown: `GPT-5.6 Sol`). Directly supports per-app, per-task model selection ([0014](decisions/0014-agentic-native-and-model-portability.md)) — the user sees which model is answering and can change it without leaving the sentence they are writing.
- **Voice is a first-class button**, not buried in a menu ([R35](brainstorms/2026-07-31-themes-responsive-voice-requirements.md)).
- **An empty state that asks a question** — *"What should we work on?"* — rather than explaining the product. Then three concrete, domain-specific suggestions as **text links with a small arrow**, not cards. Cards would compete with the composer; links defer to it.
- **Warm off-white, not white.** A cream/parchment ground with a single teal accent for links. One accent, used sparingly, is why a dense sidebar still reads calm.
- **Identity sits at the bottom of the sidebar** — avatar, name, plan tier, organisation. Present, never prominent.

**The transferable principle:** a conversational surface has exactly one hero, and it is the input. Everything else earns its place by not competing with it.

#### Do not fill the space

The browser view at full width settles it: in a ~2000px viewport, the composer and its suggestions occupy a **~510px centred column**, and the rest of the screen is empty. Deliberately.

The reflex — human and agent alike — is to stretch content to the available width, because empty space reads as unfinished. It isn't. A composer stretched to 1800px is a worse composer: the eye has further to travel, the text loses its measure, and the page stops having a focus.

**Rules:**
- Conversational and reading surfaces get a **max width**, centred. Roughly 480–560px for a composer, 65ch for prose. Extra viewport becomes margin.
- **Dense surfaces are the exception** — tables, dashboards, data grids genuinely use the width. Know which kind of surface you are building before choosing.
- Never expand a control just because there is room.

#### Two more details from the same screen

**Sub-navigation drops the icons.** Top-level items (New, Computer, Spaces, Artifacts, Customize) have icons; the items nested beneath — Connectors, Skills, Workflows, Memory — are plain text, as is the whole History list. **Icons mark the top level of a hierarchy, not every level.** Iconing sub-items flattens the hierarchy you were trying to express.

**The model selector reads "Orchestrator."** Perplexity ships a mode whose name is a *role*, not a model — the user chooses what kind of help they want, and the system picks the model. That is precisely the tier vocabulary in [0012](decisions/0012-naming-agents-orchestrators-specialists-minions.md), independently arrived at by a product Ricardo uses daily. Worth noting as validation: **the user-facing choice should be a role, with the model underneath it** — which also makes per-app model swapping ([0014](decisions/0014-agentic-native-and-model-portability.md)) invisible to the user, as it should be.

## Component standards

The first executable specimen is `StatusCard` at `src/client/components/StatusCard.tsx`. It defines loading, ready, and error states with an `aria-live` region; Storybook renders all three. Loading uses a dashed geometric mark, not a fabricated percentage, and respects reduced motion. Error copy names the next action.

Reference review buttons define default, hover, keyboard-focus, and 44px target behavior and offer explicit approve, reject, and defer outcomes. A product must add disabled, loading, and error behavior before using a button for asynchronous work.

Forms, inputs, dialogs, tables, alerts, skeletons, empty states, navigation, badges, and tooltips are not silently invented from this specimen. They enter Kit only after their Product OS component contracts and complete applicable state matrices are accepted.

## Layout rules

The reference is a focus surface capped at `48rem` with a reading measure below `36rem`. At widths below `40rem`, review actions become a vertical full-width stack. Mobile keeps 16px side clearance and 44px targets. Dense tables and dashboards are scan surfaces and use the fixed-grid rules below rather than stretching focus content.

## UX principles

- **Accessibility** — use semantic landmarks and controls, visible `:focus-visible`, 44px touch targets, WCAG 2.2 AA contrast, keyboard operation, and reduced-motion behavior.
- **Interaction** — controls use a pointer plus visible hover and focus. Consequential actions name their effect and use the shared human-only approval policy.
- **Error handling** — state what failed and what the person can do next; never use “Something went wrong” alone.
- **Loading** — below 100ms show no ceremony; otherwise preserve layout and show honest indeterminate progress unless measured stages support a determinate value.
- **Animation** — the U12 reference permits only the 1.5s linear rotation of its dashed loading mark and removes it under reduced motion. Rich motion follows decision 0004 and the later lineage reconciliation.
- **Feedback** — keep the result beside the action when the outcome matters to the current surface. The review specimen shows the recorded approve/reject/defer state inline.

## Forbidden patterns

- No unrecorded color, font, spacing, radius, shadow, easing, or component variant.
- No external font, script, stylesheet, image, or CDN request in generated review artifacts.
- No invented determinate progress or elapsed-time claim.
- No client-specific palette, identity, terminology, or data in Kit.
- No second icon library, emoji interface icon, per-icon stroke override, or decorative icon that carries no information.
- No inline style as a local escape from tokens.
- No hidden visual-baseline replacement: changes require a visible approve, reject, or defer outcome.
- Do not treat preserved legacy animation sources as canonical until the Figma/Replit/H-Analytics/Kit lineage unit records the decision.

---

### Dense lists — from Linear

Linear is the counterpart to the composer above. Same design family — thin monoline icons, one accent, near-zero chrome — at **the opposite density**, and both are correct because the jobs differ. Perplexity's screen has one thing to do. Linear's has forty rows to scan.

**This is the surface most Norfolk apps are actually made of** — investors, distributions, documents, properties. Worth copying carefully.

#### The row is a fixed grid

Every row has the same anatomy, in the same order, aligned down the whole list:

```
[priority] [ID] [status] [title ······················] [labels] [assignee] [date]
```

Left-anchored identity, flexible title, right-anchored metadata. **The eye learns the shape once and then reads only the column it cares about.** A list where rows have different arrangements is a list that must be read rather than scanned.

Give IDs `font-variant-numeric: tabular-nums` so they form a true column.

#### Encode state in form, not only in words

- **Status is a shape** — a filled check circle for Done, a dashed ring for Backlog. Recognisable before it is read.
- **Priority is a tiny bar glyph** (ascending bars), with `---` for none. Sortable at a glance without a word of text.

A status column of the words *Done / Backlog / In progress* is slower to scan than the same information as shape, and takes four times the width.

#### Labels: colour the dot, not the pill

`audit-finding` carries a small orange dot; `tech-debt` a grey one. **The pill itself stays neutral.** Fully coloured pills turn a list into confetti and make the one genuinely urgent thing invisible. A 6px dot is enough — colour is for *finding*, text is for *knowing*.

#### Group headers instead of boxes

Sections (`Backlog 2`, `Done 27`) are a tinted header row with a count and an inline `+` that adds into that group. **No cards, no borders around groups.** Density comes from removing chrome, not from shrinking type — the type here is a comfortable size; it is the boxes that are missing.

#### Counts belong beside the thing they count

`Inbox 2`, `Reviews 3`, right-aligned and muted in the nav. Present, never shouting. No badges, no red circles for what is merely unread.

#### The density rule, stated

> **Choose the density before choosing the layout.** A *focus* surface (composer, form, single record) gets a max width, generous space, one hero. A *scan* surface (list, table, dashboard) gets the full width, a fixed row grid, and state encoded as form. Applying either one's rules to the other produces a screen that fights its own job.

---

## Voice — how the product talks

> *Ricardo, 2026-07-31: "I love the languaging of Richard Thaler and David Brooks."*

Words are design material. Every label, error, empty state, confirmation and copilot reply is written by someone, and if nobody decides how the product sounds, each one sounds like whoever wrote it that day.

**The reference is unusually precise.** Thaler (*Nudge*, *Misbehaving*) and Brooks share a specific register: serious ideas in plain language, explained through concrete cases rather than abstraction, warm without being chummy, and — the important part — **they assume the reader is intelligent but not a specialist.** Neither writes down. Neither hides behind jargon. Thaler brings dry wit and admits uncertainty; Brooks builds from a small observed detail to the general point.

Translated into product copy:

| Do | Don't |
|---|---|
| "Three investors haven't signed yet." | "3 pending signature workflow items." |
| "We couldn't reach the bank. Try again in a minute." | "Error 502: upstream timeout." |
| "This will email all 27 investors. Sure?" | "Confirm bulk notification dispatch?" |
| "Nothing here yet — distributions appear once the first one is recorded." | "No data available." |
| "That password needs 10 characters or more." | "Invalid input. Password does not meet complexity requirements." |

The rules underneath those examples:

1. **Name things the way a person would.** A user manages *notifications*, not *webhook configuration*. Never let an internal noun reach the interface.
2. **Concrete beats abstract.** Numbers, names, dates. "Three investors" not "multiple recipients."
3. **Say what happened and what to do next.** An error with no next step is just bad news.
4. **No apologising, no exclamation marks, no cheerleading.** "Saved." not "Great job! Your changes have been saved successfully!"
5. **Admit uncertainty plainly** when the system is unsure. Thaler's habit, and it builds more trust than false confidence — especially for a copilot.
6. **A control says exactly what will happen.** Button reads *Publish*; the confirmation reads *Published*.
7. **Short sentences. Ordinary words.** If a shorter word works, it is the right word.

**This is also Rebecca's voice** (agent naming, [0012](decisions/0012-naming-agents-orchestrators-specialists-minions.md)). A copilot that talks like a support macro undoes the whole point of having one.

**Ruled out:** exclamation marks in interface copy, emoji in system messages, "Oops!", "Something went wrong" with no detail, machine nouns in user-facing text, and copy that congratulates the user for routine actions.

---

## Design references

Products Ricardo has named as things he likes. **A reference is only useful once someone has actually looked at it** — an impression of a product produces a plausible-sounding rule that is subtly wrong, which is the same failure mode this file exists to prevent. So each entry records whether it has been examined, and what was extracted.

A screenshot converts taste into a decision in about a minute. The Manus entry below is the worked example: one screenshot, one durable rule.

| Reference | Named | Examined? | Extracted |
|---|---|---|---|
| **Manus** — sidebar iconography | 2026-07-31 | ✅ screenshot | Content-type icon mapping; style locked, meaning varies. See *Icons carry meaning* above. |
| **Perplexity** — logo, "very thin wireframes" | 2026-07-31 | ⚠️ from description only | Monoline geometry at low stroke weight → Lucide at 1.5. Directionally safe (it agrees with the Manus and desktop-app evidence) but not verified against the actual mark. |
| **Perplexity desktop app** — whole UI | 2026-07-31 | ✅ screenshot | *The composer* section above. Confirmed the thin-monoline reading, and produced the refinement to the icon rule (fixed nav gets icons; the user's own content does not). **Currently the best reference we have for Rebecca's panel** — and the one Ricardo uses daily, which matters more than a site he admires once. |
| **Cloudflare** — dashboard AI assistant | 2026-07-31 | ❌ behind a login | Nothing yet. Wanted: how it animates work-in-progress, how it occupies the panel, how it shows what it is *doing* rather than only what it has said. This is the copilot's primary reference and it is currently a blank. |
| **Codex IDE** — UI and workflow | 2026-07-31 | ❌ not examined | Nothing yet. Ricardo has praised it twice — once for cross-device continuity (*"how great it is to even use the phone in a macbook"*), once for UI and workflow generally. **Workflow is the interesting half**: what a coding agent's interface gets right is directly relevant to the copilot, which is the same problem — showing an agent's in-progress work legibly. |
| **Linear** — the app | 2026-07-31 | ✅ screenshot (Ricardo's own workspace) | *Dense lists* section above. The counterpart to Perplexity: same design family, opposite density. **Most Norfolk screens are this kind**, so it is the more directly useful of the two. |
| **ElevenLabs** — website | 2026-07-31 | ❌ browser hung on load | Public, checkable, retry. |
| **Qurrent AI** — website *and content* | 2026-07-31 | ❌ not examined | Public. Note Ricardo named the **content**, not only the design — so this belongs partly under *Voice* above. |
| **Richard Thaler / David Brooks** — prose | 2026-07-31 | ✅ known bodies of work | The voice section above. The most actionable reference of the day, because it governs every string rather than one surface. |

**Eight references named on 31 July; two extracted.** That ratio is the point of this table. Visual taste arrives faster than it can be examined, and the gap between the two is where invented rules come from.

**Fastest way to close a row:** a screenshot. The Manus row went from named to a durable rule in about a minute because Ricardo sent one image. Description alone produced only the Perplexity row, which is still marked unverified.

**Rule: do not write design rules from an unexamined reference.** Leave the row blank. A blank row is honest and cheap; an invented rule is expensive and looks identical to a real one until someone builds on it.

---

## Rules of engagement

Do not locally "improve" colours, typography, spacing, components, layouts, animations, or interaction behaviour unless explicitly requested or clearly consistent with this file. Introduce a new reusable pattern → add it here in the same PR. A change that conflicts with this file is a **design-system change requiring explicit approval**, not an implementation detail.

The generated artifacts in [`artifacts/`](artifacts/) are the visual companion to this file — every primitive in all its states, the motion catalog, and the icon set, rendered and openable in a browser. Review changes there, not only in code.
