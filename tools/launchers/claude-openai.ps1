# claude-openai.ps1 — Claude Code on OpenAI GPT via OpenRouter (OpenAI publishes
# no Anthropic-compatible endpoint, so OpenRouter is the transport).
#
# GLM-parity upgrade (2026-07-24, mirroring claude-openai.sh): the first fleet
# launcher with a genuinely THREE-TIER model map — registry-verified against
# OpenRouter 2026-07-24 (all 1,050,000-token context):
#   Opus/Fable  → openai/gpt-5.6-sol-pro  (flagship, reasoning.mode=pro)
#   Sonnet + subagents → openai/gpt-5.6-terra (balanced)
#   Haiku       → openai/gpt-5.6-luna     (fast/economical)
# Also live in the registry: gpt-5.6-sol, gpt-5.6-terra-pro, gpt-5.6-luna-pro.
# Tool Search off (cross-provider compat); effort declared through max.
#
# Usage:  .\claude-openai.ps1      |  $env:OPENAI_MODEL='openai/gpt-5.6-terra'; .\claude-openai.ps1
# Windows twin of the .sh wrapper — DEV TOOLING ONLY (CLAUDE.md par.1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-openai.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = if ($env:OPENAI_KEY_VAR) { $env:OPENAI_KEY_VAR } else { 'OPENROUTER_API_KEY' }
$LauncherBaseUrl = if ($env:OPENAI_BASE_URL) { $env:OPENAI_BASE_URL } else { 'https://openrouter.ai/api' }
$LauncherPrimary = if ($env:OPENAI_MODEL) { $env:OPENAI_MODEL } else { 'openai/gpt-5.6-sol-pro' }
$LauncherFast    = if ($env:OPENAI_FAST_MODEL) { $env:OPENAI_FAST_MODEL } else { 'openai/gpt-5.6-luna' }
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
$LauncherSkipModelAlias = $true
# Three-tier map (reviewed suggestion): Sonnet slot and subagents both run the
# balanced middle tier via the lib's $LauncherSonnetModel / $LauncherSubagentModel.
$LauncherSonnetModel = if ($env:OPENAI_SONNET_MODEL) { $env:OPENAI_SONNET_MODEL } else { 'openai/gpt-5.6-terra' }
$LauncherSubagentModel = if ($env:OPENAI_SUBAGENT_MODEL) { $env:OPENAI_SUBAGENT_MODEL } else { 'openai/gpt-5.6-terra' }

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata.
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:OPENAI_FABLE_MODEL) { $env:OPENAI_FABLE_MODEL } else { 'openai/gpt-5.6-sol-pro' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'GPT-5.6 Sol Pro (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'OpenAI compatibility mapping; this is not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'GPT-5.6 Sol Pro'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Flagship OpenAI model for complex coding, architecture, and long-running tasks'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'GPT-5.6 Terra'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Balanced OpenAI model for implementation, review, and general repository work'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'GPT-5.6 Luna'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Fast OpenAI model for searches, summaries, and lightweight coding'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

# Cross-provider compatibility (reviewed suggestion).
$env:ENABLE_TOOL_SEARCH = if ($env:OPENAI_ENABLE_TOOL_SEARCH) { $env:OPENAI_ENABLE_TOOL_SEARCH } else { 'false' }

# Context + reasoning tuning — registry-verified 1,050,000-token contexts; 1M
# compact window leaves output headroom. Pro reasoning at max effort.
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:OPENAI_ALWAYS_ENABLE_EFFORT) { $env:OPENAI_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_EFFORT_LEVEL = if ($env:OPENAI_EFFORT_LEVEL) { $env:OPENAI_EFFORT_LEVEL } else { 'max' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:OPENAI_AUTO_COMPACT_WINDOW) { $env:OPENAI_AUTO_COMPACT_WINDOW } else { '1000000' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:OPENAI_AUTOCOMPACT_PCT_OVERRIDE) { $env:OPENAI_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:OPENAI_DISABLE_NONESSENTIAL_TRAFFIC) { $env:OPENAI_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

# Model requests: 50-minute ceiling with idle-stream protection.
$env:API_TIMEOUT_MS = if ($env:OPENAI_API_TIMEOUT_MS) { $env:OPENAI_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:OPENAI_API_FORCE_IDLE_TIMEOUT) { $env:OPENAI_API_FORCE_IDLE_TIMEOUT } else { '1' }

# Shell commands: five-minute default, 30-minute maximum.
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:OPENAI_BASH_DEFAULT_TIMEOUT_MS) { $env:OPENAI_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:OPENAI_BASH_MAX_TIMEOUT_MS) { $env:OPENAI_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:OPENAI_BASH_MAX_OUTPUT_LENGTH) { $env:OPENAI_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

# MCP startup, execution, idle, and output limits.
$env:MCP_CONNECTION_NONBLOCKING = if ($env:OPENAI_MCP_CONNECTION_NONBLOCKING) { $env:OPENAI_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:OPENAI_MCP_CONNECT_TIMEOUT_MS) { $env:OPENAI_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:OPENAI_MCP_TIMEOUT) { $env:OPENAI_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:OPENAI_MCP_TOOL_TIMEOUT) { $env:OPENAI_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:OPENAI_MCP_TOOL_IDLE_TIMEOUT) { $env:OPENAI_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:OPENAI_MAX_MCP_OUTPUT_TOKENS) { $env:OPENAI_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

# Subagent result limit.
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:OPENAI_TASK_MAX_OUTPUT_LENGTH) { $env:OPENAI_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'max', '--permission-mode', 'plan') + $args)
