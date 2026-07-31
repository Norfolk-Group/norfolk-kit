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
| KIT Capital Partners | **`_source/` .ai files only — do not use until exported** (open gap) | |
| Obra Pía | `Logo Obra Pia 1` (the portal arch), @2x for retina; Foundation logo separate | |
| El Claustro | Official 2025 set (Clarena): RGB A–D for screen, CMYK PDF for print | |
| La Plage | Single PNG | |
| Rituel du Sol | **White-only — dark backgrounds only** (open gap: dark variant needed) | |
| Colliers (partner) | 261×148px — small web use ONLY; anything larger needs a better source (open gap) | |
| `venues-pending/` | Le Petit Salón + Salón du Ciel — **pending Ricardo's include/exclude call** | |

## Open gaps (tracked in the buildout plan, Phase 1)

1. KIT Capital Partners: `.ai` → PNG/SVG export needed.
2. Rituel du Sol: dark variant needed (derive or request from the designer).
3. Colliers: low-res only — verify acceptable or source better.
4. Avatars: the Dropbox "avatar" folders hold Synthesia *training videos* (26–173MB), not avatar images — proper avatar images to be chosen/extracted with Ricardo; videos stay out of git.
