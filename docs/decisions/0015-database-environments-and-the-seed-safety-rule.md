# 0015 — Database environments, and why a database must say what it is

**Date:** 2026-07-31 · **Status:** Accepted · **Decided by:** Claude (CTO call), from damage Ricardo reported
**Enforced by:** `tools/db-guard/assert-target.mjs`

> **Ricardo, 2026-07-31:** *"I don't understand and don't need to why we need dev, staging and production versions of databases and doppler. But you need to do that for me and be super rigid here. I lost months of work because Replit and CC kept getting confused when to seed the dev database or the production database, and then both were wrong."*

**Months of work were destroyed.** This record exists to make the specific failure impossible, not discouraged.

## The mistake in how this is normally built

The usual design makes safety depend on **the config being right**. `DATABASE_URL` points at dev, so the seed script hits dev. Fine — until the string is wrong.

A connection string is a string. It gets copied between `.env` files, cached in a shell that was opened yesterday, resolved from the wrong Doppler config, or pasted by an agent that was confident and mistaken. **When that happens, every check that reads the config agrees with the mistake.** The seed script asks "am I in dev?", the config says yes, and production is overwritten.

Adding instructions does not help. An agent that is confident and wrong reads instructions perfectly well and then does the wrong thing anyway. This is a design problem.

## The decision

### 1. Every database says what it is

One table, one row, written when the database is created and never by application code:

```sql
CREATE TABLE _db_environment (
  environment  text NOT NULL,   -- development | staging | production
  stamped_at   timestamptz NOT NULL DEFAULT now(),
  note         text
);
```

**Destructive commands ask the database, not the config.** Point a seed script at production and it stops — because production answers "production" regardless of which variable led you there. The answer travels with the data, so it cannot be swapped by accident.

Re-stamping is refused. That path is precisely how a production database quietly becomes labelled "development" and then gets seeded.

An **unstamped** database is treated as dangerous and refused. The likeliest explanation for an unstamped database is being pointed somewhere unexpected.

### 2. Destructive commands are guarded, in `package.json`, not by memory

```json
{
  "scripts": {
    "guard:dev":  "node tools/db-guard/assert-target.mjs --require development",
    "seed":       "npm run guard:dev && tsx scripts/seed.ts",
    "db:reset":   "npm run guard:dev && drizzle-kit push --force"
  }
}
```

There is no unguarded path to `seed`. Not a convention — the only way to run it.

### 3. Production credentials do not exist where development happens

Three Doppler configs per project — `dev`, `stg`, `prd` — each holding **only its own** `DATABASE_URL` under the same key name. A dev environment never holds the production string.

**This is the strongest control here, and it is structural: you cannot corrupt what you cannot reach.** The stamp check exists for when this one is somehow bypassed. Two independent controls, because one was not enough to prevent months of loss.

Same key name in every config, so nothing in the code branches on environment — the code is identical everywhere and only the launcher differs:

```bash
doppler run --config dev -- npm run seed     # works
doppler run --config prd -- npm run seed     # refused, twice over
```

### 4. Neon branching, so "dev vs prod" stops being two things to maintain

Neon branches a database instantly and cheaply. Rather than a separate dev database that drifts out of date:

- `production` — the `main` branch. Stamped `production`.
- `staging` — a branch. Stamped `staging`.
- `development` — a branch, recreated whenever it gets messy. Stamped `development` on creation.

A dev branch starts from the real schema, so "works on dev, breaks on prod" from schema drift stops happening. Throwing away a dev branch costs nothing, which is what makes seeding safe to do freely — the whole reason seeding was risky was that it was being done somewhere expensive.

**pgvector is enabled on every branch** (decision 0007), so embedding work behaves the same everywhere.

### 5. Migrations go forward, in CI, only

Applied by the deploy pipeline, never from a laptop. `drizzle-kit push --force` against production by hand is the other way months disappear.

## On blaming Replit

Ricardo, 2026-07-31: *"I think Replit was the main culprit."*

Probably right, and for a specific reason worth naming: Replit's model puts development and production unusually close together — historically one database per Repl, one connection string, and a single workspace that both edits the code and runs the deployed thing. In that arrangement "which database am I talking to" has no clear answer, and its agent has wide permissions inside it. The mistake was not unlikely there; it was close to inevitable.

**But "it was Replit" is the wrong lesson to take**, for two reasons.

First, Ricardo's own account was *"Replit and CC kept getting confused."* Claude Code did it too. Any agent in that architecture eventually does, because the architecture makes the wrong action indistinguishable from the right one.

Second — and this is the reason it matters — the move to Railway and Neon does not fix it. **Railway will hand you one ambiguous `DATABASE_URL` just as readily**, and then the same loss happens with a different logo on it. Believing the platform was the problem is precisely how a team skips building the guard and repeats the incident somewhere new.

Replit made it likely. The architecture made it possible. This record addresses the second, because that is the part that travels.

### Corollary — Replit is a design tool, not an environment

Ricardo rates Replit's UI work (*"replit is great with UIs and design"*), and the animation components it produced are good enough that he asked to keep them in the kit. That judgement stands.

So: **use Replit to generate interfaces; never let it be where data lives.** Prototype there, bring the components across, and keep the database, the migrations and the deployment in the stack that has these controls. It is genuinely good at the first thing and structurally dangerous at the second.

## Why two controls rather than one

Either alone would probably have prevented Ricardo's loss. Both, because "probably" was already tried:

| Control | Fails if… |
|---|---|
| Production credentials absent from dev | someone deliberately copies the production string in |
| Database self-identifies | someone re-stamps it (refused) or hand-edits the row |

They fail for unrelated reasons, which is the point.

## What Ricardo has to do

**Nothing.** He asked not to have to understand this, which is the correct request.

What he will see: if something is pointed at the wrong database, it stops with a plain sentence saying which database it actually reached and which command to run instead. No stack trace, no corrupted data.

## What this rules out

- **Trusting a config string for a destructive action.** The specific cause of the loss.
- **A single shared `DATABASE_URL` across environments.** Ambiguity is the vulnerability.
- **Seeding or resetting from a laptop against anything but a dev branch.**
- **Hand-run migrations against production.**
- **Unstamped databases.** Refused rather than assumed safe.
