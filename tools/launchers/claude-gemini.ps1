# claude-gemini.ps1 — Claude Code on Google Gemini via OpenRouter (Anthropic skin).
# Windows twin of claude-gemini.sh — see that file's header for the verified
# model registry (probed 2026-07-31: google/gemini-3.6-flash flagship, 1M ctx).
# DEV TOOLING ONLY (AGENTS.md §1); see claude-launcher-lib.ps1.

$ErrorActionPreference = 'Stop'
$LauncherName = 'claude-gemini.ps1'
. (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'claude-launcher-lib.ps1')

$LauncherKeyVar  = if ($env:GEMINI_KEY_VAR) { $env:GEMINI_KEY_VAR } else { 'OPENROUTER_API_KEY' }
$LauncherBaseUrl = if ($env:GEMINI_BASE_URL) { $env:GEMINI_BASE_URL } else { 'https://openrouter.ai/api' }
$LauncherPrimary = if ($env:GEMINI_MODEL) { $env:GEMINI_MODEL } else { 'google/gemini-3.6-flash' }
$LauncherFast    = if ($env:GEMINI_FAST_MODEL) { $env:GEMINI_FAST_MODEL } else { 'google/gemini-3.5-flash-lite' }
$LauncherSkipModelAlias = $true
$LauncherSubagentModel = if ($env:GEMINI_SUBAGENT_MODEL) { $env:GEMINI_SUBAGENT_MODEL } else { 'google/gemini-3.5-flash-lite' }

$env:ANTHROPIC_DEFAULT_FABLE_MODEL = if ($env:GEMINI_FABLE_MODEL) { $env:GEMINI_FABLE_MODEL } else { 'google/gemini-3.6-flash' }
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_NAME = 'Gemini 3.6 Flash (Fable slot)'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION = 'Gemini via OpenRouter Anthropic skin - not Anthropic Fable'
$env:ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_NAME = 'Gemini 3.6 Flash'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION = 'Primary Gemini for coding and agentic work (1M context)'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_NAME = 'Gemini 3.6 Flash (Sonnet slot)'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION = 'Same Gemini primary through the Sonnet compatibility slot'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES = 'thinking'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME = 'Gemini 3.5 Flash Lite (Fast slot)'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION = 'Cheaper Gemini for searches, summaries, lightweight edits'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES = 'thinking'

$env:ENABLE_TOOL_SEARCH = if ($env:GEMINI_ENABLE_TOOL_SEARCH) { $env:GEMINI_ENABLE_TOOL_SEARCH } else { 'false' }
$env:CLAUDE_CODE_ALWAYS_ENABLE_EFFORT = if ($env:GEMINI_ALWAYS_ENABLE_EFFORT) { $env:GEMINI_ALWAYS_ENABLE_EFFORT } else { '1' }
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = if ($env:GEMINI_AUTO_COMPACT_WINDOW) { $env:GEMINI_AUTO_COMPACT_WINDOW } else { '1000000' }
$env:CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = if ($env:GEMINI_AUTOCOMPACT_PCT_OVERRIDE) { $env:GEMINI_AUTOCOMPACT_PCT_OVERRIDE } else { '80' }
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = if ($env:GEMINI_DISABLE_NONESSENTIAL_TRAFFIC) { $env:GEMINI_DISABLE_NONESSENTIAL_TRAFFIC } else { '1' }
$env:API_TIMEOUT_MS = if ($env:GEMINI_API_TIMEOUT_MS) { $env:GEMINI_API_TIMEOUT_MS } else { '3000000' }
$env:API_FORCE_IDLE_TIMEOUT = if ($env:GEMINI_API_FORCE_IDLE_TIMEOUT) { $env:GEMINI_API_FORCE_IDLE_TIMEOUT } else { '1' }
$env:BASH_DEFAULT_TIMEOUT_MS = if ($env:GEMINI_BASH_DEFAULT_TIMEOUT_MS) { $env:GEMINI_BASH_DEFAULT_TIMEOUT_MS } else { '300000' }
$env:BASH_MAX_TIMEOUT_MS = if ($env:GEMINI_BASH_MAX_TIMEOUT_MS) { $env:GEMINI_BASH_MAX_TIMEOUT_MS } else { '1800000' }
$env:BASH_MAX_OUTPUT_LENGTH = if ($env:GEMINI_BASH_MAX_OUTPUT_LENGTH) { $env:GEMINI_BASH_MAX_OUTPUT_LENGTH } else { '50000' }
$env:MCP_CONNECTION_NONBLOCKING = if ($env:GEMINI_MCP_CONNECTION_NONBLOCKING) { $env:GEMINI_MCP_CONNECTION_NONBLOCKING } else { '1' }
$env:MCP_CONNECT_TIMEOUT_MS = if ($env:GEMINI_MCP_CONNECT_TIMEOUT_MS) { $env:GEMINI_MCP_CONNECT_TIMEOUT_MS } else { '15000' }
$env:MCP_TIMEOUT = if ($env:GEMINI_MCP_TIMEOUT) { $env:GEMINI_MCP_TIMEOUT } else { '60000' }
$env:MCP_TOOL_TIMEOUT = if ($env:GEMINI_MCP_TOOL_TIMEOUT) { $env:GEMINI_MCP_TOOL_TIMEOUT } else { '900000' }
$env:CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT = if ($env:GEMINI_MCP_TOOL_IDLE_TIMEOUT) { $env:GEMINI_MCP_TOOL_IDLE_TIMEOUT } else { '180000' }
$env:MAX_MCP_OUTPUT_TOKENS = if ($env:GEMINI_MAX_MCP_OUTPUT_TOKENS) { $env:GEMINI_MAX_MCP_OUTPUT_TOKENS } else { '15000' }
$env:TASK_MAX_OUTPUT_LENGTH = if ($env:GEMINI_TASK_MAX_OUTPUT_LENGTH) { $env:GEMINI_TASK_MAX_OUTPUT_LENGTH } else { '40000' }

Invoke-ClaudeLauncher -PassthroughArgs (@('--model', 'opus', '--effort', 'high', '--permission-mode', 'plan') + $args)
