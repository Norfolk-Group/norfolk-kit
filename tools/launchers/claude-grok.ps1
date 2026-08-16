# claude-grok.ps1 — Claude Code with Grok as the brain. Windows twin of claude-grok.sh.
#
# Merges the OpenAI Grok-via-OpenRouter recipe (2026-07-24) with this fleet's
# proven slot-map launcher. Take / leave:
#
#   TAKE  — clear stale provider routing; AUTH_TOKEN-only key; SMALL_FAST_MODEL;
#           CLAUDE_CODE_EFFORT_LEVEL=high; Tool Search off; long timeouts;
#           plan mode; effort high (not max).
#   LEAVE — pin everything to grok-4.3 (outdated; flagship is 4.6).
#   LEAVE — raw --model x-ai/grok-* (CC 2.1.x rejects unknown slugs; use
#           --model opus + ANTHROPIC_DEFAULT_*_MODEL maps instead).
#   LEAVE — doppler run wrapper (claude-launcher-lib already resolves Doppler
#           → env → .env without wrapping the whole shell).
#
# Opinionated Grok defaults:
#   • Flagship on every slot — no silent Haiku downgrade to 4.3
#   • OpenRouter transport (xAI Anthropic-compat still partial for real CC traffic)
#   • Compact window matches Grok 4.6's 500K context
#   • Subagents stay on the primary
#
# Model registry verified against OpenRouter 2026-07-24: x-ai/grok-4.6 (500K ctx),
# x-ai/grok-4.3 (1M ctx), ~x-ai/grok-latest (routing alias → newest Grok, 500K).
# grok-4.20 does NOT exist (hallucinated in an earlier draft — removed).
#
# Usage (first arg may be a model shortcut; everything else forwards to claude):
#   .\claude-grok.ps1                           # x-ai/grok-4.6 (flagship)
#   .\claude-grok.ps1 4.3                       # x-ai/grok-4.3 (1M context)
#   .\claude-grok.ps1 latest                    # ~x-ai/grok-latest (routing alias)
#   .\claude-grok.ps1 x-ai/grok-4.6             # any full slug works too
#   $env:GROK_BUDGET='1'; .\claude-grok.ps1     # Haiku slot → grok-4.3
#   $env:GROK_BASE_URL='https://api.x.ai'; $env:GROK_KEY_VAR='XAI_API_KEY'; $env:GROK_MODEL='grok-4.5'; .\claude-grok.ps1
#
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-grok.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

# ── Transport ──────────────────────────────────────────────────────────────
$LauncherKeyVar  = if ($env:GROK_KEY_VAR) { $env:GROK_KEY_VAR } else { 'OPENROUTER_API_KEY' }
$LauncherBaseUrl = if ($env:GROK_BASE_URL) { $env:GROK_BASE_URL } else { 'https://openrouter.ai/api' }

# ── Model map ──────────────────────────────────────────────────────────────
$GrokFlagship   = 'x-ai/grok-4.6'
$GrokBudgetFast = 'x-ai/grok-4.3'
$GrokLatest     = '~x-ai/grok-latest'

# Positional model shortcut: first arg picks the primary (4.6 | 4.3 | latest |
# any x-ai/* or ~x-ai/* slug), then drops out of the args forwarded to claude.
$GrokModel = $env:GROK_MODEL
$GrokArgs  = @($args)
if ($GrokArgs.Count -ge 1) {
  $GrokFirstArg = [string]$GrokArgs[0]
  $GrokShortcut = $null
  if ($GrokFirstArg -eq '4.6') { $GrokShortcut = $GrokFlagship }
  elseif ($GrokFirstArg -eq '4.3') { $GrokShortcut = $GrokBudgetFast }
  elseif ($GrokFirstArg -eq 'latest') { $GrokShortcut = $GrokLatest }
  elseif ($GrokFirstArg -like 'x-ai/*' -or $GrokFirstArg -like '~x-ai/*') { $GrokShortcut = $GrokFirstArg }
  if ($GrokShortcut) {
    $GrokModel = $GrokShortcut
    $GrokArgs  = @($GrokArgs | Select-Object -Skip 1)
  }
}

if ($env:GROK_USE_LATEST -eq '1') {
  $GrokPrimary = if ($GrokModel) { $GrokModel } else { $GrokLatest }
} else {
  $GrokPrimary = if ($GrokModel) { $GrokModel } else { $GrokFlagship }
}

if ($env:GROK_FAST_MODEL) {
  $GrokFast = $env:GROK_FAST_MODEL
} elseif ($env:GROK_BUDGET -eq '1') {
  $GrokFast = $GrokBudgetFast
} elseif ($env:GROK_USE_LATEST -eq '1') {
  $GrokFast = $GrokLatest
} else {
  $GrokFast = $GrokPrimary
}

$GrokFable = if ($env:GROK_FABLE_MODEL) { $env:GROK_FABLE_MODEL } else { $GrokPrimary }

$LauncherPrimary = $GrokPrimary
$LauncherFast    = $GrokFast
$LauncherSkipModelAlias = $true
$LauncherSubagentModel = if ($env:GROK_SUBAGENT_MODEL) { $env:GROK_SUBAGENT_MODEL } else { $GrokPrimary }

# ── Slot metadata (Claude Code model UI) ───────────────────────────────────
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = $GrokFable
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'Grok Flagship (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'Grok via OpenRouter Anthropic skin — not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'effort,thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'Grok Flagship'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary Grok for architecture, long agentic runs, and hard coding'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'effort,thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'Grok Flagship (Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Grok primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'effort,thinking'

if ($GrokFast -eq $GrokBudgetFast) {
  $env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Grok 4.3 Budget'
  $env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Cheaper/faster Grok — opt-in via GROK_BUDGET=1 or GROK_FAST_MODEL'
} else {
  $env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Grok Flagship (Haiku slot)'
  $env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Same flagship Grok — no silent quality drop on the fast tier'
}
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'effort,thinking'

# ── Runtime tuning ─────────────────────────────────────────────────────────
$env:ENABLE_TOOL_SEARCH = if ($env:GROK_ENABLE_TOOL_SEARCH) { $env:GROK_ENABLE_TOOL_SEARCH } else { 'false' }

# Effort: high is Grok's ceiling (OpenAI recipe + live notes). Always-enable
# keeps the UI active; EFFORT_LEVEL seeds the session default.
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:GROK_ALWAYS_ENABLE_EFFORT) { $env:GROK_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_EFFORT_LEVEL = if ($env:GROK_EFFORT_LEVEL) { $env:GROK_EFFORT_LEVEL } else { 'high' }

# Context window auto-matches the chosen primary (registry-verified 2026-07-24:
# grok-4.6 and ~grok-latest = 500K, grok-4.3 = 1M). GROK_AUTO_COMPACT_WINDOW wins.
$GrokCtxDefault = if ($GrokPrimary -like '*grok-4.3*') { '1000000' } else { '500000' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:GROK_AUTO_COMPACT_WINDOW) { $env:GROK_AUTO_COMPACT_WINDOW } else { $GrokCtxDefault }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:GROK_AUTOCOMPACT_PCT_OVERRIDE) { $env:GROK_AUTOCOMPACT_PCT_OVERRIDE } else { '75' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:GROK_DISABLE_NONESSENTIAL_TRAFFIC) { $env:GROK_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

$env:API_TIMEOUT_MS = if ($env:GROK_API_TIMEOUT_MS) { $env:GROK_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:GROK_API_FORCE_IDLE_TIMEOUT) { $env:GROK_API_FORCE_IDLE_TIMEOUT } else { '1' }

$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:GROK_BASH_DEFAULT_TIMEOUT_MS) { $env:GROK_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:GROK_BASH_MAX_TIMEOUT_MS) { $env:GROK_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:GROK_BASH_MAX_OUTPUT_LENGTH) { $env:GROK_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

$env:MCP_CONNECTION_NONBLOCKING = if ($env:GROK_MCP_CONNECTION_NONBLOCKING) { $env:GROK_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:GROK_MCP_CONNECT_TIMEOUT_MS) { $env:GROK_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:GROK_MCP_TIMEOUT) { $env:GROK_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:GROK_MCP_TOOL_TIMEOUT) { $env:GROK_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:GROK_MCP_TOOL_IDLE_TIMEOUT) { $env:GROK_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:GROK_MAX_MCP_OUTPUT_TOKENS) { $env:GROK_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

$env:TASK_MAX_OUTPUT_LENGTH = if ($env:GROK_TASK_MAX_OUTPUT_LENGTH) { $env:GROK_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

# --model opus (tier) → maps to $LauncherPrimary via DEFAULT_OPUS_MODEL.
# Do not pass a raw OpenRouter slug as --model (CC rejects it).
Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'high', '--permission-mode', 'plan') + $GrokArgs)
