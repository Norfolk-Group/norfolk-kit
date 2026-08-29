# `.kit/` — the rules that decide what a repo may receive

Four small files. Three answer one question—**when the Kit is copied into a repo, which parts may that repo hold?**—and one prevents shared Norfolk repositories from being mistaken for project starters.

Product OS adoption also uses these boundaries. The signed release manifest supplies incoming hashes and sensitivity; `tools/product-os-adopt/plan.mjs` verifies and plans, while `kit-guard` independently enforces the resulting pull request. Adoption never writes the default branch or executes a deletion.

You do not need to edit these by hand. Ask for the change in plain English and it gets made here.

| File | What it decides |
|---|---|
| `payloads.json` | **Which org gets what.** Each GitHub org maps to a class (norfolk / client / personal), and each class lists the sensitivities it may hold. An org that isn't listed gets tooling only, no brand. |
| `markers.json` | **How sensitive each file is.** Every governed path carries a marker: `client-safe`, `norfolk-only`, `client:<name>`, or `kit-only`. A path nobody marked counts as `kit-only` and ships nowhere. |
| `manifest.json` | **What was actually installed** — written into the *target* repo, not here. Lists every file equip put there, with its hash and marker. |
| `repository-roles.json` | **Which shared repo does what.** Declares the only project template and classifies adjacent governance, handbook, brand, design, integration, agent, skill, sandbox, and deleted predecessors. It is Kit-local and never enters a product payload. |

## Why it works this way

The obvious design would be to put Norfolk material in a Norfolk folder, client material in a client folder, and copy by folder. That fails the moment someone moves a file, and it fails silently — nothing announces that a Norfolk logo is now sitting in a client repo.

So folder position is never the boundary. `markers.json` is. A file's location can change freely; its marker travels with its path, and `kit-guard` checks the marker, not the folder.

**Unmarked means kit-only.** Add a file and forget to mark it, and it ships nowhere. The failure mode is a missing file, which someone notices—not an internal file silently distributed to every Norfolk repository.

## Why the boundary lives here and not in GitHub permissions

Ricardo controls all three orgs with one identity. Access control cannot separate them, because access is the same in all three. The only thing standing between a Norfolk asset and a client repo is this mapping — and the CI check that enforces it.

That is also why `kit-guard` runs in every equipped repo rather than only here. Judged against the org the repo is in **right now**, so a repo transferred between orgs fails on its next PR instead of quietly keeping material it should no longer hold.

## Adding an org, client, or file

- **New org** → add it to `payloads.json`. Until you do, it gets tooling only and the PR says so. That default is deliberate: granting brand should be a decision someone made, not something that happened.
- **New client** → add a `client:<name>` sensitivity, mark their brand paths, and map their org.
- **New kit file** → mark it in `markers.json` in the same commit. Unmarked files ship nowhere.

## Checking a repo yourself

```bash
node tools/kit-guard/check.mjs --audit-only
```

Reports what the repo currently holds and whether its org is allowed to hold it. No diff required — use it on any equipped repo, any time.
