# Export Output Contract

**Tier: CONTRACT** · Last verified: 2026-08-29

Investor reports and exported reports are products in their own right. They are
not alternate screenshots of an application screen. This contract governs every
distributable report surface produced by a Norfolk Kit project: published HTML,
PDF, DOCX, XLSX, CSV, PNG, and PPTX, as well as the relationship each has to its
interactive on-screen counterpart.

This is a Kit implementation contract. The Norfolk AI Product OS owns
universal doctrine; a product adds its approved brand, audience, disclosure,
and data-specific rules without weakening this baseline.

## 1. Declare the report before building it

Every report family must have one versioned output declaration. It may live in
code when machine-readable, but it must name all of the following:

- report family, intended reader, classification/sensitivity, and permitted
  distribution channels;
- canonical semantic data model, calculation version, time period, entity or
  scenario scope, and disclosure source;
- supported output profiles, their renderer, and which one is canonical for
  investor distribution;
- document geometry (page/sheet/slide/image size and orientation), design-token
  set, allowed density step, and required metadata;
- required sections, figures, tables, charts, and format-specific tests; and
- freshness policy: whether it is on-demand, scheduled, or explicitly
  operator-published, plus the condition that makes an older artifact stale.

The declaration is the source for UI labels, capability/API options, generation,
storage metadata, and verification. Do not duplicate an ad-hoc format list in
each layer.

## 2. Output profiles are different design jobs

| Profile | Optimizes for | May share | Must not inherit blindly |
|---|---|---|---|
| **Interactive report** | exploration, filters, drill-down, responsive use | semantic model, terminology, data formatting | document geometry, controls, hover-only meaning, viewport layout |
| **Published HTML** | browser reading, stable sharing, print preview | document model and CSS with PDF when declared canonical | live controls, session-only data, external dependencies that make a saved artifact change |
| **Investor PDF** | circulation, printing, archive-quality reading | canonical document HTML when PDF is a deterministic render of it | responsive breakpoints, collapsed detail, browser chrome, screen-only colors or tooltips |
| **Editable document (DOCX)** | review, redlining, controlled narrative editing | report semantics, hierarchy, disclosures, and document typography | flattened PDF pages, images of tables, spreadsheet density, layout that depends on one desktop installation |
| **Workbook (XLSX)** | audit, sorting, recomputation, analysis | labels, values, units, hierarchy, disclosures | PDF pagination, decorative cover treatments, values converted to display strings |
| **CSV** | machine exchange and simple analysis | row semantics, stable IDs, raw values, units through schema/headers | visual layout, merged cells, hidden calculations, locale-dependent ambiguity |
| **Image (PNG)** | one bounded visual fact for sharing or embedding | approved chart/table styling and source metadata | whole-report reading, tiny type, clipped legends, undocumented cropping |
| **Deck (PPTX)** | guided presentation and narration | approved message hierarchy, figures, data provenance | spreadsheet density, document pagination, app navigation |

An output declaration can omit profiles it does not support. It cannot claim that
two profiles are equivalent without defining and testing the equivalence.

## 3. Investor-document rules

These apply to published HTML and investor PDFs. An investor-facing DOCX inherits
them unless its format-specific rule below is stricter. A product may make them
more strict, never less.

1. **One canonical render path.** If HTML and PDF are both distributed, the
   preferred path is one print-ready document HTML rendered to PDF with its
   declared print stylesheet. Otherwise the declaration names both renderers
   and the parity checks that prove their shared semantics.
2. **Content drives pagination.** Statements begin on a new page; charts occupy
   a deliberate full-page or declared bounded region; semantic table groups do
   not split arbitrarily. Never page-break solely by a hard-coded row count
   when a named section boundary is available.
3. **Reading beats screen density.** Declare a minimum readable body, table,
   and chart-label size for the geometry. A dense page may use an approved
   document-only compact step, wrap labels, alter orientation, or divide into
   pages. It may not silently shrink numeric content until it is unreadable.
4. **Values do not give way.** Numeric columns remain aligned and legible;
   labels wrap, pages reflow, or the report changes orientation. Accounting
   signs, units, periods, decimals, rounding, and footnotes use the report
   family’s canonical formatter.
5. **Covers are an exception, not a loophole.** A cover may use a distinct
   composition. Content-page headers and footers remain quiet, repeatable, and
   readable; no decorative dark band or background may reduce printed contrast.
6. **Interactive disclosure cannot disappear.** Expanded detail, definitions,
   assumptions, caveats, and methodology required to interpret a figure appear
   in the distributed document. Hover, collapsible rows, and tooltips are never
   the only carrier of material information.
7. **Scope is explicit.** The artifact identifies its entity/scenario, period,
   currency, as-of time, calculation/version identity, and whether it is final,
   draft, illustrative, or internal. Filenames follow the same identity.

### Default theme: Norfolk Financial Monochrome

Kit ships one conservative baseline for financial statements and investor
documents: `norfolk-financial-monochrome` v2. Products may add an approved
branded report theme, but a branded theme inherits these legibility and spacing
floors. It cannot simply reuse the selected application-screen theme.

#### Theme resolution and provenance

An application theme and a report theme are separate, versioned objects. A
selected or default screen theme may influence an export only through an
explicit mapping from stable theme ID to stable report-theme ID, optionally
scoped by output format. Exporters do not interpret color roles from display
names, color names, ranking, free-text descriptions, or string prefixes.

Resolution order is: an explicitly requested approved report theme; an approved
screen-theme-to-report-theme mapping for the format; then the product's declared
default report theme. An unmapped screen theme uses the default report theme and
records that fallback. Ambiguous mappings or a theme that does not support the
requested format fail before rendering.

The artifact manifest records the screen theme ID when one was present, resolved
report theme ID and version, mapping/registry version, renderer ID and version,
font assets actually embedded, and every permitted fallback. This snapshot is
immutable for the artifact: a later admin change to the application's default
theme does not silently restyle a previously generated investor report.

#### Typography

| Role | Default | Preferred / floor | Rule |
|---|---|---|---|
| Narrative, headings, explanations | Inter | 10.5pt / 10pt body | Familiar reading face; 400–600 only |
| Dense row labels | IBM Plex Sans Condensed | 10.5pt / 10pt | Condensed width buys columns without sacrificing legibility |
| Dense financial figures | IBM Plex Sans Condensed | 10.5pt / 10pt | Tabular lining figures; right aligned |
| Fixed-width audit view | IBM Plex Mono | 10pt / 10pt | Optional for ledgers, codes, raw extracts, or strict character alignment—not the default for all prose |
| Notes and disclosures | Inter | 9pt / 9pt | Never shrink legal or methodological context to make a page fit |
| Axes, legends, data labels | IBM Plex Sans Condensed | 10pt / 9.5pt | Increase chart space or reduce ticks before reducing type |

The font set is bundled locally through Fontsource: Inter, IBM Plex Sans
Condensed, and IBM Plex Mono. Generated HTML and PDFs embed or package the
fonts; they never depend on a viewer already having them or on a runtime font
request. Roboto Condensed is an approved alternate condensed family when a
product declares and bundles it, not a silent system fallback.

When a statement is too dense, the response order is: change orientation;
split periods or sections; repeat headers on an additional page; wrap labels;
use the approved condensed face; then reconsider scope. Shrinking core table
figures below 10pt is not an option.

#### Palette

Financial statements are monochrome by default: white paper, near-black ink,
grey secondary text, hairline rules, and one quiet grey fill for hierarchy.
Negative values use accounting parentheses and typographic weight—not red as
their sole meaning. Dark fills are reserved for a cover or a rare major total;
alternating saturated row fills are forbidden.

Charts may use the theme's restrained accent sequence (teal, blue, ochre, rust,
violet) because series need differentiation. Every series also differs by line
style, marker, direct label, or another non-color encoding. Accent colors do
not leak into financial tables merely because the chart palette exists.

#### Tables

- The label column receives roughly 38% of the width; period/value columns are
  equal, right-aligned, and use tabular lining figures.
- Labels wrap; numeric values do not. Use accounting parentheses, consistent
  units/precision, and an em dash for a true displayed zero when the report
  family declares that convention.
- Use whitespace and sparse horizontal rules. No full cell grid, decorative
  vertical rules, pill-shaped cells, gradient fills, or colored heatmap unless
  analytical color is the actual subject.
- Repeat column headers on every page. Keep subtotals/totals with the rows they
  summarize; do not orphan a heading or split one semantic group arbitrarily.
- XLSX keeps native numbers and formats even when PDF/HTML displays an em dash
  or accounting parentheses. Presentation formatting never changes the value.

#### Graphs and charts

- A full-page chart keeps at least 26mm horizontal padding, 18mm above the plot,
  and 22mm below it. An inline chart keeps at least 16mm internal padding. The
  plot itself occupies no more than 75% of its available page region.
- Titles, units, period, source/as-of context, and legend/direct labels live
  outside the data marks. Legends never cover plotted data.
- Use major gridlines only, with quiet contrast. Remove ornamental borders,
  gradients, shadows, 3-D effects, gauges, and oversized marks.
- Prefer direct labels and a small number of purposeful series. If a chart
  becomes crowded, split it or move secondary series to a companion panel;
  do not solve crowding by making the chart touch every page edge.
- Axes begin at a defensible baseline for the analytical question. Truncated
  axes and dual axes require an explicit note because they can distort meaning.

#### Graphics and imagery

Graphics earn their place by explaining a claim, a process, or a data
relationship. Prefer vector artwork; raster material intended for print is at
least 300dpi at its placed size. Respect logo clear space and preserve original
aspect ratios. Screenshots of UI, clip art, decorative stock charts, background
watermarks behind data, and low-resolution logos are not report graphics.

Every material chart or image has a caption or text alternative in the delivery
surface. A cover may be expressive; statement pages remain quiet enough that
the numbers are unmistakably primary.

## 4. Each additional format keeps its native job

### DOCX

- DOCX is an editable document, not a PDF envelope. Headings use named styles;
  paragraphs remain text; tables remain native tables; headers, footers, page
  sections, links, captions, and accessibility metadata use the document model.
- Use explicit sections for page geometry and controlled breaks. Repeat table
  headers where the SDK supports them, keep semantic table groups together, and
  declare any renderer limitation that prevents deterministic pagination.
- Embed or package approved fonts when the renderer supports it. When it does
  not, use only a declared metric-compatible fallback and record the substitution
  in the artifact manifest; a viewer-dependent silent font swap is not compliant.
- A DOCX may be intentionally editable or intentionally protected, but the
  declaration must say which. Redlining or edits never mutate the canonical
  report data, calculation provenance, or stored approved artifact.
- Do not place screenshots of statements or flattened PDF pages inside DOCX to
  imitate layout fidelity. If exact fixed layout is required, distribute PDF;
  if editable structure is required, accept and test the DOCX renderer's reflow.

### XLSX

- Use real numeric/date cells, stable sheet names, frozen identifier/header
  regions where useful, explicit number formats, and a visible assumptions or
  provenance sheet when the workbook is investor-facing.
- Formula cells, inputs, and derived values are distinguishable without relying
  on color alone. Cell protection and editability are declared, not accidental.
- No merged-cell layout may make sorting, filtering, copy/paste, or assistive
  use unreliable. Long tables use a table/data-sheet form rather than a PDF
  reproduced inside a grid.

### CSV

- UTF-8, stable column order, stable identifiers, unambiguous ISO dates, and
  machine-readable unrounded values are required unless the output declaration
  explicitly says it is a presentation extract.
- A CSV never substitutes for a formatted investor document; it is a data
  delivery profile with an accompanying schema or data dictionary when needed.

### PNG

- Render one declared chart, table region, or cover/slide—not an arbitrary
  viewport. Declare pixel dimensions, background, pixel density, crop bounds,
  and the title/period/units that remain readable at the delivered size.
- Preserve a text alternative or adjacent caption in the delivery surface. An
  image alone cannot carry the report’s material context.

### PPTX

- Use presentation geometry, a readable distance type scale, and one message
  per slide. Speaker narration may add context; it cannot be the only place a
  slide’s figure is explained.
- Tables and charts are rebuilt for the slide; do not paste a reduced PDF page
  into a deck and call it a presentation.

## 5. Provenance, security, and distribution

Each generated artifact has a manifest record containing at least its report
identity, profile, source/calculation version, generated-at timestamp, producer
version/commit, data as-of timestamp, classification, checksum or fingerprint,
and storage key. Serving a file uses the project’s authorization and direct
storage delivery contract; private report bytes never proxy through an
application request handler.

Regeneration is separated from serving when it is expensive, stateful, or uses
canonical data that must not enter a long-lived request process. A serving route
returns a completed, verified artifact; it does not opportunistically recompute
an investor report for a live request.

## 6. Verification gates

An export is not ready because a file exists or a download returned `200`. The
generator or release gate must record the following for each profile it ships:

| Gate | All profiles | Document HTML / PDF | DOCX | XLSX / CSV | PNG / PPTX |
|---|---|---|---|---|---|
| Semantic parity | expected sections, scope, years/entities, representative values, units, and rounding policy | same | same, including editable text and native tables | same | same figures and labels |
| Provenance | manifest, version, timestamp, classification, and source fingerprint | same | same | same | same |
| Format integrity | successful parse/open by its native reader | valid HTML/PDF, no external runtime dependency | valid package, styles, sections, relationships, text, and native tables | workbook/schema opens; formulas and numeric cells are valid | declared dimensions and native file structure |
| Visual review | n/a where not meaningful | rendered-page check: overflow, clipping, contrast, orphaned headings, page breaks, footer/header collision, and density | rendered review in the declared reference reader plus reflow check in one supported alternate reader | legibility of headings and columns | legibility, crop, safe area, chart/table label visibility |
| Regression | approved fixture or baseline when the design is stable | rendered visual baseline plus content/fingerprint check | package-structure/content fixture plus rendered baseline | schema/value fixture | rendered visual baseline plus content check |

The data-parity gate must test more than download success. At a minimum it
checks expected sections, representative values within the report’s declared
tolerance, period count, and entity/property count. Investor-facing financial
statements also run their family tie-outs before render.

Artifact fingerprints normalize generated timestamps so an unchanged report can
be regenerated without a false regression, while a renderer or stylesheet
change cannot ship against an unrefreshed visual baseline.

## 7. Required implementation boundaries

- A transport-neutral capability owns authorization, report identity, semantic
  data selection, and audit events. UI, tRPC, MCP, scheduled jobs, and report
  generators call the same capability path where that is safe.
- Rendering is a format adapter. It receives a completed semantic report model;
  it does not silently re-run financial calculations or derive a second set of
  business rules.
- Output-specific tokens are named separately from screen tokens. For example,
  a product may define `--report-page-*`, `--report-table-*`, and
  `--workbook-*`; it must not alter interactive tokens merely to improve a PDF.
- A visible product export control states both format and scope: for example,
  “PDF — full investor report” versus “XLSX — current scenario data.” A single
  generic “Export” label is insufficient when profiles differ.

## 8. Renderer, SDK, server, and plugin capability contract

Export profiles describe desired output; renderer adapters declare achievable
output. Before generation, the system negotiates the profile against a
machine-readable capability manifest for the selected SDK, server, or plugin.
The manifest names:

- supported formats and execution location (client, server, or plugin), with
  format-specific capability overrides where an SDK's paths differ;
- available embedded/local fonts;
- page geometry, paged-media CSS, controlled break, and repeated-header support;
- vector/raster chart, link, bookmark, tagged-PDF, PDF/A, native DOCX
  structure, transparency, and native-spreadsheet-number support; and
- operational limits such as maximum input bytes and page count.

Required capability missing → fail before rendering with a plain-language list
of unmet requirements. Preferred capability missing → use only a fallback that
the output profile explicitly permits, record it in the artifact manifest, and
surface its effect. For example, vector charts may fall back to print-resolution
raster charts when the profile allows it; tagged PDF may not silently disappear
when accessibility conformance is required.

Adapters must target the renderer's real supported subset. They do not emit CSS,
font features, SVG constructs, formulas, or pagination instructions that the
server/plugin ignores and then declare success because a file was returned.
Capabilities that differ between an SDK's PDF, image, workbook, or deck paths
are declared per format rather than promoted into one misleading global list.
Each adapter owns fixture-based conformance tests against the actual renderer
version. Upgrading an SDK or plugin invalidates that adapter's verified-version
claim until the fixtures pass again.

The reference capability types and preflight live in
`src/reporting/renderer-capabilities.ts`. Provider-specific adapters map their
own SDK or plugin facts into that neutral contract; no provider's vocabulary
becomes the report model.

## Forbidden patterns

- `window.print()` or DOM capture of a live application screen as the default
  investor-report pipeline.
- A PDF with live controls, hidden/collapsed material detail, clipped table
  values, unreadable axes, or a chart treated as decoration rather than data.
- An XLSX/CSV that exports formatted display strings when real values are
  required, a DOCX made from flattened page images, or a PNG used as the sole
  record of a financial table.
- Per-format calculation forks, untracked manual edits to generated artifacts,
  or a regeneration that changes a live multi-tenant server’s global state.
- Publishing an artifact without a declared profile, manifest, semantic check,
  and the profile’s visual/structural gate.
- Asking an SDK, server, or plugin for an unsupported feature, accepting its
  silent degradation, or claiming conformance from download success alone.

---

## Declared output surfaces

Per-family declarations live in `outputs/`. Each declares its reader, channel,
profile, token set, density, freshness, required sections, and canonical format.

| Family | Tier | Description |
|---|---|---|
| [`agent-ops-daily-digest`](outputs/agent-ops-daily-digest.md) | CONTRACT | Weekday agent status email to Ricardo. U12 tokens, scan density, no PDF sibling. (Proposed until Ricardo accepts) |
