---
date: 2026-07-31
topic: themes-responsive-voice
status: captured — themes have a live artifact; voice is future
---

# Themes, small screens, and voice

Three requirements captured 2026-07-31, in decreasing order of urgency.

## R33 — User-selectable themes, preset by the codebase

> "every app will also allow the user to select a Theme (colors, fonts, icons etc) where themes are preset by the codebase and the starter kit. important for me to see ideas of themes. Claude Design 2 has wonderful templates to create design guides that include themes."

**Live artifact:** [`themes.html`](../artifacts/themes.html) — three themes applied to a real app shell (Obra Pía overview + Rebecca in the right column), with light/dark and iPad/iPhone layouts. Values are real, pulled from the shadcn registry via MCP, not invented.

The kit already has the mechanism: shadcn themes are sets of named CSS variables, and 42 exist in the registry ready to install. Nothing needs building to *have* themes — what needs deciding is which ones and who chooses.

### Three decisions this needs

- **[Product] Curate, don't expose the catalogue.** 42 themes is a registry, not a product. Each app should offer perhaps four, chosen to suit it. Obra Pía is not a Doom 64 application.
- **[Product] Brand vs theme — the real question.** If an investor picks Cyberpunk for the Obra Pía portal, is it still Obra Pía? Either brand colours override the theme, or theming is confined to a family that keeps the brand intact. *Recommendation: the second.* A white-label product themes freely; a branded investor portal does not.
- **[Technical] Whose choice is stored** — per-user, per-organisation, or admin-set? Different data models. Interacts with R21's admin-assignment pattern.

### Note on fonts

Themes specify real typefaces (Poppins, Libre Baskerville, Montserrat) and type carries more character than colour does. The artifact substitutes system fonts because it blocks outside requests — the colours are honest, the letterforms are not.

## R34 — iOS-friendly, works at most screen sizes

> "Every app should be iOS friendly and be able to be used in most screen sizes."

Not a feature — a constraint on every screen built from now on, in the same family as R26 (parity). Cheap to hold from the start, expensive to retrofit.

What it means concretely, beyond "responsive":

- **The copilot is a panel on desktop and a sheet on phone.** A 250px column on a 390px screen is unusable. R27's "collapsible right column" is a desktop description; the phone form is different and must be designed, not derived.
- **44px minimum tap targets** (Apple's floor). This is why a phone layout is not a narrow desktop layout — controls that sit comfortably at 28px on a mouse-driven screen must grow.
- **Safe areas.** Notch and home indicator consume real estate; anything pinned to a screen edge needs `env(safe-area-inset-*)` or it lands under the hardware.
- **Sub-decision needed:** does "iOS friendly" mean a good mobile web app, or an eventual native/PWA wrapper? Recommendation: mobile web first, PWA when a real need appears (offline, push, home-screen presence). Native is a different project, not a setting.

## R35 — Voice interfaces and voice-driven agent swarms *(future)*

> "in the future we should have deep integration with voice agents or agent swarms behind a voice interface that can take the place of writing and reading or partially so. I like Elevenlabs but that is no longer the only game in town and even companies like Grok and Amazon are getting in the game. I also like Retell."

Explicitly future. Captured now because it has one consequence that binds today.

### Why this reinforces R26 rather than adding work

A voice interface is *another caller* of the same procedures. If parity holds — one procedure per capability, called identically by screen and copilot — then voice is a third caller and costs comparatively little. If parity had been allowed to slip, voice would be a third divergent implementation of everything.

Ricardo's own phrase for R26, "create once and use many," is exactly the argument for why voice is affordable later. It is affordable **only** if the rule holds now.

### Named preferences

ElevenLabs (voice synthesis quality) and Retell (voice agent orchestration) are Ricardo's current favourites, with an explicit note that the field is moving fast and neither is the only option — xAI and Amazon are entering it. **Deliberately not evaluated now:** any comparison made today will be stale before this is built. Re-research at the point of decision.

### Deferred questions
- [Needs research] Voice agent platforms at time of build — synthesis quality, latency, per-minute cost, and whether the platform expects to own the agent loop or call into ours. The last one matters most: a platform that insists on owning the loop conflicts with parity.
- [Product] "Partially so" — which tasks are voice-suitable? Reading a report aloud is very different from authorising a distribution by voice.

## Scope boundaries

- R33 has an artifact and three answerable decisions; nothing is built.
- R34 binds immediately as a design constraint, like R26. The Manual app is the first thing built under both.
- R35 is future. Do not evaluate vendors now.
