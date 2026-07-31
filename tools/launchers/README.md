# Alt-model launchers

Run Claude Code against a third-party model through that provider's Anthropic-compatible endpoint. Claude is the baseline; these are for cost control on bulk work and for second opinions.

**Dev tooling only.** Nothing in application code may depend on these. They exist to drive the editor, not to serve users.

## Use

Keys come from the environment — which means from Doppler, never from a file:

```bash
doppler run -- ./tools/launchers/claude-kimi.sh
doppler run -- ./tools/launchers/claude-glm.sh --model sonnet
```

In a Codespace the devcontainer already puts this directory on `PATH`, so `claude-kimi.sh` works from anywhere in the repo.

On Windows use the `.ps1` twin:

```powershell
doppler run -- .\tools\launchers\claude-kimi.ps1
```

## Providers

| Launcher | Provider | Doppler key | Endpoint |
|---|---|---|---|
| `claude-kimi` | Moonshot | `MOONSHOT_API_KEY` | `api.moonshot.ai/anthropic` |
| `claude-glm` | Zhipu / Z.AI | `ZAI_API_KEY` *(legacy: `ZHIPU_API_KEY`)* | `api.z.ai/api/anthropic` |
| `claude-qwen` | Alibaba DashScope | `DASHSCOPE_API_KEY` | `dashscope-us.aliyuncs.com/apps/anthropic` |
| `claude-deepseek` | DeepSeek | `DEEPSEEK_API_KEY` | `api.deepseek.com/anthropic` |
| `claude-grok` | OpenRouter | `OPENROUTER_API_KEY` | `openrouter.ai/api` |
| `claude-openai` | OpenRouter | `OPENROUTER_API_KEY` | `openrouter.ai/api` |
| `claude-gemini` | OpenRouter (Google) | `OPENROUTER_API_KEY` | `openrouter.ai/api` |
| `claude-llama` | OpenRouter (Meta) | `OPENROUTER_API_KEY` | `openrouter.ai/api` — second-opinion driver, see header note |

`claude-launcher-lib.sh` / `.ps1` hold the shared logic — key validation, model-slot mapping, and the passthrough. Each launcher sets only what differs. Fix a shared bug in the lib, not in six copies.

## How the model slots work

These providers don't expose Anthropic's model names, so each launcher maps its models into the Opus / Sonnet / Haiku / Fable slots that Claude Code's UI reads. `--model opus` therefore selects that provider's strongest model, `--model haiku` its cheap fast one, and subagents route to the cheaper tier automatically.

Consequence worth knowing: the model picker will show provider names in Anthropic-shaped slots. That's a compatibility mapping, not the Anthropic model.

## Keeping "opus" actually pointing at each provider's strongest model

A hardcoded `LAUNCHER_PRIMARY` slug is a snapshot, not a guarantee — providers ship new flagships every few months, and there is no way for Claude Code to ask a provider "give me your best model" at runtime. Two lines of defense, not one:

**1. Run the calibration check whenever you suspect drift, or on a regular cadence:**

```bash
doppler run -- node tools/launchers/check-models.mjs
```

This queries each provider's own `/models` endpoint directly (Moonshot, Z.AI, DashScope, DeepSeek, OpenRouter — the real listing endpoints, verified against each provider's docs, not assumed) and reports what it detects as the current flagship next to what's hardcoded in `CONFIGURED` at the top of the script. There is no universal signal across providers for "this is the flagship" — naming conventions differ (max/plus/air, k-numbers, version numbers) — so each provider gets its own documented heuristic in the script rather than one generic guess. DeepSeek's naming has no version signal at all, so that one always asks a human to confirm manually.

**2. When the check shows drift:**

1. Confirm the new slug actually works before trusting the list alone — hit the chat endpoint once, don't just trust `/models`.
2. Update the launcher's `LAUNCHER_PRIMARY` / `LAUNCHER_FAST` **and** the matching entry in `check-models.mjs`'s `CONFIGURED` map, in the same commit — the two are meant to be kept in sync, not just the launcher.
3. Note the probe date in the launcher's header comment, as the existing ones do.

Capability declarations (`thinking`, `effort`, …) are per-provider claims and are not always honoured. Where support is unverified, the header comment says so — leave that honesty in place rather than asserting a capability the endpoint may ignore.
