# Solutions

**Tier: REFERENCE**

This directory holds Compound Engineering learnings — one file per learning, produced by `/ce-compound` and refreshed by `ce-compound-refresh`.

## Format

Each file uses frontmatter:

```yaml
---
title: Brief description of the learning
date: YYYY-MM-DD
source: PR, ADR, or work session that produced it
---
```

Body contains one focused learning per file. Keep learnings atomic — split compound lessons into separate files.

## Maintenance

- Files are created by CE workflow during `/ce-compound`
- Run `ce-compound-refresh` to update stale entries
- A solution file does not outrank an ADR — decisions live in `decisions/`
