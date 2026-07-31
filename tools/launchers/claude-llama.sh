#!/usr/bin/env bash
# claude-llama.sh — Claude Code on Meta Llama via OpenRouter (Anthropic skin).
#
# Registry verified against OpenRouter's provider page 2026-07-31:
#   meta-llama/llama-4-maverick        ~1.05M ctx  ← newest large (multimodal)
#   meta-llama/llama-3.3-70b-instruct    131K ctx  ← efficient classic instruct
#
# HONEST POSTURE: Llama's agentic tool-calling has historically trailed the
# other fleet drivers for long Claude Code sessions. Treat this launcher as a
# second-opinion / benchmark tool and an API-resource sanity check, not a
# daily driver — until a live run proves otherwise, then update this note.
#
# Usage:
#   ./claude-llama.sh                            # llama-4-maverick
#   LLAMA_MODEL=meta-llama/llama-3.3-70b-instruct ./claude-llama.sh
#
# DEV TOOLING ONLY (AGENTS.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 || true
source "$(dirname "${BASH_SOURCE[0]}")/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-llama.sh"
LAUNCHER_KEY_VAR="${LLAMA_KEY_VAR:-OPENROUTER_API_KEY}"
LAUNCHER_BASE_URL="${LLAMA_BASE_URL:-https://openrouter.ai/api}"
LAUNCHER_PRIMARY="${LLAMA_MODEL:-meta-llama/llama-4-maverick}"
LAUNCHER_FAST="${LLAMA_FAST_MODEL:-meta-llama/llama-3.3-70b-instruct}"
LAUNCHER_SKIP_MODEL_ALIAS=1
LAUNCHER_SUBAGENT_MODEL="${LLAMA_SUBAGENT_MODEL:-meta-llama/llama-3.3-70b-instruct}"

export ANTHROPIC_DEFAULT_FABLE_MODEL="${LLAMA_FABLE_MODEL:-meta-llama/llama-4-maverick}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="Llama 4 Maverick (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="Llama via OpenRouter Anthropic skin — not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="Llama 4 Maverick"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary Llama (1M context, multimodal) — second-opinion driver"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="Llama 4 Maverick (Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Llama primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Llama 3.3 70B (Fast slot)"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Efficient Llama for searches, summaries, lightweight edits"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="thinking"

# Standard fleet tuning (mirrors the validated GLM/Kimi profile).
export ENABLE_TOOL_SEARCH="${LLAMA_ENABLE_TOOL_SEARCH:-false}"
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${LLAMA_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${LLAMA_AUTO_COMPACT_WINDOW:-1000000}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${LLAMA_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${LLAMA_DISABLE_NONESSENTIAL_TRAFFIC:-1}"
export API_TIMEOUT_MS="${LLAMA_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${LLAMA_API_FORCE_IDLE_TIMEOUT:-1}"
export BASH_DEFAULT_TIMEOUT_MS="${LLAMA_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${LLAMA_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${LLAMA_BASH_MAX_OUTPUT_LENGTH:-50000}"
export MCP_CONNECTION_NONBLOCKING="${LLAMA_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${LLAMA_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${LLAMA_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${LLAMA_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${LLAMA_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${LLAMA_MAX_MCP_OUTPUT_TOKENS:-15000}"
export TASK_MAX_OUTPUT_LENGTH="${LLAMA_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort high --permission-mode plan "$@"
