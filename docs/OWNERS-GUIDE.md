# Norfolk AI Product OS & Starter Kit

**Owner's Guide · REFERENCE · Source reviewed: 2026-09-14**

## Start here

Your one starting point is [Norfolk Kit](https://github.com/Norfolk-Group/norfolk-kit).
Bookmark it for new applications, existing-project assessments and standards changes.

The Product OS is the agreed way Norfolk builds and operates products. The
Starter Kit is its reusable implementation. This guide explains how you use both.
These are three roles of one intended system, not three competing products.

**Consolidation is in progress.** Kit contains a runnable reference app, rules,
report utilities and setup tools. Separate Product OS source and release tooling
have not yet migrated. The proposed lock is not an adopted release. Old repositories
remain available until preservation, privacy and dependency checks pass. See the
[consolidation record](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/consolidation.md).

This guide explains the contracts; it does not replace them. Approved project
exceptions remain valid until deliberately changed. Never apply adoption work to
an application the owner has excluded.

## Choose your job

| Your goal | Prompt below | What you should receive |
|---|---|---|
| Start an application | Start a new project | Brief, selected modules, provision checklist and first tested feature |
| Bring an app into line | Assess an existing project | Read-only gaps, preserved customizations and phased proposal |
| Implement an approved upgrade | Adopt safely | Reviewable changes, tests and rollback instructions |
| Change a Norfolk standard | Update a standard | One Kit decision and proposal, then deliberate per-project adoption |
| Check readiness | Verify release readiness | Actual checks, service evidence, unresolved risks and go/no-go |

## The stack in plain English

This table combines approved technology choices with implemented components;
it is not proof every service is connected in every application. Provision optional services only when needed. Exact versions live
in package manifests and lockfiles, not this table.

| Part | Baseline | Use and verification |
|---|---|---|
| Source/work area | GitHub; Codespaces/devcontainer available | Every project needs a repo; local editor workspaces are also usable |
| App foundation | TypeScript, React/Vite, Express | Present in the reference; preserve an existing framework until migration is approved |
| Capabilities | tRPC and MCP over the same authorized core | Human and agent requests enforce the same permissions and business rules |
| Interface | shadcn/ui, Tailwind, CSS-variable themes | Follow the design contract, not a second design system |
| Secrets | Doppler | Required for credentials; isolate development, staging and production |
| Hosting | Railway | Verify the actual linked repository, environment and deployed revision |
| Identity | WorkOS AuthKit | For authenticated apps; verify real login and permissions before exposure |
| Data | Neon Postgres and Drizzle | When persistent data is needed; isolate environments and test recovery |
| Documents/images | Cloudflare R2 | When storing files; transfer directly with short-lived presigned grants |
| Video | Cloudflare Stream | Optional for video-heavy apps |
| Email | Resend | When sending email; verify sender and test safely before real recipients |
| Errors | Sentry | Verify SDK setup and a received safe test event, not just an account |
| In-app AI | Vercel AI SDK selected policy | Not installed in the current reference; implement and test only when needed |
| Knowledge/retrieval | Approved embeddings/search; pgvector when needed | Optional; define source ownership, permissions, freshness and evaluations |
| Voice/agent jobs | Supported provider/runtime per use case | Optional; define consent, tools, budget, human handoff and evaluations |

Read the [architecture](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/architecture.md),
[decisions](https://github.com/Norfolk-Group/norfolk-kit/tree/main/docs/decisions)
and [configuration map](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/config-and-env-map.md)
for implementation details and reasons.

## What each project must carry

- Owner, purpose, audience, data classification and explicit scope.
- A pinned baseline, or an honest record that adoption is still proposed.
- The shared agent contract, docs index and relevant architecture, API,
  security, business and design contracts.
- Project decisions and approved exceptions, with reasons and review conditions.
- Configuration key names only, service owners and environment mapping.
- Meaningful tests, blocking quality checks and a release/rollback path.
- A record of required, optional, configured and actually verified modules.

**Required is not installed; installed is not working.** Ask the agent to report
these states separately. Credentials belong in Doppler, not prompts, screenshots,
checked-in files or copied browser sessions.

## Cursor, Claude Code and Codex

All three should follow the same [AGENTS.md](https://github.com/Norfolk-Group/norfolk-kit/blob/main/AGENTS.md).
Do not maintain three versions of Norfolk policy.

| Editor | Rule entry point | What to verify |
|---|---|---|
| Cursor | Root AGENTS.md | Kit has Cursor MCP config; verify server access and loaded skills in Cursor |
| Claude Code | CLAUDE.md imports AGENTS.md | Verify declared plugins, marketplace trust, installation and loading |
| Codex | Root AGENTS.md | Verify Codex skills/plugins and MCP connections; Claude settings do not prove Codex setup |

Current plugin settings identify enabled plugins and a marketplace but contain
no immutable version pins. The contract's intended pinning is a setup gap, not
something already enforced. Do not invent a version field or vendor skill trees.

Compound Engineering owns definition, planning, implementation orchestration and
captured learnings. Superpowers supplies test-first work, debugging and verification.
Install supported upstream distributions by reference. Record source, resolved
version, license, permissions and editor-specific proof. If a required capability
is unavailable, report it and request an approved fallback; don't pretend another
editor's configuration installed it. Vendor skills are optional and task-specific.

Use the setup prompt below to ask what actually loaded. Official references:
[Codex instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md),
[Codex skills](https://learn.chatgpt.com/docs/build-skills),
[Claude imports](https://code.claude.com/docs/en/memory),
[Cursor rules](https://cursor.com/docs/rules). These links do not certify a local installation.

## The harness: from idea to improvement

A starter gives you initial files. The harness guides the whole job and requires
evidence before moving forward. It is not an autonomous production-release engine.

| Step | Ask for this result |
|---|---|
| Ideation | Clear user problem, useful outcome and what is out of scope |
| Context | Existing decisions, source evidence, data boundaries and constraints |
| Plan | One plan with acceptance examples, risks, dependencies and rollback |
| Implement | Small test-first changes using the approved tools and rules |
| Evaluate and test | Real test results plus representative AI, voice, knowledge or report evaluations |
| Review | Final diff review and a disposition for every relevant bot finding |
| Refactor and learn | Behavior-preserving improvements, regression tests and reusable lessons |
| Release or adopt | Approved revision, verified environment, rollback and explicit authority |

Failures return to diagnosis and implementation, then repeat evaluation and review.
Changed requirements return to context and planning. Scale the paperwork to the
risk; do not run two competing planning workflows.

The [harness guide](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/harness.md)
defines each handoff. The local command `pnpm harness:check --root [project-path]`
checks basic structure without modifying the project or running its scripts.
Its result is an assessment starting point, never proof of readiness or adoption.

## Agent names and roles

Use recognizable human names, with the role secondary: Gustavo · Analyst,
Rebecca · AI Co-Pilot. Keep names in one registry, preserve stable technical IDs,
and reuse the same labels in the interface and exports. Authorized display-name
changes must not alter permissions or routing. Existing approved names stay intact;
new shared names follow the Kit convention. Not every app needs a fleet of agents.

The [naming contract](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/agent-naming.md)
captures the H-Analytics persona-first pattern without changing that application.

## Start new projects safely

1. Describe the customer, users, sensitive data and first useful outcome.
2. Confirm destination organization and repository visibility.
3. Select minimum Kit modules and record the approved source revision.
4. Inspect payload sensitivity before copying. GitHub's template-copy operation
   does not enforce Kit filtering; don't indiscriminately copy company/client assets.
5. Provision needed services and isolated development credentials in Doppler.
6. Build one end-to-end feature, with equivalent human and agent permissions.
7. Verify gates and development behavior before requesting release approval.

The reference app's development test identity is not production authentication.
Verify WorkOS in the target environment before exposure. A repository, homepage
or passing build does not mean the product is secure and ready for customers.

## Adopt into existing projects without breakage

Begin read-only. Inventory architecture, data, authentication, exports, deployment,
integrations, custom rules and known defects. Preserve behavior and approved artifacts.

Classify each requirement as compliant, missing, conflicting, not applicable or
approved exception. Do not overwrite custom code because Kit has the same filename.

Existing files that Kit did not install remain project-owned, even when they
match Kit exactly. The planner labels these `foreign`; do not adopt ownership
silently. Manifest generation requires an explicit reviewed list of installed
files. Blind `--discover` is rejected. Stop on unresolved edits before generating
a replacement manifest, so local customizations do not become a false baseline.

Adopt in small changes: documentation and configuration visibility, compatible
tools/checks, then approved runtime/design changes. Each needs tests, a rollback
target and acceptance criteria. Production actions and data migrations need their
own authorization.

For reports, generate the new profile beside the approved version. Compare numbers
and appearance. Preserve URLs, storage keys and prior renderers until approved
cutover. Follow the [adoption contract](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/product-os-adoption.md).

## Design and financial reports

Screens and documents have different jobs. A dashboard theme must not silently
become the PDF, workbook or investor-report theme.

- Inter is the house face. Kit includes IBM Plex Sans Condensed and IBM Plex Mono
  for declared report roles; use the approved profile rather than arbitrary fonts.
- Statements default to monochrome, aligned numbers and readable type. Preserve
  signs, currency, units, decimals, periods and footnotes.
- Use restrained chart accents, generous padding and deliberate chart size. Keep
  legends readable; don't shrink statements until they merely fit.
- Map screen/report themes through versioned IDs, not guesses from color names.
- Declare PDF, HTML, XLSX, CSV, PNG, DOCX and PPTX separately when supported.
  Preserve numeric spreadsheet cells and document semantics.
- Check renderer/SDK/plugin support for fonts, embedding, pagination, tables,
  charts and accessibility. Fail clearly or record an approved fallback.
- Verify numbers, layout, clipping, fonts and provenance before accepting an export.
  A successful download is not a quality check.

Binding details: [export contract](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/export-output-contract.md)
and [design system](https://github.com/Norfolk-Group/norfolk-kit/blob/main/docs/design-system.md).
Product logos do not authorize recoloring financial tables.

## Quality, security and release

Require actual lint, typecheck, test and build results. Applicable CodeQL findings
must be clear of high/critical issues. Every installed review-bot comment needs
an explicit disposition. Bugbot and Greptile do not replace tests or certify
production security. Green means only the checks actually configured and run.

Confirm environment, commit and integration. Sentry must receive a safe test
event; Doppler access must be scoped; Railway must deploy the approved source.
Record backup/recovery evidence, cost ownership and incident contacts without
putting credentials in documentation.

Merge approval is not automatic permission for a production migration, DNS
change or customer email. Keep outward actions within the owner's scope.

## Update Norfolk standards

Start at Kit, not historical skills/manual repos. Read existing decisions, state
the problem and impact, then implement an approved, tested, reviewed change.

During consolidation, source still in the former Product OS needs an explicit
migration or linked reviewed change. Don't create a conflicting second policy
copy, rewrite signed artifacts or mark the proposed lock adopted without evidence.

After release, offer each app a versioned upgrade proposal. Never silently push
new standards into all projects. Preserve compatible exceptions and record actual adoption.

## Copy-paste prompts

Replace bracketed descriptions. These prompts do not grant unlimited access or
override the active project's rules.

### Check my editor setup

```text
Check this project's Norfolk setup without changing files or external systems.
Read AGENTS.md and the docs index. Tell me which rules, skills, plugins and MCP
connections this editor actually loaded, with sources and resolved versions.
Compare with Norfolk-Group/norfolk-kit. Distinguish required, declared, installed
and verified. Report missing capabilities and conflicting local instructions.
Never print secret values or extract browser tokens.
```

### Start a new project

```text
Use Norfolk-Group/norfolk-kit as my Product OS and Starter Kit entry point.
My project is [purpose], for [users], owned by [organization], with [data types].
The first useful outcome is [outcome]. Read the owner guide and current contracts.
Use the harness: ideation, context, one plan, implementation, evaluation/testing,
review, refactoring and release readiness. Show evidence and blockers at each gate.
Propose minimum modules, source version, visibility, service setup and tests.
Check payload sensitivity before copying source or brand assets. Flag unreleased
or proposed baselines honestly. Ask about material missing decisions. Do not
create external resources, publish, deploy or incur charges until approved.
```

### Assess an existing project

```text
Assess [repository] against Norfolk-Group/norfolk-kit. This is read-only.
Inventory architecture, rules, skills, services, security, CI, design and every
report/export path. Preserve application behavior and customer identity.
Give me a gap table: compliant, missing, conflicting, not applicable or approved
exception, with evidence. Propose small adoption steps with tests and rollback.
Do not edit, deploy, rename repositories or migrate data.
```

### Adopt safely

```text
Implement only [approved steps] in [repository], against [approved Kit version].
Use an isolated branch. Preserve customizations and report conflicts before
overwriting. Keep report URLs and renderers until side-by-side outputs are
approved. Run actual tests and provide rollback instructions. Separate completed,
blocked and unverified items. Do not expand into a framework rewrite, production
migration or changes to other repositories.
```

### Update a standard

```text
In Norfolk-Group/norfolk-kit, propose [standard change and reason]. Read current
contracts and decisions, including consolidation status. Identify affected tools,
editors, exports and consumers. Preserve historical decisions; document the new
decision and compatibility strategy. Implement after approval, verify and prepare
a release/adoption proposal. Do not auto-update apps or fabricate a signed release.
```

### Verify release readiness

```text
Check release readiness for [repository and revision] in [environment]. Verify
required CI, CodeQL policy, review findings and actual behavior. Distinguish a
passing build from verified authentication, permissions, monitoring and reports.
List blockers, exceptions and rollback evidence. Do not merge, deploy, migrate
data or contact customers unless those exact actions are already authorized.
```

## Keep a local copy

This Markdown file is the editable source. The generated HTML owner guide has
navigation, copyable prompts and print layout. Generate with `pnpm docs:owner`;
check freshness with `pnpm docs:owner:check`.

Keep a dated HTML/PDF snapshot in the existing Norfolk AI business folder's
Product/Kit area. Don't create another repository or edit snapshots as a second
source of truth. Regenerate after approved changes and retain the source digest.
A PDF also needs a recorded renderer/version and visual check; this guide does
not certify arbitrary browser print settings.

## What is still waiting for verification

Source backups of the old Product OS and Manual passed local restoration checks.
Hosting, external consumers and release identity still need verification before
either repository can be retired.

The old Product OS still specifies private signed releases. Public Kit publication
requires approval of the reviewed Norfolk-owned payload and trusted-release setup.
Private/client evidence stays excluded.

Fixtures prove planning, read-only assessment and Git recovery, not complete
installation or release. Cursor, Claude Code and Codex still need actual session
evidence of required plugin loading; caches and enabled IDs are not proof.
