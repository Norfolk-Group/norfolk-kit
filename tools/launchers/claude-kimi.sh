#!/usr/bin/env bash
# claude-kimi.sh — Claude Code on Kimi via Moonshot's Anthropic endpoint (DIRECT).
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
# Usage:  ./claude-kimi.sh                                  # kimi-k3
#         KIMI_MODEL=kimi-k2.7-code ./claude-kimi.sh
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LAUNCHER_DIR/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-kimi.sh"
LAUNCHER_KEY_VAR="MOONSHOT_API_KEY"
LAUNCHER_BASE_URL="${KIMI_BASE_URL:-https://api.moonshot.ai/anthropic}"
# Account probe 2026-07-24: the Anthropic endpoint serves exactly kimi-k3 +
# kimi-k2.7-code (no turbo variants, no [1m] suffix).
LAUNCHER_PRIMARY="${KIMI_MODEL:-kimi-k3}"
LAUNCHER_FAST="${KIMI_FAST_MODEL:-kimi-k2.7-code}"
# Unset ANTHROPIC_MODEL entirely (GLM's validated escape hatch) — rely on
# --model <tier> + the DEFAULT_*_MODEL slot maps.
LAUNCHER_SKIP_MODEL_ALIAS=1

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot metadata — the shared
# lib only sets the bare Opus/Sonnet/Haiku model IDs, so Kimi adds the rest.
export ANTHROPIC_DEFAULT_FABLE_MODEL="${KIMI_FABLE_MODEL:-kimi-k3}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="Kimi K3 (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="Moonshot Kimi compatibility mapping; this is not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="Kimi K3"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary Kimi model for complex coding, architecture, and long-running tasks"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="Kimi K3 (Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Kimi primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Kimi K2.7 Code (Fast slot)"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Faster lower-cost Kimi model for searches, summaries, and lightweight coding"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="thinking"

# Kimi does not currently support Claude Code Tool Search (reviewed suggestion).
export ENABLE_TOOL_SEARCH="${KIMI_ENABLE_TOOL_SEARCH:-false}"

# Context + reasoning tuning — K3 is a 1,048,576-token context model.
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${KIMI_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${KIMI_AUTO_COMPACT_WINDOW:-1048576}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${KIMI_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${KIMI_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

# Model requests: 50-minute ceiling with idle-stream protection.
export API_TIMEOUT_MS="${KIMI_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${KIMI_API_FORCE_IDLE_TIMEOUT:-1}"

# Shell commands: five-minute default, 30-minute maximum.
export BASH_DEFAULT_TIMEOUT_MS="${KIMI_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${KIMI_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${KIMI_BASH_MAX_OUTPUT_LENGTH:-50000}"

# MCP startup, execution, idle, and output limits.
export MCP_CONNECTION_NONBLOCKING="${KIMI_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${KIMI_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${KIMI_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${KIMI_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${KIMI_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${KIMI_MAX_MCP_OUTPUT_TOKENS:-15000}"

# Subagent result limit.
export TASK_MAX_OUTPUT_LENGTH="${KIMI_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort max --permission-mode plan "$@"
