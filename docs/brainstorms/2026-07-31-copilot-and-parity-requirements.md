---
date: 2026-07-31
topic: copilot-and-parity
status: captured — architectural constraint accepted, implementation not designed
---

# The copilot, and the parity constraint underneath it

## Why this document is different

The pre-built modules captured earlier today ([R21–R25](2026-07-31-prebuilt-app-modules-requirements.md)) are features — they can wait for their own plan without affecting anything built before them.

**This one cannot wait**, and it is important to be clear about why.

Ricardo's requirement is that the copilot has *full parity* with the app: anything the user can do by clicking, the copilot can do by being asked. Parity is not a feature you add. It is a property of how every capability is built, and it is **only cheap if it is decided first**.

Build a screen that calls the database directly, and the copilot cannot use it. Bolt agent access on afterwards and you get two implementations of every capability that drift apart — the UI does one thing, the agent does something subtly different, and every bug has to be fixed twice. Retrofitting parity onto an app built without it is close to a rewrite.

So this document records a constraint that binds from the next line of code onward, not a backlog item.

## Captured verbatim, 2026-07-31

> "Every project will also use agents and one will be a copilot that will live on the right side of the screen on a collapseable column where the chat and conversations will happen. I aim at ultra rich conversations with animations (animated icons, spinners), graphs (bar charts, info charts), and full parity to the rest of the app as if the user could do whatever they need just talking to the copilot who would do the rest. For example, the copilot could accept files uploaded or dropped by the user and process, store and use them as intended. The copilot could cause the menus and rest of the screen to change as if clicked by the user and so on, export files and reports, send emails, check emails, receive sms, send RCS and so on.... all in the future. something like cloudflare worker and Vercel SDK should be in our tech stack as well as Claude Managed Agent SDK, Cursor dev agents, and other types of agents on the server side to avoid us having to create the hard coding and be able to focus on functionality and UX."

## Requirements

- **R26 — Parity is the architecture.** Every capability is implemented once, as a callable procedure, and exposed identically to the UI and to the copilot. Neither is privileged. A screen that reaches past this layer is a defect, not a shortcut.
- **R27 — Copilot surface.** A collapsible right-hand column. Chat and conversation history live there.
- **R28 — Rich conversation.** Not a text box. Animated icons and spinners for work in progress; bar charts and info graphics rendered *in* the conversation, not linked out of it.
- **R29 — Files in.** Upload or drag-and-drop into the conversation; the copilot processes, stores, and uses them for the intended purpose.
- **R30 — The copilot drives the app.** It can change the menu and the rest of the screen as though the user had clicked. The chat is a control surface, not a side panel.
- **R31 — Outbound and inbound comms.** Export files and reports; send email; *check* email; receive SMS; send RCS. Explicitly "all in the future" — sequencing matters, the parity layer does not.
- **R32 — Buy the agent runtime, don't hand-code it.** Use existing agent infrastructure so effort goes to functionality and UX rather than plumbing.

## The constraint, stated concretely

Ricardo's own words for it, 2026-07-31 — the plain-English version, and the one to remember:

> **"We should always attempt to create once and use many."**

He offered that having said he would not understand *how* an API gets built, which is the point: the rule is a product principle, not a technical one. He does not need the mechanism. He does need the rule to hold, because it is the thing that decides whether the copilot can ever do what he wants it to do.

The technical statement of the same rule:

> **No UI component talks to the database, the filesystem, or an external service directly. It calls a procedure. The copilot calls the same procedure.**

"Create once" is the procedure. "Use many" is every caller — the screen, the copilot, a scheduled report, another app, and whatever exists in two years. Build it twice and you have two behaviours, one of which is wrong and nobody knows which.

This is already half-present in the settled stack — tRPC 11 is exactly this layer, and the buildout plan already carries "agent-native parity" as a review dimension. R26 promotes it from a nice property to the load-bearing rule.

R30 is the part that needs genuine design and is easy to get wrong. "The copilot changes the screen" is not a tool the *server* can run — navigation happens in the browser. It needs a client-side tool-execution path, so that some tools resolve on the server (query the database, send an email) and others resolve in the browser (navigate, open a modal, focus a field). Both must be described to the model in the same tool list, or the copilot will not know what it can do.

## Scope boundaries

- **Not in the current buildout plan.** The plan is the freeze line. What changes today is that R26 becomes binding on the Manual app and everything after it — the *constraint* applies immediately; the *copilot* is later work.
- R31's comms are explicitly future. Do not build inbound SMS before there is an app that needs it.

## Key decisions

- **Parity accepted as an architectural constraint, effective immediately.** Cheap to hold from the start, close to a rewrite to retrofit.

- **shadcn/ui is the component base for the copilot panel.** Ricardo, 2026-07-31: *"shadcn has wonderful primitives for a lot of that."* Already settled in the stack and already wired as an MCP server, so this is confirmation rather than a new choice. Relevant primitives exist for most of the panel: collapsible/resizable for the column itself, scroll area, sheet, command, dialog, progress, skeleton, and a charts layer for R28's in-conversation graphs.

  What shadcn does **not** give us, and therefore what actually needs designing: the streaming message list, tool-call state as it resolves in front of the user, and the animated in-progress states Ricardo is after. Those are the character of the thing. The primitives are the floor, not the design.

- **Design reference: Cloudflare's dashboard assistant.** Ricardo, 2026-07-31: *"My favorite copilot is the one in cloudflare that helps the users. Super cool design with proper animations."*

  Recorded as the reference to study before designing. **Not yet examined** — it sits behind a Cloudflare login, so nobody has actually looked at it as of this writing. A screenshot or short screen recording from Ricardo would pin the target far better than a written guess at what he likes about it; the specific qualities worth extracting are how it animates work-in-progress, how it occupies the panel, and how it shows what it is doing rather than just what it has said.

## Outstanding questions

### Resolve before planning

- **[Affects R32][Business ruling] Cloudflare Workers conflicts with a standing decision.** Decision [0005](../decisions/0005-railway-alone.md) settled on *Railway alone* — one host, deliberately, to stop infrastructure sprawl. Adding Workers reopens that. Cloudflare is already in the stack for R2 storage, so it is not a new vendor, but it would be a second *place code runs*. This needs Ricardo's ruling, framed in business terms, once the research below is in. It should not be adopted merely because it was named.
- **[Affects R26][Product] How strict is parity?** Some actions are genuinely user-only for good reason — approving a payment, accepting a legal document, deleting an account. Is parity "the copilot can do everything", or "the copilot can do everything except a named list requiring a human hand"? Recommendation: the latter, with the exception list written down rather than discovered.

### Deferred to planning

- [Affects R30][Technical] Client-side tool execution: how browser-resident tools are registered, described to the model, and kept in sync with the server tool list.
- [Affects R28][Technical] Rendering components into the conversation stream — provider support and the security boundary around model-chosen UI.
- [Affects R31][Needs research] RCS availability and provider support; inbound email provider (Resend is send-only as far as currently known — to be verified).
- [Affects R32][Needs research] Exact current names and fit of Anthropic's agent products, and what Cursor offers programmatically. **Research in flight 2026-07-31; this section to be replaced with verified findings.**

## Next steps

Fold R26 into the Manual app's architecture from its first commit — it is the first app built after this decision and therefore the proof. Everything else here gets its own brainstorm once the buildout plan reaches a pause.
