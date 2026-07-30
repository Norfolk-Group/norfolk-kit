# Replit export — the original animations

**These are the originals, and they are richer than the components that shipped into H-Analytics.** Extracted verbatim from the two handoff documents in `docs/design/animations/` (`Cube-Components.md`, `Lascaux-Components.md`), which are Replit exports of the animation work.

## Why this folder exists

The versions running in H-Analytics are a *port* of these files, and the port lost material:

| Component | Export | In H-Analytics | Delta |
|---|---:|---:|---:|
| `RebeccaCaveSequence` | 15,859 | 11,513 | **−4,346** |
| `RebeccaTotemSequence` | 13,072 | 11,149 | −1,923 |
| `RebeccaGeoSequence` | 12,851 | 11,065 | −1,786 |
| `RebeccaAliveGeometry` | 10,590 | 10,007 | −583 |
| `RebeccaSwissOrbit` | 9,620 | 9,039 | −581 |
| `RebeccaAdvancedOrbit` | 17,976 | 17,496 | −480 |
| `RebeccaAgents` | 9,461 | — | **absent entirely** |
| `AnalystCubeR3F` | 5,546 | — | absent (WebGL variant) |

Byte counts are a proxy, not proof — some of the delta is import rewrites (`framer-motion` → `motion/react`) and comment loss. But a 38% reduction in the Cave sequence is not import churn, and `RebeccaAgents` is simply missing.

**Treat these files as the reference for behaviour.** Where a port and an export disagree about a duration, an easing, a colour or a code path, the export is the original intent.

## Status: reference only, not wired in

Nothing imports from this folder yet. Reconciling the port against the export is an open task — see `docs/plans/`. Do not delete these on the assumption that the shipped components supersede them; the evidence points the other way.

## Naming

These files keep their original persona names so they stay diffable against the export documents. The kit's own components are renamed to describe behaviour instead — mapping in `../README.md`. Rename these only when the reconciliation lands, and in the same commit as the diff, so the comparison isn't lost.

## Origin

Replit built the original UI and animation work. Worth remembering when the next motion-heavy surface comes up.
