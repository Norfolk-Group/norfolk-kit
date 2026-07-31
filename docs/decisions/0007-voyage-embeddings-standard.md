# 0007 — Voyage AI is the portfolio embeddings standard

Date: 2026-07-31
Status: Accepted

## Decision

All semantic-search / RAG features across all products embed with Voyage AI (voyage-4 family), vectors stored in Neon pgvector (per 0003).

## Why

Researched against official July-2026 sources (origin R10):

- Cheapest frontier option: $0.06/M tokens vs $0.12–0.15 for OpenAI/Cohere/Gemini equivalents, with 200M free tokens per model.
- Post-MongoDB-acquisition trajectory is investment, not decline: voyage-4 shipped Jan 2026, voyage-context-4 Jun 2026; the standalone API and official TypeScript SDK remain first-class.
- Still the only embeddings vendor Anthropic names in its own documentation.
- At portfolio scale (thousands to low-hundreds-of-thousands of chunks), quality deltas between all frontier providers are noise next to chunking and reranking choices. This is a settle-and-stop-thinking category.
- The escape hatch is trivial: re-embedding a 100k-chunk corpus costs ~$3 and minutes of API time.

## What this rules out

- Per-project embedding-provider choices.
- OpenAI/Cohere/Gemini/open-weight embeddings without a superseding record.
- A separate vector database (vectors live in Postgres, per 0003).

## Risk, on the record

MongoDB's incentive to steer Voyage toward Atlas-exclusive bundling while this stack is Postgres-based.

## Reversal conditions

Standalone-API deprecation or Atlas-exclusive packaging. Exercise the ~$3 escape hatch; strongest fallback at decision time: OpenAI text-embedding-3 or Cohere Embed v4.
