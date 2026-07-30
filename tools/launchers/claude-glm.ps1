# claude-glm.ps1 — Claude Code on Zhipu GLM via Z.AI's Anthropic endpoint (DIRECT).
# Mirrors Ricardo's validated-working ad-hoc invocation (2026-07-24): maps GLM-5.2[1m] into
# the Opus/Sonnet slots (1M context) and GLM-5.2 into Claude Code 2.1.x's newer Fable slot,
# GLM-4.5-Air into Haiku — each with the name/description/capability metadata Claude Code's
# model UI reads — plus the auto-compact/timeout/MCP/bash tuning the 1M-context primary
# needs. Z.AI's Doppler secret is available under both ZAI_API_KEY (current) and
# ZHIPU_API_KEY (legacy) — this defaults to the former.
# Usage:  .\claude-glm.ps1         |  $env:GLM_MODEL='glm-4.7'; .\claude-glm.ps1
# Windows twin of the .sh wrapper — DEV TOOLING ONLY (CLAUDE.md par.1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-glm.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = if ($env:GLM_KEY_VAR) { $env:GLM_KEY_VAR } else { 'ZAI_API_KEY' }
$LauncherBaseUrl = 'https://api.z.ai/api/anthropic'
$LauncherPrimary = if ($env:GLM_MODEL) { $env:GLM_MODEL } else { 'glm-5.2[1m]' }
$LauncherFast    = if ($env:GLM_FAST_MODEL) { $env:GLM_FAST_MODEL } else { 'glm-4.5-air' }
$LauncherSkipModelAlias = $true

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot name/description/capability
# metadata — the shared lib only sets the bare Opus/Sonnet/Haiku model IDs.
$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:GLM_FABLE_MODEL) { $env:GLM_FABLE_MODEL } else { 'glm-5.2' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'GLM-5.2 Max (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'Z.AI GLM-5.2 compatibility mapping; this is not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking,adaptive_thinking'

$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'GLM-5.2 Max (1M)'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary GLM route for complex coding, architecture, and long-running tasks'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking,adaptive_thinking'

$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'GLM-5.2 Standard (1M)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Z.AI GLM-5.2 model through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'effort,xhigh_effort,max_effort,thinking,adaptive_thinking'

$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'GLM-4.5-Air Fast'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Faster lower-cost GLM model for searches, summaries, and lightweight coding'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

# Tuned for the 1M-token primary + long agentic runs (validated working, 2026-07-24).
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:GLM_ALWAYS_ENABLE_EFFORT) { $env:GLM_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:GLM_AUTO_COMPACT_WINDOW) { $env:GLM_AUTO_COMPACT_WINDOW } else { '1000000' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:GLM_AUTOCOMPACT_PCT_OVERRIDE) { $env:GLM_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:GLM_DISABLE_NONESSENTIAL_TRAFFIC) { $env:GLM_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }

$env:API_TIMEOUT_MS = if ($env:GLM_API_TIMEOUT_MS) { $env:GLM_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:GLM_API_FORCE_IDLE_TIMEOUT) { $env:GLM_API_FORCE_IDLE_TIMEOUT } else { '1' }

$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:GLM_BASH_DEFAULT_TIMEOUT_MS) { $env:GLM_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:GLM_BASH_MAX_TIMEOUT_MS) { $env:GLM_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:GLM_BASH_MAX_OUTPUT_LENGTH) { $env:GLM_BASH_MAX_OUTPUT_LENGTH } else { '50000' }

$env:MCP_CONNECTION_NONBLOCKING = if ($env:GLM_MCP_CONNECTION_NONBLOCKING) { $env:GLM_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:GLM_MCP_CONNECT_TIMEOUT_MS) { $env:GLM_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:GLM_MCP_TIMEOUT) { $env:GLM_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:GLM_MCP_TOOL_TIMEOUT) { $env:GLM_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:GLM_MCP_TOOL_IDLE_TIMEOUT) { $env:GLM_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:GLM_MAX_MCP_OUTPUT_TOKENS) { $env:GLM_MAX_MCP_OUTPUT_TOKENS } else { '15000' }

$env:TASK_MAX_OUTPUT_LENGTH = if ($env:GLM_TASK_MAX_OUTPUT_LENGTH) { $env:GLM_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'max', '--permission-mode', 'plan') + $args)
