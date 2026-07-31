#!/usr/bin/env bash
# claude-qwen.sh — Claude Code on Qwen via DashScope's Anthropic endpoint (DIRECT:
# latest Qwen coder models land here day-0, before/without OpenRouter). Base URL is
# per-workspace (region + WorkspaceId) — resolved from Doppler DASHSCOPE_BASE_URL.
#
# GLM-parity upgrade (2026-07-24, from Ricardo's reviewed suggestion): maps
# qwen3.7-max-us into the Opus/Sonnet/Fable slots and qwen3.7-plus into Haiku,
# each with the name/description/capability metadata Claude Code's model UI reads;
# subagents route to qwen3.7-plus (cheaper tier) via LAUNCHER_SUBAGENT_MODEL; plus
# the context/auto-compact/timeout/MCP/bash tuning profile mirrored from the
# validated GLM launcher. Slot capabilities declare "thinking" only — DashScope's
# effort-param support is unverified; CLAUDE_CODE_ALWAYS_ENABLE_EFFORT keeps the
# effort UI active, and a live run is the test of whether --effort sticks.
#
# Usage:  ./claude-qwen.sh                                  # qwen3.7-max-us
#         ./claude-qwen.sh --model opus --effort max --permission-mode plan
#         QWEN_MODEL=qwen3-coder-plus ./claude-qwen.sh
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LAUNCHER_DIR/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-qwen.sh"
LAUNCHER_KEY_VAR="DASHSCOPE_API_KEY"
# US-region Anthropic endpoint — the account's key region (Alibaba: "the API key
# must match the selected region"; probed 2026-07-24: US answers 200 for
# qwen3.7-max-us / qwen3.7-plus / qwen3-coder-plus, intl 403s the newer models).
# NOTE: the Doppler DASHSCOPE_BASE_URL is the OpenAI-style /compatible-mode path —
# wrong protocol for Claude Code — so it is deliberately NOT used.
LAUNCHER_BASE_URL="${QWEN_BASE_URL:-https://dashscope-us.aliyuncs.com/apps/anthropic}"
LAUNCHER_PRIMARY="${QWEN_MODEL:-qwen3.7-max-us}"
LAUNCHER_FAST="${QWEN_FAST_MODEL:-qwen3.7-plus}"
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
LAUNCHER_SKIP_MODEL_ALIAS=1
# Subagents on the cheaper tier (capability/latency/cost balance).
LAUNCHER_SUBAGENT_MODEL="${QWEN_SUBAGENT_MODEL:-qwen3.7-plus}"

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata — the shared
# lib only sets the bare Opus/Sonnet/Haiku model IDs, so Qwen adds the rest.
export ANTHROPIC_DEFAULT_FABLE_MODEL="${QWEN_FABLE_MODEL:-qwen3.7-max-us}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="Qwen 3.7 Max (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="ModelStudio Qwen compatibility mapping; this is not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="Qwen 3.7 Max (US)"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary Qwen model for complex coding, architecture, and long-running tasks"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="Qwen 3.7 Max (US, Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Qwen primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Qwen 3.7 Plus (Fast slot)"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Balanced lower-cost Qwen model for searches, summaries, and lightweight coding"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="thinking"

# Context + reasoning tuning (CLAUDE_CODE_MAX_CONTEXT_TOKENS verified present in
# the installed Claude Code binary, 2026-07-24; 983616 ≈ Qwen 1M window minus
# output headroom, per the reviewed suggestion).
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${QWEN_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_MAX_CONTEXT_TOKENS="${QWEN_MAX_CONTEXT_TOKENS:-983616}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${QWEN_AUTO_COMPACT_WINDOW:-983616}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${QWEN_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${QWEN_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

# Model requests: 50-minute ceiling with idle-stream protection.
export API_TIMEOUT_MS="${QWEN_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${QWEN_API_FORCE_IDLE_TIMEOUT:-1}"

# Shell commands: five-minute default, 30-minute maximum.
export BASH_DEFAULT_TIMEOUT_MS="${QWEN_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${QWEN_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${QWEN_BASH_MAX_OUTPUT_LENGTH:-50000}"

# MCP startup, execution, idle, and output limits.
export MCP_CONNECTION_NONBLOCKING="${QWEN_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${QWEN_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${QWEN_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${QWEN_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${QWEN_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${QWEN_MAX_MCP_OUTPUT_TOKENS:-15000}"

# Subagent result limit.
export TASK_MAX_OUTPUT_LENGTH="${QWEN_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort max --permission-mode plan "$@"
