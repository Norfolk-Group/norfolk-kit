# claude-qwen.ps1 — Claude Code on Qwen via DashScope's US-region Anthropic endpoint
# (DIRECT: newest Qwen models day-0; the account key is US-region).
#
# GLM-parity upgrade (2026-07-24, mirroring claude-qwen.sh): maps qwen3.8-max into
# the Opus/Sonnet/Fable slots and qwen3.7-plus into Haiku, each with the
# name/description/capability metadata Claude Code's model UI reads; subagents route to
# qwen3.7-plus (cheaper tier) via $LauncherSubagentModel; plus the
# context/auto-compact/timeout/MCP/bash tuning profile mirrored from the validated GLM
# launcher. Slot capabilities declare "thinking" only — DashScope's effort-param
# support is unverified; CLAUDE_CODE_ALWAYS_ENABLE_EFFORT keeps the effort UI active,
# and a live run is the test of whether --effort sticks.
#
# Usage:  .\claude-qwen.ps1        |  $env:QWEN_MODEL='qwen3-coder-plus'; .\claude-qwen.ps1
# Windows twin of the .sh wrapper — DEV TOOLING ONLY (CLAUDE.md par.1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-qwen.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = 'DASHSCOPE_API_KEY'
# US-region Anthropic endpoint — the account's key region (Alibaba: "the API key must
# match the selected region"; probed 2026-07-24: US answers 200 for qwen3.8-max /
# qwen3.7-plus / qwen3-coder-plus, intl 403s the newer models). NOTE: the Doppler
# DASHSCOPE_BASE_URL is the OpenAI-style /compatible-mode path — wrong protocol for
# Claude Code — so it is deliberately NOT used.
$LauncherBaseUrl = if ($env:QWEN_BASE_URL) { $env:QWEN_BASE_URL } else { 'https://dashscope-us.aliyuncs.com/apps/anthropic' }
$LauncherPrimary = if ($env:QWEN_MODEL) { $env:QWEN_MODEL } else { 'qwen3.8-max' }
$LauncherFast    = if ($env:QWEN_FAST_MODEL) { $env:QWEN_FAST_MODEL } else { 'qwen3.7-plus' }
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
$LauncherSkipModelAlias = $true
# Subagents on the cheaper tier (capability/latency/cost balance).
$LauncherSubagentModel = if ($env:QWEN_SUBAGENT_MODEL) { $env:QWEN_SUBAGENT_MODEL } else { 'qwen3.7-plus' }

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot name/description/capability
# metadata — the shared lib only sets the bare Opus/Sonnet/Haiku model IDs, so Qwen adds the rest.
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:QWEN_FABLE_MODEL) { $env:QWEN_FABLE_MODEL } else { 'qwen3.8-max' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'Qwen 3.8 Max (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'ModelStudio Qwen compatibility mapping; this is not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'Qwen 3.8 Max (US)'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary Qwen model for complex coding, architecture, and long-running tasks'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'Qwen 3.8 Max (US, Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Qwen primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Qwen 3.7 Plus (Fast slot)'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Balanced lower-cost Qwen model for searches, summaries, and lightweight coding'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

# Context + reasoning tuning (CLAUDE_CODE_MAX_CONTEXT_TOKENS verified present in the
# installed Claude Code binary, 2026-07-24; 983616 is about the Qwen 1M window minus
# output headroom, per the reviewed suggestion).
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:QWEN_ALWAYS_ENABLE_EFFORT) { $env:QWEN_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_MAX_CONTEXT_TOKENS = if ($env:QWEN_MAX_CONTEXT_TOKENS) { $env:QWEN_MAX_CONTEXT_TOKENS } else { '983616' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:QWEN_AUTO_COMPACT_WINDOW) { $env:QWEN_AUTO_COMPACT_WINDOW } else { '983616' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:QWEN_AUTOCOMPACT_PCT_OVERRIDE) { $env:QWEN_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:QWEN_DISABLE_NONESSENTIAL_TRAFFIC) { $env:QWEN_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

# Model requests: 50-minute ceiling with idle-stream protection.
$env:API_TIMEOUT_MS = if ($env:QWEN_API_TIMEOUT_MS) { $env:QWEN_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:QWEN_API_FORCE_IDLE_TIMEOUT) { $env:QWEN_API_FORCE_IDLE_TIMEOUT } else { '1' }

# Shell commands: five-minute default, 30-minute maximum.
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:QWEN_BASH_DEFAULT_TIMEOUT_MS) { $env:QWEN_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:QWEN_BASH_MAX_TIMEOUT_MS) { $env:QWEN_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:QWEN_BASH_MAX_OUTPUT_LENGTH) { $env:QWEN_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

# MCP startup, execution, idle, and output limits.
$env:MCP_CONNECTION_NONBLOCKING = if ($env:QWEN_MCP_CONNECTION_NONBLOCKING) { $env:QWEN_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:QWEN_MCP_CONNECT_TIMEOUT_MS) { $env:QWEN_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:QWEN_MCP_TIMEOUT) { $env:QWEN_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:QWEN_MCP_TOOL_TIMEOUT) { $env:QWEN_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:QWEN_MCP_TOOL_IDLE_TIMEOUT) { $env:QWEN_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:QWEN_MAX_MCP_OUTPUT_TOKENS) { $env:QWEN_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

# Subagent result limit.
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:QWEN_TASK_MAX_OUTPUT_LENGTH) { $env:QWEN_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'max', '--permission-mode', 'plan') + $args)
