#!/usr/bin/env bash
# claude-grok.sh — Claude Code with Grok as the brain.
#
# Merges the OpenAI Grok-via-OpenRouter recipe (2026-07-24) with this fleet's
# proven slot-map launcher. Take / leave:
#
#   TAKE  — clear stale provider routing; AUTH_TOKEN-only key; SMALL_FAST_MODEL;
#           CLAUDE_CODE_EFFORT_LEVEL=high; Tool Search off; long timeouts;
#           plan mode; effort high (not max).
#   LEAVE — pin everything to grok-4.3 (outdated; flagship is 4.5).
#   LEAVE — raw --model x-ai/grok-* (CC 2.1.x rejects unknown slugs; use
#           --model opus + ANTHROPIC_DEFAULT_*_MODEL maps instead).
#   LEAVE — doppler run wrapper (claude-launcher-lib already resolves Doppler
#           → env → .env without wrapping the whole shell).
#
# Opinionated Grok defaults:
#   • Flagship on every slot — no silent Haiku downgrade to 4.3
#   • OpenRouter transport (xAI Anthropic-compat still partial for real CC traffic)
#   • Compact window matches Grok 4.5's 500K context
#   • Subagents stay on the primary
#
# Model registry verified against OpenRouter 2026-07-24: x-ai/grok-4.5 (500K ctx),
# x-ai/grok-4.3 (1M ctx), ~x-ai/grok-latest (routing alias → newest Grok, 500K).
# grok-4.20 does NOT exist (hallucinated in an earlier draft — removed).
#
# Usage (first arg may be a model shortcut; everything else forwards to claude):
#   ./claude-grok.sh                            # x-ai/grok-4.5 (flagship)
#   ./claude-grok.sh 4.3                        # x-ai/grok-4.3 (1M context)
#   ./claude-grok.sh latest                     # ~x-ai/grok-latest (routing alias)
#   ./claude-grok.sh x-ai/grok-4.5              # any full slug works too
#   GROK_BUDGET=1 ./claude-grok.sh              # Haiku slot → grok-4.3
#   GROK_BASE_URL=https://api.x.ai GROK_KEY_VAR=XAI_API_KEY GROK_MODEL=grok-4.5 ./claude-grok.sh
#
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 || true
source "$(dirname "${BASH_SOURCE[0]}")/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-grok.sh"

# ── Transport ──────────────────────────────────────────────────────────────
LAUNCHER_KEY_VAR="${GROK_KEY_VAR:-OPENROUTER_API_KEY}"
LAUNCHER_BASE_URL="${GROK_BASE_URL:-https://openrouter.ai/api}"

# ── Model map ──────────────────────────────────────────────────────────────
_grok_flagship="x-ai/grok-4.5"
_grok_budget_fast="x-ai/grok-4.3"
_grok_latest="~x-ai/grok-latest"

# Positional model shortcut: first arg picks the primary (4.5 | 4.3 | latest |
# any x-ai/* or ~x-ai/* slug), then drops out of the args forwarded to claude.
if [[ $# -ge 1 ]]; then
  case "$1" in
    4.5)               GROK_MODEL="$_grok_flagship";   shift ;;
    4.3)               GROK_MODEL="$_grok_budget_fast"; shift ;;
    latest)            GROK_MODEL="$_grok_latest";     shift ;;
    x-ai/*|~x-ai/*)    GROK_MODEL="$1";                shift ;;
  esac
fi

if [[ "${GROK_USE_LATEST:-0}" == "1" ]]; then
  _grok_primary="${GROK_MODEL:-$_grok_latest}"
else
  _grok_primary="${GROK_MODEL:-$_grok_flagship}"
fi

if [[ -n "${GROK_FAST_MODEL:-}" ]]; then
  _grok_fast="$GROK_FAST_MODEL"
elif [[ "${GROK_BUDGET:-0}" == "1" ]]; then
  _grok_fast="$_grok_budget_fast"
elif [[ "${GROK_USE_LATEST:-0}" == "1" ]]; then
  _grok_fast="$_grok_latest"
else
  _grok_fast="$_grok_primary"
fi

_grok_fable="${GROK_FABLE_MODEL:-$_grok_primary}"

LAUNCHER_PRIMARY="$_grok_primary"
LAUNCHER_FAST="$_grok_fast"
LAUNCHER_SKIP_MODEL_ALIAS=1
LAUNCHER_SUBAGENT_MODEL="${GROK_SUBAGENT_MODEL:-$_grok_primary}"

# ── Slot metadata (Claude Code model UI) ───────────────────────────────────
export ANTHROPIC_DEFAULT_FABLE_MODEL="$_grok_fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="Grok Flagship (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="Grok via OpenRouter Anthropic skin — not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="effort,thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="Grok Flagship"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary Grok for architecture, long agentic runs, and hard coding"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="effort,thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="Grok Flagship (Sonnet slot)"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Grok primary through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="effort,thinking"

if [[ "$_grok_fast" == "$_grok_budget_fast" ]]; then
  export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Grok 4.3 Budget"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Cheaper/faster Grok — opt-in via GROK_BUDGET=1 or GROK_FAST_MODEL"
else
  export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="Grok Flagship (Haiku slot)"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Same flagship Grok — no silent quality drop on the fast tier"
fi
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="effort,thinking"

# ── Runtime tuning ─────────────────────────────────────────────────────────
export ENABLE_TOOL_SEARCH="${GROK_ENABLE_TOOL_SEARCH:-false}"

# Effort: high is Grok's ceiling (OpenAI recipe + live notes). Always-enable
# keeps the UI active; EFFORT_LEVEL seeds the session default.
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${GROK_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_EFFORT_LEVEL="${GROK_EFFORT_LEVEL:-high}"

# Context window auto-matches the chosen primary (registry-verified 2026-07-24:
# grok-4.5 and ~grok-latest = 500K, grok-4.3 = 1M). GROK_AUTO_COMPACT_WINDOW wins.
case "$_grok_primary" in
  *grok-4.3*) _grok_ctx_default=1000000 ;;
  *)          _grok_ctx_default=500000  ;;
esac
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${GROK_AUTO_COMPACT_WINDOW:-$_grok_ctx_default}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${GROK_AUTOCOMPACT_PCT_OVERRIDE:-75}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${GROK_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

export API_TIMEOUT_MS="${GROK_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${GROK_API_FORCE_IDLE_TIMEOUT:-1}"

export BASH_DEFAULT_TIMEOUT_MS="${GROK_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${GROK_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${GROK_BASH_MAX_OUTPUT_LENGTH:-50000}"

export MCP_CONNECTION_NONBLOCKING="${GROK_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${GROK_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${GROK_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${GROK_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${GROK_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${GROK_MAX_MCP_OUTPUT_TOKENS:-15000}"

export TASK_MAX_OUTPUT_LENGTH="${GROK_TASK_MAX_OUTPUT_LENGTH:-40000}"

# --model opus (tier) → maps to LAUNCHER_PRIMARY via DEFAULT_OPUS_MODEL.
# Do not pass a raw OpenRouter slug as --model (CC rejects it).
launcher_run --model opus --effort high --permission-mode plan "$@"
