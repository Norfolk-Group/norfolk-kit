# 0019 — DOCX is an editable document output, not a flattened PDF

**Date:** 2026-08-13 · **Status:** Accepted · **Decision source:** H-Analytics adoption inventory (Ricardo-authorized)

## Decision

Norfolk Kit governs DOCX as its own output profile. A conforming DOCX preserves
editable text, named styles, native tables, sections, links, captions, and
document metadata. Its renderer must declare native DOCX structure support and
any limitations that affect fonts, pagination, repeated headers, or reflow.

The default `norfolk-financial-monochrome` theme supports DOCX from version 2.
Products adopt that version explicitly and keep approved earlier artifacts as
rollback targets until their semantic, structural, and rendered baselines pass.

## Why

H-Analytics already distributes a DOCX export. Leaving DOCX outside the Kit
would force an adopter either to keep an ungoverned format or to pretend PDF and
DOCX have the same job. They do not: PDF preserves fixed presentation; DOCX
supports review and controlled editing across word-processing software.

## What this rules out

- Wrapping flattened PDF pages or statement screenshots in a DOCX container.
- Treating successful download as proof that text, tables, styles, and sections
  remain native and editable.
- Silently accepting font substitution or pagination loss from an SDK/plugin.
- Assuming a DOCX visual baseline must be pixel-identical to the canonical PDF.

## Reversal conditions

Only if Norfolk products stop distributing editable word-processing documents.
