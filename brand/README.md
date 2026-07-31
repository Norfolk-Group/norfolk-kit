# Brand — the canonical marks

**Tier: CONTRACT** · Last verified: 2026-07-31

One folder per brand, organized by **ownership**, imported as a curation from Ricardo's Dropbox sources (2026-07-31). These are the only logo files any project should use — if a mark isn't here, it isn't canonical yet.

## Ownership and the boundary rule

- `norfolk/` — Ricardo's own companies: **Norfolk AI** (tech), **Norfolk Consulting Group** (business arm), **Cidale** (personal marks).
- `clients/kit-capital/` — **KIT Capital is a client**; its properties (Obra Pía, El Claustro, La Plage, Rituel du Sol) and engagement partner marks (Colliers) live under it.

**The boundary is law (decision recorded in the 2026-07-31 brainstorm):** the equip verb delivers Norfolk marks only to Norfolk-org repos, and a client's marks only to that client's repos — enforced by `markers.json` + the kit-guard CI check, not by folder position alone. Norfolk assets never enter client repos; no client ever sees another client's marks.

## markers.json

Every path pattern maps to a sensitivity: `norfolk-only`, `client:kit-capital`, or `client-safe`. The equip skill filters payloads by marker; the CI check refuses PRs that violate the mapping. Add a brand → add its marker in the same commit.

## Usage quick-notes

| Brand | Use | Note |
|---|---|---|
| Norfolk AI | `logo azul` on light, `logo branco` on dark, `gradiente` for hero moments | SVG preferred; PNG pairs included; one animated mp4 |
| Norfolk Consulting | Vortex set (1x/2x/4x/SVG + LinkedIn/Google exports) · Knight chess-horse (+gold) for avatar/seal uses | .ai/.eps sources included |
| KIT Capital | Spherical (transparent) preferred on any rich background | |
| KIT Capital Partners | `kit-capital-partners-azul.png` on light, `-branco.png` on dark (2560px, from the `.ai` sources in `_source/`) | |
| Obra Pía | `Logo Obra Pia 1` (the portal arch), @2x for retina; Foundation logo separate | |
| El Claustro | Official 2025 set (Clarena): RGB A–D for screen, CMYK PDF for print | |
| La Plage | Single PNG | |
| Rituel du Sol | `BLANCO` on dark backgrounds; `DARK (derived)` on light — derived variant, see gap log | |
| Colliers (partner) | 261×148px — small web use ONLY (accepted as-is, see gap log) | |
| Le Petit Salón · Salón du Ciel | Sister venues, included per Ricardo 2026-07-31 | |
| Avatars (`norfolk/avatars/`) | Team photos + cartoon variants (Ricardo, Adriano, Camila, Gabriel, Reynaldo, Wagner) | norfolk-only |

## Resolution policy

Vector-derived exports render at **maximum practical resolution** (≥4096px requested; the Windows PDF engine delivers ~5120px) — set by Ricardo 2026-07-31. Raster-only sources (e.g. the Rituel derivation) are capped by their originals and say so here.

## Additional source for Phase 5 (design standards)

**[norfolk.ai](https://www.norfolk.ai)** carries the brand's *voice and character* layer not present in these files: the agent mascots (Marcela, Diego, Chip the voice agent), taglines ("Always on AI Agent", "Conversations that actually convert"), and the site's design language. Pull from it when populating `docs/design-system.md`.

## Gap log (all dispositioned 2026-07-31)

1. ~~KIT Capital Partners `.ai` export~~ **CLOSED** — the `.ai` sources are PDF-compatible; rendered to 2560px PNGs (azul + branco) via Windows' built-in PDF engine, visually verified. Vector `.ai` sources retained in `_source/`.
2. ~~Rituel du Sol dark variant~~ **CLOSED** — `RITUEL DU SOL PNG DARK (derived).png` machine-derived from the white original (per-pixel recolor to #2B2623, alpha preserved), visually verified. *Derived, not designed* — if the venue's designer ever supplies an official dark version, it replaces this one.
3. Colliers — **ACCEPTED AS-IS**: verified 261×148px; suitable for small web/partner-attribution use only. A larger use would need a better source (Colliers press kit, or via the engagement contact).
4. ~~Avatars~~ **CLOSED** — the Dropbox "avatar" folders held Synthesia *training videos* (kept out of git); the real team image set came from `Norfolk AI/Brand_Assets/Media/Team_Photos` (photos + cartoon variants for the whole team, conflicted duplicates excluded).
