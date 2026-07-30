#!/usr/bin/env bash
# claude-openai.sh — Claude Code on OpenAI GPT via OpenRouter (OpenAI publishes
# no Anthropic-compatible endpoint, so OpenRouter is the transport).
#
# GLM-parity upgrade (2026-07-24, from Ricardo's reviewed suggestion): the first
# fleet launcher with a genuinely THREE-TIER model map — registry-verified against
# OpenRouter 2026-07-24 (all 1,050,000-token context):
#   Opus/Fable  → openai/gpt-5.6-sol-pro  (flagship, reasoning.mode=pro)
#   Sonnet + subagents → openai/gpt-5.6-terra (balanced)
#   Haiku       → openai/gpt-5.6-luna     (fast/economical)
# Also live in the registry: gpt-5.6-sol, gpt-5.6-terra-pro, gpt-5.6-luna-pro.
# Tool Search off (cross-provider compat); effort declared through max.
#
# Usage:  ./claude-openai.sh                                # gpt-5.6-sol-pro
#         OPENAI_MODEL=openai/gpt-5.6-terra ./claude-openai.sh
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 || true
source "$(dirname "${BASH_SOURCE[0]}")/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-openai.sh"
LAUNCHER_KEY_VAR="${OPENAI_KEY_VAR:-OPENROUTER_API_KEY}"
LAUNCHER_BASE_URL="${OPENAI_BASE_URL:-https://openrouter.ai/api}"
LAUNCHER_PRIMARY="${OPENAI_MODEL:-openai/gpt-5.6-sol-pro}"
LAUNCHER_FAST="${OPENAI_FAST_MODEL:-openai/gpt-5.6-luna}"
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
LAUNCHER_SKIP_MODEL_ALIAS=1
# Three-tier map (reviewed suggestion): Sonnet slot and subagents both run the
# balanced middle tier via the lib's LAUNCHER_SONNET_MODEL / LAUNCHER_SUBAGENT_MODEL.
LAUNCHER_SONNET_MODEL="${OPENAI_SONNET_MODEL:-openai/gpt-5.6-terra}"
LAUNCHER_SUBAGENT_MODEL="${OPENAI_SUBAGENT_MODEL:-openai/gpt-5.6-terra}"

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata.
export ANTHROPIC_DEFAULT_FABLE_MODEL="${OPENAI_FABLE_MODEL:-openai/gpt-5.6-sol-pro}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="GPT-5.6 Sol Pro (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="OpenAI compatibility mapping; this is not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="GPT-5.6 Sol Pro"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Flagship OpenAI model for complex coding, architecture, and long-running tasks"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="GPT-5.6 Terra"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Balanced OpenAI model for implementation, review, and general repository work"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="GPT-5.6 Luna"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Fast OpenAI model for searches, summaries, and lightweight coding"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking"

# Cross-provider compatibility (reviewed suggestion).
export ENABLE_TOOL_SEARCH="${OPENAI_ENABLE_TOOL_SEARCH:-false}"

# Context + reasoning tuning — registry-verified 1,050,000-token contexts; 1M
# compact window leaves output headroom. Pro reasoning at max effort.
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${OPENAI_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_EFFORT_LEVEL="${OPENAI_EFFORT_LEVEL:-max}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${OPENAI_AUTO_COMPACT_WINDOW:-1000000}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${OPENAI_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${OPENAI_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

# Model requests: 50-minute ceiling with idle-stream protection.
export API_TIMEOUT_MS="${OPENAI_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${OPENAI_API_FORCE_IDLE_TIMEOUT:-1}"

# Shell commands: five-minute default, 30-minute maximum.
export BASH_DEFAULT_TIMEOUT_MS="${OPENAI_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${OPENAI_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${OPENAI_BASH_MAX_OUTPUT_LENGTH:-50000}"

# MCP startup, execution, idle, and output limits.
export MCP_CONNECTION_NONBLOCKING="${OPENAI_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${OPENAI_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${OPENAI_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${OPENAI_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${OPENAI_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${OPENAI_MAX_MCP_OUTPUT_TOKENS:-15000}"

# Subagent result limit.
export TASK_MAX_OUTPUT_LENGTH="${OPENAI_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort max --permission-mode plan "$@"
