# Animation library

Carried over from H-Analytics, where these were built as agent "thinking" and processing indicators. They are the canonical motion vocabulary for Norfolk projects — reach for one of these before inventing new motion.

## Families

| Family | Components | Character |
|---|---|---|
| **Cube** | `AnalystSwissCube`, `AnalystThinkingCube`, `AnalystCubeIcon` | Rotating/assembling geometry. Precise, technical, Swiss-grid feel. |
| **Lascaux / cave** | `RebeccaCaveSequence`, `RebeccaTotemSequence`, `RebeccaGeoSequence`, `RebeccaAliveGeometry` | Cave-painting-derived marks that draw themselves on. Warm and organic against the geometric families. |
| **Orb** | `RebeccaOrb`, `IrisOrb`, `MarcoOrb`, `GustavoOrb`, `SpecialistOrb` | Small persistent presence indicators, one per persona. |
| **Orbit** | `RebeccaAdvancedOrbit`, `RebeccaSwissOrbit` | Bodies orbiting a centre; for longer waits than an orb suits. |
| **Solver** | `AnalystQuantumSolver`, `AnalystExpandingSolver`, `AnalystNexusCore`, `AnalystBarChartPulse` | Visible "working through it" — search, expansion, convergence. |
| **State** | `AgentThinkingState`, `AgentWaitingOverlay` | Composed wrappers that pick a family and handle the full waiting UX. |

## Supporting files

- `../../lib/animation-registry.ts` — `ANIMATION_REGISTRY`, `resolveAnimation()`, `DEFAULT_ANIMATION_COMPONENT`. Maps a key to a component so animation choice is data, not a hardcoded import.
- `../../hooks/useAnimationForCategory.ts` — picks an animation from a category.
- `useReducedMotion.ts` — honours `prefers-reduced-motion`. **Use it.** Every new animation must degrade gracefully; that's an accessibility requirement in `docs/design-system.md`, not a nicety.
- `focus-trap.ts`, `types.ts` — support for the overlay components.
- `AnimationCatalog.tsx` — renders every registered animation side by side. This is the seed of the `motion.html` artifact required by §10 of the governance rule.

## Requirements

`framer-motion` and `react`. The `cn` helper from `../../lib/utils`. `AgentWaitingOverlay` also uses the shadcn `Button`.

## Portability caveat — read before using

Three files carry an H-Analytics-specific coupling: **`AgentThinkingState.tsx`**, **`AgentWaitingOverlay.tsx`**, and **`types.ts`** import `agent-taxonomy` and `useAnimationForCategory`, which encode H-Analytics' agent personas (Rebecca, Iris, Marco, Gustavo) and their categories. `agent-taxonomy.ts` is included here so the library runs on arrival, but a new project should replace that taxonomy with its own rather than inherit H-Analytics' personas.

The other 20 components have no such coupling — they take a `size` prop and render. Those are portable as-is.

The persona names in component filenames are historical. Renaming them is fine; if you do, update `animation-registry.ts` in the same commit, since the registry maps by key.

## Not included

- **`AnalystCubeR3F`** — a react-three-fiber variant of the cube. Left out deliberately: it pulls in a WebGL stack for one animation. Retrieve it from H-Analytics `attached_assets/` if a project genuinely needs 3D.
- The H-Analytics animation-governance plan (`docs/plans/2026-06-14-001-feat-animation-governance-plan.md` in that repo) — worth reading before extending this library.

## Specs

`docs/design/animations/` holds the original component specs: `Cube-Components.md` and `Lascaux-Components.md`. Note that H-Analytics' `Rebecca-Components.md` is byte-identical to the Lascaux one — it was a duplicate, so only one copy is kept here.

Repo spelling is `Lascoux`; the French cave is **Lascaux**. Kept as `Lascaux` here.
