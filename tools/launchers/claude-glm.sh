#!/usr/bin/env bash
# claude-glm.sh — Claude Code on Zhipu GLM via Z.AI's Anthropic endpoint (DIRECT).
#
# Maps GLM-5.3 into the Opus/Sonnet compatibility slots and the Fable slot,
# GLM-4.5-Air into Haiku — each with the name/description/capability metadata
# Claude Code's model UI reads — plus the auto-compact/timeout/MCP/bash tuning
# the primary and long agentic runs need. Z.AI's Doppler secret is available
# under both ZAI_API_KEY (current) and ZHIPU_API_KEY (legacy) — this defaults
# to the former.
#
# Usage:  ./claude-glm.sh             # glm-5.3, opus tier, max effort, plan mode
#         GLM_MODEL=glm-4.7 ./claude-glm.sh
#         GLM_KEY_VAR=ZHIPU_API_KEY ./claude-glm.sh   # use the legacy secret name
# DEV TOOLING ONLY (CLAUDE.md §1) — see claude-launcher-lib.sh.
set -euo pipefail
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LAUNCHER_DIR/claude-launcher-lib.sh"

LAUNCHER_NAME="claude-glm.sh"
LAUNCHER_KEY_VAR="${GLM_KEY_VAR:-ZAI_API_KEY}"
LAUNCHER_BASE_URL="https://api.z.ai/api/anthropic"
LAUNCHER_PRIMARY="${GLM_MODEL:-glm-5.3}"
LAUNCHER_FAST="${GLM_FAST_MODEL:-glm-4.5-air}"
LAUNCHER_SKIP_MODEL_ALIAS=1

# Fable slot (Claude Code 2.1.x's 4th model tier) + per-slot name/description/capability
# metadata — the shared lib only sets the bare Opus/Sonnet/Haiku model IDs, so GLM adds
# the rest directly.
export ANTHROPIC_DEFAULT_FABLE_MODEL="${GLM_FABLE_MODEL:-glm-5.3}"
export ANTHROPIC_DEFAULT_FABLE_MODEL_NAME="GLM-5.3 Max (Fable slot)"
export ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION="Z.AI GLM-5.3 compatibility mapping; this is not Anthropic Fable"
export ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking,adaptive_thinking"

export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME="GLM-5.3 Max"
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION="Primary GLM route for complex coding, architecture, and long-running tasks"
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking,adaptive_thinking"

export ANTHROPIC_DEFAULT_SONNET_MODEL_NAME="GLM-5.3 Standard"
export ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION="Same Z.AI GLM-5.3 model through the Sonnet compatibility slot"
export ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES="effort,xhigh_effort,max_effort,thinking,adaptive_thinking"

export ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME="GLM-4.5-Air Fast"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION="Faster lower-cost GLM model for searches, summaries, and lightweight coding"
export ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES="thinking"

# Tuned for the 1M-token primary + long agentic runs (validated working, 2026-07-24).
export CLAUDE_CODE_ALWAYS_ENABLE_EFFORT="${GLM_ALWAYS_ENABLE_EFFORT:-1}"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="${GLM_AUTO_COMPACT_WINDOW:-1000000}"
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE="${GLM_AUTOCOMPACT_PCT_OVERRIDE:-80}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${GLM_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

export API_TIMEOUT_MS="${GLM_API_TIMEOUT_MS:-3000000}"
export API_FORCE_IDLE_TIMEOUT="${GLM_API_FORCE_IDLE_TIMEOUT:-1}"

export BASH_DEFAULT_TIMEOUT_MS="${GLM_BASH_DEFAULT_TIMEOUT_MS:-300000}"
export BASH_MAX_TIMEOUT_MS="${GLM_BASH_MAX_TIMEOUT_MS:-1800000}"
export BASH_MAX_OUTPUT_LENGTH="${GLM_BASH_MAX_OUTPUT_LENGTH:-50000}"

export MCP_CONNECTION_NONBLOCKING="${GLM_MCP_CONNECTION_NONBLOCKING:-1}"
export MCP_CONNECT_TIMEOUT_MS="${GLM_MCP_CONNECT_TIMEOUT_MS:-15000}"
export MCP_TIMEOUT="${GLM_MCP_TIMEOUT:-60000}"
export MCP_TOOL_TIMEOUT="${GLM_MCP_TOOL_TIMEOUT:-900000}"
export CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT="${GLM_MCP_TOOL_IDLE_TIMEOUT:-180000}"
export MAX_MCP_OUTPUT_TOKENS="${GLM_MAX_MCP_OUTPUT_TOKENS:-15000}"

export TASK_MAX_OUTPUT_LENGTH="${GLM_TASK_MAX_OUTPUT_LENGTH:-40000}"

launcher_run --model opus --effort max --permission-mode plan "$@"
