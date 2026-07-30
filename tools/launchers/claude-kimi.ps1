# claude-kimi.ps1 — Claude Code on Kimi via Moonshot's Anthropic endpoint (DIRECT).
# Falls back to KIMI_BASE_URL override if Moonshot moves the path.
#
# GLM-parity upgrade (2026-07-24, from Ricardo's reviewed suggestion): maps kimi-k3
# into the Opus/Sonnet/Fable slots and kimi-k2.7-code into Haiku, with per-slot
# metadata; disables Tool Search (unsupported by Kimi per the reviewed suggestion;
# ENABLE_TOOL_SEARCH verified present in the Claude Code binary) plus the
# auto-compact/timeout/MCP/bash tuning profile mirrored from the validated GLM
# launcher. NOTE: the suggestion's `kimi-k3[1m]` slug was probed 2026-07-24 and the
# endpoint 404s it — kimi-k3 and kimi-k2.7-code both answer 200 and stay the
# validated slugs. Slot capabilities declare "thinking" only — Moonshot's
# effort-param support is unverified; a live run tells whether --effort sticks.
#
# Usage:  .\claude-kimi.ps1        |  $env:KIMI_MODEL='kimi-k2.7-code'; .\claude-kimi.ps1
# Windows twin of the .sh wrapper — DEV TOOLING ONLY (CLAUDE.md par.1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-kimi.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = 'MOONSHOT_API_KEY'
$LauncherBaseUrl = if ($env:KIMI_BASE_URL) { $env:KIMI_BASE_URL } else { 'https://api.moonshot.ai/anthropic' }
# Account probe 2026-07-24: the Anthropic endpoint serves exactly kimi-k3 +
# kimi-k2.7-code (no turbo variants, no [1m] suffix).
$LauncherPrimary = if ($env:KIMI_MODEL) { $env:KIMI_MODEL } else { 'kimi-k3' }
$LauncherFast    = if ($env:KIMI_FAST_MODEL) { $env:KIMI_FAST_MODEL } else { 'kimi-k2.7-code' }
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
$LauncherSkipModelAlias = $true

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot name/description/capability
# metadata — the shared lib only sets the bare Opus/Sonnet/Haiku model IDs, so Kimi adds the rest.
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:KIMI_FABLE_MODEL) { $env:KIMI_FABLE_MODEL } else { 'kimi-k3' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'Kimi K3 (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'Moonshot Kimi compatibility mapping; this is not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'Kimi K3'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary Kimi model for complex coding, architecture, and long-running tasks'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'Kimi K3 (Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Kimi primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Kimi K2.7 Code (Fast slot)'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Faster lower-cost Kimi model for searches, summaries, and lightweight coding'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

# Kimi does not currently support Claude Code Tool Search (reviewed suggestion).
$env:ENABLE_TOOL_SEARCH = if ($env:KIMI_ENABLE_TOOL_SEARCH) { $env:KIMI_ENABLE_TOOL_SEARCH } else { 'false' }

# Context + reasoning tuning — K3 is a 1,048,576-token context model.
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:KIMI_ALWAYS_ENABLE_EFFORT) { $env:KIMI_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:KIMI_AUTO_COMPACT_WINDOW) { $env:KIMI_AUTO_COMPACT_WINDOW } else { '1048576' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:KIMI_AUTOCOMPACT_PCT_OVERRIDE) { $env:KIMI_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:KIMI_DISABLE_NONESSENTIAL_TRAFFIC) { $env:KIMI_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

# Model requests: 50-minute ceiling with idle-stream protection.
$env:API_TIMEOUT_MS = if ($env:KIMI_API_TIMEOUT_MS) { $env:KIMI_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:KIMI_API_FORCE_IDLE_TIMEOUT) { $env:KIMI_API_FORCE_IDLE_TIMEOUT } else { '1' }

# Shell commands: five-minute default, 30-minute maximum.
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:KIMI_BASH_DEFAULT_TIMEOUT_MS) { $env:KIMI_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:KIMI_BASH_MAX_TIMEOUT_MS) { $env:KIMI_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:KIMI_BASH_MAX_OUTPUT_LENGTH) { $env:KIMI_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

# MCP startup, execution, idle, and output limits.
$env:MCP_CONNECTION_NONBLOCKING = if ($env:KIMI_MCP_CONNECTION_NONBLOCKING) { $env:KIMI_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:KIMI_MCP_CONNECT_TIMEOUT_MS) { $env:KIMI_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:KIMI_MCP_TIMEOUT) { $env:KIMI_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:KIMI_MCP_TOOL_TIMEOUT) { $env:KIMI_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:KIMI_MCP_TOOL_IDLE_TIMEOUT) { $env:KIMI_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:KIMI_MAX_MCP_OUTPUT_TOKENS) { $env:KIMI_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

# Subagent result limit.
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:KIMI_TASK_MAX_OUTPUT_LENGTH) { $env:KIMI_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'max', '--permission-mode', 'plan') + $args)
