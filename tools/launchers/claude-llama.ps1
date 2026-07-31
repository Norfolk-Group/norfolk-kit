# claude-llama.ps1 — Claude Code on Meta Llama via OpenRouter (Anthropic skin).
# Windows twin of claude-llama.sh — see that file's header for the verified
# model registry (probed 2026-07-31: meta-llama/llama-4-maverick, ~1M ctx) and
# the honest posture note: second-opinion driver, not a daily one.
# DEV TOOLING ONLY (AGENTS.md §1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-llama.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = if ($env:LLAMA_KEY_VAR) { $env:LLAMA_KEY_VAR } else { 'OPENROUTER_API_KEY' }
$LauncherBaseUrl = if ($env:LLAMA_BASE_URL) { $env:LLAMA_BASE_URL } else { 'https://openrouter.ai/api' }
$LauncherPrimary = if ($env:LLAMA_MODEL) { $env:LLAMA_MODEL } else { 'meta-llama/llama-4-maverick' }
$LauncherFast    = if ($env:LLAMA_FAST_MODEL) { $env:LLAMA_FAST_MODEL } else { 'meta-llama/llama-3.3-70b-instruct' }
$LauncherSkipModelAlias = $true
$LauncherSubagentModel = if ($env:LLAMA_SUBAGENT_MODEL) { $env:LLAMA_SUBAGENT_MODEL } else { 'meta-llama/llama-3.3-70b-instruct' }

$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:LLAMA_FABLE_MODEL) { $env:LLAMA_FABLE_MODEL } else { 'meta-llama/llama-4-maverick' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'Llama 4 Maverick (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'Llama via OpenRouter Anthropic skin - not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'Llama 4 Maverick'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary Llama (1M context, multimodal) - second-opinion driver'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'Llama 4 Maverick (Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Llama primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Llama 3.3 70B (Fast slot)'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Efficient Llama for searches, summaries, lightweight edits'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ENABLE_TOOL_SEARCH = if ($env:LLAMA_ENABLE_TOOL_SEARCH) { $env:LLAMA_ENABLE_TOOL_SEARCH } else { 'false' }
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:LLAMA_ALWAYS_ENABLE_EFFORT) { $env:LLAMA_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:LLAMA_AUTO_COMPACT_WINDOW) { $env:LLAMA_AUTO_COMPACT_WINDOW } else { '1000000' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:LLAMA_AUTOCOMPACT_PCT_OVERRIDE) { $env:LLAMA_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:LLAMA_DISABLE_NONESSENTIAL_TRAFFIC) { $env:LLAMA_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }
$env:API_TIMEOUT_MS = if ($env:LLAMA_API_TIMEOUT_MS) { $env:LLAMA_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:LLAMA_API_FORCE_IDLE_TIMEOUT) { $env:LLAMA_API_FORCE_IDLE_TIMEOUT } else { '1' }
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:LLAMA_BASH_DEFAULT_TIMEOUT_MS) { $env:LLAMA_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:LLAMA_BASH_MAX_TIMEOUT_MS) { $env:LLAMA_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:LLAMA_BASH_MAX_OUTPUT_LENGTH) { $env:LLAMA_BASH_MAX_OUTPUT_LENGTH } else { '50000' }
$env:MCP_CONNECTION_NONBLOCKING = if ($env:LLAMA_MCP_CONNECTION_NONBLOCKING) { $env:LLAMA_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:LLAMA_MCP_CONNECT_TIMEOUT_MS) { $env:LLAMA_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:LLAMA_MCP_TIMEOUT) { $env:LLAMA_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:LLAMA_MCP_TOOL_TIMEOUT) { $env:LLAMA_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:LLAMA_MCP_TOOL_IDLE_TIMEOUT) { $env:LLAMA_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:LLAMA_MAX_MCP_OUTPUT_TOKENS) { $env:LLAMA_MAX_MCP_OUTPUT_TOKENS } else { '15000' }
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:LLAMA_TASK_MAX_OUTPUT_LENGTH) { $env:LLAMA_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'high', '--permission-mode', 'plan') + $args)
