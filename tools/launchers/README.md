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

`claude-launcher-lib.sh` / `.ps1` hold the shared logic — key validation, model-slot mapping, and the passthrough. Each launcher sets only what differs. Fix a shared bug in the lib, not in six copies.

## How the model slots work

These providers don't expose Anthropic's model names, so each launcher maps its models into the Opus / Sonnet / Haiku / Fable slots that Claude Code's UI reads. `--model opus` therefore selects that provider's strongest model, `--model haiku` its cheap fast one, and subagents route to the cheaper tier automatically.

Consequence worth knowing: the model picker will show provider names in Anthropic-shaped slots. That's a compatibility mapping, not the Anthropic model.

## Maintenance

Model slugs move, and a wrong slug fails as a 404 or a silent fallback. When a provider ships a new flagship:

1. Probe the endpoint for the exact slug before trusting a blog post or a changelog.
2. Update the launcher's `LAUNCHER_PRIMARY` / `LAUNCHER_FAST` and the slot metadata.
3. Note the probe date in the header comment, as the existing ones do.

Capability declarations (`thinking`, `effort`, …) are per-provider claims and are not always honoured. Where support is unverified, the header comment says so — leave that honesty in place rather than asserting a capability the endpoint may ignore.
