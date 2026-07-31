#!/usr/bin/env bash
# claude-deepseek.sh — Claude Code on DeepSeek via their Anthropic endpoint (DIRECT).
# The endpoint auto-maps claude-* tier names (opus→v4-pro, sonnet/haiku→v4-flash);
# we set the tiers explicitly so the choice is visible and overridable.
#
# GLM-parity upgrade (2026-07-24, from Ricardo's reviewed suggestion): maps
# deepseek-v4-pro into the Opus/Sonnet/Fable slots and deepseek-v4-flash into
# Haiku, with per-slot metadata; subagents route to Flash (cheaper tier); 1M
# auto-compact window; full fleet tuning profile. Probed 2026-07-24: the API's
# own error message names deepseek-v4-pro + deepseek-v4-flash as the ONLY
# supported slugs — the suggestion's "[1m]" suffix is tolerated (200) but
# normalized away, so the plain canonical slugs stay. Tool Search stays enabled
# (suggestion: DeepSeek handles it). Effort capabilities declared through max
# per the suggestion; a live run confirms effort actually sticks.
#
# Usage:  ./claude-deepseek.sh                              # deepseek-v4-pro
#         DEEPSEEK_MODEL=deepseek-v3.2 ./claude-deepseek.sh
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LAUNCHER_DIR/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-deepseek.sh"
LAUNCHER_KEY_VAR="DEEPSEEK_API_KEY"
LAUNCHER_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/anthropic}"
LAUNCHER_PRIMARY="${DEEPSEEK_MODEL:-deepseek-v4-pro}"
LAUNCHER_FAST="${DEEPSEEK_FAST_MODEL:-deepseek-v4-flash}"
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
LAUNCHER_SKIP_MODEL_ALIAS=1
# Subagents on the cheaper/faster tier (suggestion; matches the Qwen pattern).
LAUNCHER_SUBAGENT_MODEL="${DEEPSEEK_SUBAGENT_MODEL:-deepseek-v4-flash}"

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata — the shared
# lib only sets the bare Opus/Sonnet/Haiku model IDs, so DeepSeek adds the rest.
export ANTHROPIC_DEFAULT_FABLE_MODEL="${DEEPSEEK_FABLE_MODEL:-deepseek-v4-pro}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="DeepSeek V4 Pro (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="DeepSeek compatibility mapping; this is not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="DeepSeek V4 Pro"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary DeepSeek route for complex coding, architecture, and long-running tasks"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="DeepSeek V4 Pro (Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same DeepSeek primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="DeepSeek V4 Flash"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Faster lower-cost DeepSeek model for searches, summaries, and lightweight coding"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

# Context + reasoning tuning — V4 Pro and Flash carry 1M-token windows per the
# reviewed suggestion (unverifiable client-side; matches the GLM profile).
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${DEEPSEEK_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_EFFORT_LEVEL="${DEEPSEEK_EFFORT_LEVEL:-max}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${DEEPSEEK_AUTO_COMPACT_WINDOW:-1000000}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${DEEPSEEK_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${DEEPSEEK_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

# Model requests: 50-minute ceiling with idle-stream protection.
export API_TIMEOUT_MS="${DEEPSEEK_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${DEEPSEEK_API_FORCE_IDLE_TIMEOUT:-1}"

# Shell commands: five-minute default, 30-minute maximum.
export BASH_DEFAULT_TIMEOUT_MS="${DEEPSEEK_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${DEEPSEEK_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${DEEPSEEK_BASH_MAX_OUTPUT_LENGTH:-50000}"

# MCP startup, execution, idle, and output limits.
export MCP_CONNECTION_NONBLOCKING="${DEEPSEEK_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${DEEPSEEK_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${DEEPSEEK_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${DEEPSEEK_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${DEEPSEEK_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${DEEPSEEK_MAX_MCP_OUTPUT_TOKENS:-15000}"

# Subagent result limit.
export TASK_MAX_OUTPUT_LENGTH="${DEEPSEEK_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort max --permission-mode plan "$@"
