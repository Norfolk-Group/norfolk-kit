# claude-deepseek.ps1 — Claude Code on DeepSeek via their Anthropic endpoint (DIRECT).
# The endpoint auto-maps claude-* tier names (opus→v4-pro, sonnet/haiku→v4-flash);
# we set the tiers explicitly so the choice is visible and overridable.
#
# GLM-parity upgrade (2026-07-24, mirroring claude-deepseek.sh): maps
# deepseek-v4-pro into the Opus/Sonnet/Fable slots and deepseek-v4-flash into
# Haiku, with per-slot metadata; subagents route to Flash (cheaper tier); 1M
# auto-compact window; full fleet tuning profile. Probed 2026-07-24: the API's
# own error message names deepseek-v4-pro + deepseek-v4-flash as the ONLY
# supported slugs — the suggestion's "[1m]" suffix is tolerated (200) but
# normalized away, so the plain canonical slugs stay. Tool Search stays enabled
# (suggestion: DeepSeek handles it). Effort capabilities declared through max
# per the suggestion; a live run confirms effort actually sticks.
#
# Usage:  .\claude-deepseek.ps1    |  $env:DEEPSEEK_MODEL='deepseek-v3.2'; .\claude-deepseek.ps1
# Windows twin of the .sh wrapper — DEV TOOLING ONLY (CLAUDE.md par.1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-deepseek.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = 'DEEPSEEK_API_KEY'
$LauncherBaseUrl = if ($env:DEEPSEEK_BASE_URL) { $env:DEEPSEEK_BASE_URL } else { 'https://api.deepseek.com/anthropic' }
$LauncherPrimary = if ($env:DEEPSEEK_MODEL) { $env:DEEPSEEK_MODEL } else { 'deepseek-v4-pro' }
$LauncherFast    = if ($env:DEEPSEEK_FAST_MODEL) { $env:DEEPSEEK_FAST_MODEL } else { 'deepseek-v4-flash' }
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
$LauncherSkipModelAlias = $true
# Subagents on the cheaper/faster tier (suggestion; matches the Qwen pattern).
$LauncherSubagentModel = if ($env:DEEPSEEK_SUBAGENT_MODEL) { $env:DEEPSEEK_SUBAGENT_MODEL } else { 'deepseek-v4-flash' }

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata — the shared
# lib only sets the bare Opus/Sonnet/Haiku model IDs, so DeepSeek adds the rest.
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:DEEPSEEK_FABLE_MODEL) { $env:DEEPSEEK_FABLE_MODEL } else { 'deepseek-v4-pro' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'DeepSeek V4 Pro (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'DeepSeek compatibility mapping; this is not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'DeepSeek V4 Pro'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary DeepSeek route for complex coding, architecture, and long-running tasks'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'DeepSeek V4 Pro (Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same DeepSeek primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'DeepSeek V4 Flash'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Faster lower-cost DeepSeek model for searches, summaries, and lightweight coding'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking'

# Context + reasoning tuning — V4 Pro and Flash carry 1M-token windows per the
# reviewed suggestion (unverifiable client-side; matches the GLM profile).
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:DEEPSEEK_ALWAYS_ENABLE_EFFORT) { $env:DEEPSEEK_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_EFFORT_LEVEL = if ($env:DEEPSEEK_EFFORT_LEVEL) { $env:DEEPSEEK_EFFORT_LEVEL } else { 'max' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:DEEPSEEK_AUTO_COMPACT_WINDOW) { $env:DEEPSEEK_AUTO_COMPACT_WINDOW } else { '1000000' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:DEEPSEEK_AUTOCOMPACT_PCT_OVERRIDE) { $env:DEEPSEEK_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:DEEPSEEK_DISABLE_NONESSENTIAL_TRAFFIC) { $env:DEEPSEEK_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

# Model requests: 50-minute ceiling with idle-stream protection.
$env:API_TIMEOUT_MS = if ($env:DEEPSEEK_API_TIMEOUT_MS) { $env:DEEPSEEK_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:DEEPSEEK_API_FORCE_IDLE_TIMEOUT) { $env:DEEPSEEK_API_FORCE_IDLE_TIMEOUT } else { '1' }

# Shell commands: five-minute default, 30-minute maximum.
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:DEEPSEEK_BASH_DEFAULT_TIMEOUT_MS) { $env:DEEPSEEK_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:DEEPSEEK_BASH_MAX_TIMEOUT_MS) { $env:DEEPSEEK_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:DEEPSEEK_BASH_MAX_OUTPUT_LENGTH) { $env:DEEPSEEK_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

# MCP startup, execution, idle, and output limits.
$env:MCP_CONNECTION_NONBLOCKING = if ($env:DEEPSEEK_MCP_CONNECTION_NONBLOCKING) { $env:DEEPSEEK_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:DEEPSEEK_MCP_CONNECT_TIMEOUT_MS) { $env:DEEPSEEK_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:DEEPSEEK_MCP_TIMEOUT) { $env:DEEPSEEK_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:DEEPSEEK_MCP_TOOL_TIMEOUT) { $env:DEEPSEEK_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:DEEPSEEK_MCP_TOOL_IDLE_TIMEOUT) { $env:DEEPSEEK_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:DEEPSEEK_MAX_MCP_OUTPUT_TOKENS) { $env:DEEPSEEK_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

# Subagent result limit.
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:DEEPSEEK_TASK_MAX_OUTPUT_LENGTH) { $env:DEEPSEEK_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'max', '--permission-mode', 'plan') + $args)
