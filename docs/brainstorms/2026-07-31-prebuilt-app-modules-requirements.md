---
date: 2026-07-31
topic: prebuilt-app-modules
status: captured — not yet designed
---

# Pre-built app modules

## Problem frame

Ricardo builds many apps. Several capabilities recur in nearly all of them, and today each one gets rebuilt from scratch. The kit currently ships *tooling* (agent config, CI, launchers) and *loose components*. It does not ship **features** — a working slice with a data model, an admin surface, and a user surface.

Captured verbatim from Ricardo, 2026-07-31:

> "you need to have a section about animation and every app will have behind admin wall an animation section where Super Admin can assign animations to modals and processes that require keeping the user informed and entertained. Same thing with photos and renders. Most apps will have to have some kind of document management system to the user and managed by the admin. In general I like to allow the user to upload a photo and then have an LLM create a super photo-realistic render of the photo and use it in its place. With that you can control background color, format and even make houses and people look better. So a photo album type of pre-built stuff will be needed."

## Requirements

- **R21 — Animation assignment module.** Behind an admin wall. A Super Admin assigns animations to specific modals and long-running processes, so waiting users stay informed and entertained. Implies: a registry of available animations, a mapping of process→animation, an admin UI to set it, and a runtime resolver the app calls.
- **R22 — Photo & render assignment module.** The same admin-assignable pattern applied to imagery.
- **R23 — Document management module.** User-facing document access, admin-managed. Needed by "most apps."
- **R24 — Photo enhancement.** A user uploads a photo; an LLM produces a photo-realistic render used in its place. Admin control over background colour, output format, and subject flattery ("make houses and people look better").
- **R25 — Photo album.** Pre-built album/gallery surface consuming R24 output.

## What this changes about work already done

Today (2026-07-31) `src/**` was moved out of the default equip payload — 46 animation component files were being installed into every repo, including a document renderer that needs none of them. **That decision stands and this requirement reinforces it**, but it reframes the reason:

Animations are not a pile of files to copy. They are a **feature** — registry, assignment data, admin UI, runtime resolver. Copying loose `.tsx` files into every repo was the wrong distribution shape regardless of volume. The right shape is an installable module a repo opts into, which brings its own schema and admin surface with it.

Useful prior art already in the kit: `src/lib/animation-registry.ts`, `src/lib/agent-taxonomy.ts`, and `src/hooks/useAnimationForCategory.ts` are the beginnings of exactly this resolver. They were built for H-Analytics and should be read before anything new is designed.

## Scope boundaries

- **Not in the current buildout plan.** That plan is the freeze line (its own stated risk control: "new ideas enter a *next* brainstorm, not this plan"). These are Phase 6+ or a separate plan.
- Nothing here is designed yet. This document is capture, not architecture.

## Dependencies / assumptions

- Modules need a database; the current kit ships none. R23–R25 all imply schema, which means the module concept must define how a module contributes migrations.
- R24 implies image generation spend per upload, and R2 storage (decision 0011: large files never enter git).
- R24 output is large binary — R2 by definition.

## Key decisions

- **R24a — Both the photograph and the render are kept; the render is always disclosed.** Ricardo's ruling, 2026-07-31: *"Both photos and renders will be kept in the library and the render should carry a symbol or brief explanation that it is an enhanced view of the property or the person or landscape or whatever."*

  This settles the disclosure question. It matters beyond good manners: for investor- and buyer-facing apps (Obra Pía, El Claustro, La Plage), an AI-beautified render of a *real* building that a viewer reasonably takes for a photograph is treated as material in several jurisdictions' real-estate marketing rules. Retaining the original and marking the render keeps the app on the right side of that without anyone having to think about it per-image.

  Implications for design: the enhancement is **non-destructive** — the original is never replaced, only superseded in display. The pairing (original ↔ render) is a first-class relationship in the data model, not a filename convention. The disclosure mark travels with the render everywhere it appears, including in exports and reports, which is the case most likely to be forgotten.

## Outstanding questions

### Resolve before planning
- **[Affects R21–R25][Product] What is a "module"?** A copied folder, an npm package, or a documented recipe the agent applies? This determines everything downstream and is the actual first design question.

### Deferred to planning
- [Affects R24][Needs research] Which image model. Quality, cost per image, and licence terms for commercial use of generated imagery all differ sharply between providers.
- [Affects R23][Technical] Whether document management reuses the Obra Pía presigned-upload work (decision 0002) or generalises it.
- [Affects R21][Technical] How a module contributes database migrations to a host app without owning the schema.

## Next steps

`/ce:brainstorm` this properly when the current buildout plan reaches a natural pause. Do not start it mid-phase — the plan's own scope-gravity control exists because twenty requirements arrived in a single day once already.
