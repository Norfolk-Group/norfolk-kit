# 0011 — Large files live in R2, not in git

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Ricardo

## Decision

No file over **5MB** enters any repo. Large assets — video, Illustrator masters, print-resolution imagery, datasets — go in **Cloudflare R2**, and the repo stores the URL. Enforced by `kit-guard` rule 5 on every pull request, not by anyone remembering.

Ricardo, 2026-07-31: *"large files do not belong in the repo and if needed we will store in R2 in the future"* and *"do not stuff too much graphics and junk in the repo."*

## Why this is enforced rather than advised

Git keeps **every version of every file forever, in every clone**. A 40MB asset committed twice is 80MB that every person and every CI run downloads, permanently. `git rm` does not reclaim it — the blob stays in history, and removing it properly means rewriting history and breaking every existing clone.

So the cost of a large file is not paid once at commit time. It is paid by everyone, on every clone, forever. That asymmetry is why this is a blocking check and not a guideline: by the time anyone notices, undoing it is expensive.

## What triggered it

The first live equip run found the kit's `brand/` tree is **180MB**, and equip was about to copy it into every repo. Largest single file: a 15MB LinkedIn banner in `.ai` format. That was caught by a payload exclusion, but the exclusion only protects repos the kit equips — nothing stopped a large file being committed directly.

## Consequences

- **The kit itself is currently in violation.** `brand/` holds 180MB. It is excluded from every payload, so it reaches no other repo, but it should move to R2. Tracked as Phase 4 work alongside curating web-sized brand sets.
- **Curated web sets are the norm.** What ships to a repo is web-sized SVG/PNG. The masters live in R2.
- The threshold is `--max-file-bytes`, defaulting to 5MB. A repo with a real need can raise it deliberately; the default is the safe one.

## What this rules out

- **Git LFS.** Solves the clone-size symptom but adds a second storage system, per-repo configuration, and a failure mode where a fresh clone silently gets pointer files instead of content. R2 is already in the stack for Obra Pía (decision 0002), already paid for, and already has presigned-upload plumbing.
- **Committing masters "just this once."** There is no once. See above.
