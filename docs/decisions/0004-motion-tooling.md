# 0004 — Motion tooling: bake at build time, ship almost nothing

Date: 2026-07-29
Status: Accepted

## Decision

Adopt a **build-time baking** architecture for the motion library: heavy, best-in-class tools (GSAP's morph solver, Rough.js's roughening, noise generators) run once during `pnpm build` inside Playwright, and only their *output* — plain SVG path data, matched morph pairs, precomputed `shapeIndex` values — is committed and shipped. The tools themselves never enter the bundle.

Concretely, adopt now:
- **perfect-freehand** (2.0KB gz) — the actual renderer for hand-drawn strokes: pressure-tapered width, not constant-width jitter.
- **svg-path-properties** (build-time only) — arc-length resampling; feeds perfect-freehand and gives a from-scratch correspondence solver for open paths (GSAP's `shapeIndex` is closed-paths-only, and the cave glyphs are open strokes).
- **FastNoiseLite** (vendor the upstream JS file, not the stale npm wrapper) — domain-warped, spatially coherent wobble. This is the specific ingredient that separates "hand-drawn" from "noisy."
- **Rough.js** (`generator()` only, vendored, never the DOM renderers) — for the re-trace overlay pass, held at a fixed seed, layered *under* the perfect-freehand outline.
- **GSAP MorphSVGPlugin + DrawSVGPlugin + Physics2DPlugin** — `devDependency` only. `normalizeStrings()` runs headless in Node and returns point-count-matched, still-open, all-cubic path pairs. Bake once, ship the matched pairs as data, drive the actual morph at runtime with a bare lerp — no GSAP in the bundle.
- **Zdog** (7.3KB gz, vendored) — 3D for the *artifact* specifically: the 27-cubie cluster and the orbital rings. Real depth-sorting via `Anchor.shapeSorter`, and its thick round-capped stroke look already matches the primitive hand-drawn language. Verified against three.js: a minimal three scene alone measures 135KB gz, React+three+R3F measures ~304KB gz (R3F's `import * as THREE` defeats tree-shaking). **three.js/R3F stays app-only**, adopted later, only when the portal needs real lighting Zdog's flat-color faces can't fake.
- **Storybook 10** (`@storybook/react-vite`) as the actual gallery, plus **vite-plugin-singlefile** to produce the self-contained artifact from the same component source — one library, two build targets, not two libraries.
- **Playwright** (pin ≥1.57 — the `page.clock`/rAF-fast-forward bug was fixed 2025-10-13) as the bake harness and the only tool that can see the hand-rolled canvas families (Chromatic explicitly cannot pause canvas/JS-driven animation).

Explicitly rejected, with reasons that should not be re-litigated:
- **Rive** — the obvious tool for the walk-cycle, disqualified by an order of magnitude: ~820KB gzip of WASM, needs `wasm-unsafe-eval`, fetches its own binary from a CDN by default.
- **Lottie / dotlottie-web** — baked timelines can't express nine states dealt from a shuffled bag, can't re-seed per frame, no `prefers-reduced-motion` awareness. `lottie_light` kept in reserve for one-off designer-delivered set pieces only.
- **flubber** — Motion's own tutorials recommend it; verified empirically anyway to add a `Z` (closing open strokes), flatten curves to `M`/`L` only, and silently drop the second subpath. All three are open TODOs in its own README.
- **anime.js v4, react-rough-fiber, regl, Theatre.js, Ladle, Histoire** — each individually disqualified (second animation engine, unmaintained fork, hard CSP failure via `Function.apply`, years-dead "1.0 coming soon," broken React 19 peer deps, no React support at all respectively). Full reasoning in the workflow journal if any of these come up again.
- **tsParticles / Sparticles / regl / Rapier** for the orbital sparks specifically — either wrong domain (2D canvas can't depth-sort against the 3D solids), copyleft-licensed, or WASM/CSP-hostile. A hand-rolled ~120-line pooled emitter, or GSAP's Physics2D at 1.2KB, does the job.

## Why

The strict CSP on the self-contained-HTML artifact (no CDN, no external script, no `unsafe-eval`) looked like it ruled out the entire category of serious tooling. It doesn't — it only rules out *shipping* those tools. Verified directly: `Rough.js generator().path().toPaths()`, `GSAP MorphSVGPlugin.normalizeStrings()`, and `svg-path-properties`'s measurement functions all run in plain Node with zero DOM. That means the artifact gets the best available solver in each category and pays for none of it.

## What this rules out

- Installing any of the rejected libraries as a runtime dependency, for the reasons already tested and recorded above — don't re-run this research on the same candidates.
- Rive, Lottie, or any baked-timeline format as the *authoring* format for the 18 procedural animations. They may return as one-off delivery formats for a designer-supplied set piece, never as the system.
- three.js/R3F inside the self-contained artifact build. It is correctly in scope for the portal app itself once real lighting is needed.
- Treating Chromatic as sufficient reduced-motion coverage — it has no visibility into canvas or JS-driven animation, which is roughly 40% of this library. Playwright's `page.clock` covers that gap locally, for free.

## The cave-painting fix, in order (do not reorder)

The animals read as inferior because the marks have constant width and independent per-point jitter — a real charcoal stroke swells under the hand and thins at the ends, and its wobble is coherent along the stroke because a hand and a rock are one continuous system.

1. Make **perfect-freehand** the renderer, not Rough.js: sample the glyph via `svg-path-properties`, then `getStroke(points, {size, thinning: 0.65–0.75, smoothing: 0.5, streamline: 0.4, simulatePressure: true, start:{taper:20}, end:{taper:20}})`, emit one filled path. This alone is the largest single quality jump, at 2.0KB gzip.
2. Displace the sampled points with FastNoiseLite **domain warp**, per-glyph seeded. Coherent wobble, not noise.
3. Only then layer **Rough.js**, `disableMultiStroke:true, preserveVertices:true`, held seed, low opacity — so it reads as a mark re-drawn over itself, not doubled.
4. Cycle exactly **three seeds** on a slow 8–10fps step for flicker and re-trace. Omitting the seed makes the glyph boil differently every render — hold seeds deliberately.
5. Swap seeds between the three limb poses so the walk reads as re-drawn, not tweened. Ghost limbs = the same outline at an earlier interpolation `t`, fading — not separate thin strokes.

Consequence to accept: a filled perfect-freehand outline can't draw on via `stroke-dashoffset` (it isn't a stroked line). Reveal it by feeding a growing slice of the point array (`last:false`), or by animating a mask. Put that divergence in one shared `CaveStroke` component so it stays contained.

If, after all five steps, it still reads as vector rather than pigment: the missing ingredient is grain, not geometry. Bake **p5.brush** charcoal texture strips in the Playwright harness and use them as data-URI masks over the outlines — do not reach for p5.brush first; it's 28KB gzip, WebGL2-only, and can't live in the SVG tree or be driven by Motion.

## Connectors already available, gating on authorization

- **Figma MCP server** + the `figma-implement-motion` / `figma-use-motion` Claude Code skills — the actual round-trip for pulling motion specs out of Figma faithfully (keyframes, easing, duration as data) instead of eyeballing a recording. Requires a one-time `/mcp` authorization in an interactive session; not available in this non-interactive one.
- **shadcn registry format** — the natural distribution unit once the library is built: `npx shadcn add <url>` copies source, so nothing enters either product's bundle that wasn't explicitly reviewed.
- **context7** — pull current docs before writing any Storybook 10 or Vite single-file config; the research surfaced live examples of blog posts already wrong about both.

## Reversal conditions

Only if the self-contained-HTML artifact target is dropped entirely — at that point Rive becomes reconsiderable, and three.js can move into the artifact build directly.
