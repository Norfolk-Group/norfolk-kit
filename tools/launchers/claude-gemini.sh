#!/usr/bin/env bash
# claude-gemini.sh — Claude Code on Google Gemini via OpenRouter (Anthropic skin).
#
# Registry verified against OpenRouter's live catalog 2026-07-31:
#   google/gemini-3.6-flash      1,048,576 ctx  ← newest flagship-tier text model
#   google/gemini-3.5-flash-lite 1,048,576 ctx  ← cheaper/faster
# No newer "pro" TEXT model was present at probe time (gemini-3-pro-image is
# image-only). If Google ships a pro-tier text model, update BOTH this default
# and check-models.mjs's CONFIGURED map in the same commit.
#
# Usage:
#   ./claude-gemini.sh                          # google/gemini-3.6-flash
#   GEMINI_MODEL=google/gemini-3.5-flash-lite ./claude-gemini.sh
#
# DEV TOOLING ONLY (AGENTS.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
# Resolve the launcher directory ONCE, before changing into it. Computing
# dirname "${BASH_SOURCE[0]}" a second time AFTER the cd re-resolves the
# original RELATIVE path against the new working directory, so running this
# from anywhere but tools/launchers looked for
# tools/launchers/tools/launchers/claude-launcher-lib.sh and failed.
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LAUNCHER_DIR/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-gemini.sh"
LAUNCHER_KEY_VAR="${GEMINI_KEY_VAR:-OPENROUTER_API_KEY}"
LAUNCHER_BASE_URL="${GEMINI_BASE_URL:-https://openrouter.ai/api}"
LAUNCHER_PRIMARY="${GEMINI_MODEL:-google/gemini-3.6-flash}"
LAUNCHER_FAST="${GEMINI_FAST_MODEL:-google/gemini-3.5-flash-lite}"
LAUNCHER_SKIP_MODEL_ALIAS=1
LAUNCHER_SUBAGENT_MODEL="${GEMINI_SUBAGENT_MODEL:-google/gemini-3.5-flash-lite}"

export ANTHROPIC_DEFAULT_FABLE_MODEL="${GEMINI_FABLE_MODEL:-google/gemini-3.6-flash}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="Gemini 3.6 Flash (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="Gemini via OpenRouter Anthropic skin — not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="Gemini 3.6 Flash"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary Gemini for coding and agentic work (1M context)"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="Gemini 3.6 Flash (Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Gemini primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Gemini 3.5 Flash Lite (Fast slot)"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Cheaper Gemini for searches, summaries, lightweight edits"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="thinking"

# Standard fleet tuning (mirrors the validated GLM/Kimi profile).
export ENABLE_TOOL_SEARCH="${GEMINI_ENABLE_TOOL_SEARCH:-false}"
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${GEMINI_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${GEMINI_AUTO_COMPACT_WINDOW:-1000000}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${GEMINI_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${GEMINI_DISABLE_NONESSENTIAL_TRAFFIC:-1}"
export API_TIMEOUT_MS="${GEMINI_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${GEMINI_API_FORCE_IDLE_TIMEOUT:-1}"
export BASH_DEFAULT_TIMEOUT_MS="${GEMINI_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${GEMINI_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${GEMINI_BASH_MAX_OUTPUT_LENGTH:-50000}"
export MCP_CONNECTION_NONBLOCKING="${GEMINI_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${GEMINI_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${GEMINI_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${GEMINI_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${GEMINI_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${GEMINI_MAX_MCP_OUTPUT_TOKENS:-15000}"
export TASK_MAX_OUTPUT_LENGTH="${GEMINI_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort high --permission-mode plan "$@"
