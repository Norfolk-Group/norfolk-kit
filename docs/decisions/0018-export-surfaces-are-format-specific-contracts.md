# 0018 — Export surfaces are format-specific contracts, not copies of the app

**Date:** 2026-08-13 · **Status:** Accepted · **Decided by:** Ricardo

## Decision

Norfolk Kit treats every distributable report as an **output surface** with its
own declared format contract. An on-screen report, publishable HTML, PDF,
workbook, CSV, image, and deck may share data and report semantics, but they do
not share a layout by default and must not be produced by indiscriminately
printing or screenshotting the interactive UI.

Each report family declares its supported output profiles in
[`export-output-contract.md`](../export-output-contract.md). The declaration
defines the audience, scope, renderer, geometry, design tokens, data/format
rules, metadata, and verification gates for every format it distributes.

## Why

An interactive report optimizes for exploration: responsive density, controls,
drill-down, hover state, and current-user context. An investor document
optimizes for careful reading, circulation, stable pagination, disclosures, and
archival. A workbook optimizes for inspection and recomputation. An image
optimizes for a bounded visual fact. Treating these jobs as one layout produces
tiny type, clipped charts, accidental controls, unreadable tables, and numbers
that cannot be trusted once they leave the app.

H-Analytics demonstrated the useful distinction in production: its investor
pipeline renders canonical HTML first and converts that exact document to PDF,
while its scenario exporter separately produces PDF, XLSX, PPTX, CSV, and PNG
for the viewer's own live context. Those are distinct products with different
design and verification needs. Kit carries the principle forward without
copying H-Analytics' application-specific report code or visual identity.

## Consequences

- A report’s semantic data contract is shared; its output renderer is chosen by
  its profile. The interactive view is never the implicit PDF renderer.
- PDF and published HTML may share a document model when the HTML is the
  canonical print-ready source. Their equivalence must be tested.
- XLSX/CSV preserve data semantics and traceability; visual polish cannot hide
  changed values, dropped sections, or missing years/properties.
- Every artifact carries provenance and is verified before publication. A
  regenerated timestamp alone does not make it a new design baseline.
- Product-specific brand treatment belongs in the product output contract. Kit
  supplies the rules and gates, not a client report theme.
- Kit supplies a conservative financial-report default—monochrome statements,
  restrained chart accents, readable condensed/tabular typography, and generous
  chart space—so a product starts from an explicit baseline rather than taste.
- Renderers are capability-negotiated. An SDK, server, or plugin must declare
  its formats, fonts, layout features, accessibility features, and limits before
  it can be selected for a profile.

## What this rules out

- Calling `window.print()` on an interactive report as the investor PDF path.
- Treating a screenshot, browser DOM capture, or a client export helper as a
  canonical investor-report renderer without an explicit profile and approval.
- One generic "Export" button that implies all formats have the same scope,
  visual design, or data behavior.
- Approving an artifact because it downloaded successfully, without checking
  its data parity, layout, metadata, and format-specific contract.
- Sending unsupported instructions to a renderer and silently accepting whatever
  degraded file it happens to return.
