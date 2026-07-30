#!/usr/bin/env bash
# claude-launcher-lib.sh — shared core for the claude-<model>.sh launchers.
#
# Each wrapper sets the provider contract below, then sources this file, which
# performs the launch. One implementation of the mechanics every launcher needs:
#
#   LAUNCHER_NAME      display name for messages          (e.g. "claude-qwen.sh")
#   LAUNCHER_BASE_URL  Anthropic-protocol base URL        (provider direct, or https://openrouter.ai/api)
#   LAUNCHER_KEY_VAR   name of the secret holding the key (e.g. MOONSHOT_API_KEY)
#   LAUNCHER_PRIMARY   model id for opus/sonnet/subagent tiers
#   LAUNCHER_FAST      model id for the haiku tier        (defaults to LAUNCHER_PRIMARY)
#
# Why the tier remap instead of a raw ANTHROPIC_MODEL slug: Claude Code 2.1.x
# rejects unknown raw slugs ("issue with the selected model") but passes
# ANTHROPIC_DEFAULT_*_MODEL values through to the base URL verbatim — the
# documented mechanism for custom endpoints (debugged 2026-07-23, PR #935; the
# same env contract Z.AI/DashScope document for their Claude Code guides).
#
# Key resolution: environment → Doppler → legacy .env. Doppler is the repo's
# secrets source of truth (docs/reference/deployment-and-env.md); the repo's
# doppler.yaml project/config are baked as defaults because `doppler setup`
# silently no-ops in some containers (bug recorded in the ledger 2026-07-24).
#
# DEV TOOLING ONLY (CLAUDE.md §1): if any of these models becomes a *product*
# integration it goes through admin_resources + the five-layer pattern.

set -euo pipefail

_lib_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# One batched Doppler download per launch (~0.3s for the whole config) instead of a
# network round-trip per key — faster, and a Doppler outage/logout is ONE loud
# warning instead of N silent empty keys (the greptile blank-Bearer 403 class).
_lib_doppler_batch=""
_lib_doppler_state="unfetched"   # unfetched | ok | failed

launcher_fetch_doppler_batch() {
  [[ "$_lib_doppler_state" != "unfetched" ]] && return 0
  if ! command -v doppler >/dev/null 2>&1; then
    _lib_doppler_state="failed"
    echo "${LAUNCHER_NAME:-launcher}: doppler CLI not installed — resolving secrets from env/.env only." >&2
    return 0
  fi
  # Failure = doppler's EXIT CODE, not output emptiness (a reachable project with
  # zero secrets is a valid, non-failed state).
  if _lib_doppler_batch="$(DOPPLER_PROJECT="${DOPPLER_PROJECT:-h-analytics}" DOPPLER_CONFIG="${DOPPLER_CONFIG:-dev}" \
    doppler secrets download --no-file --format env-no-quotes 2>/dev/null)"; then
    _lib_doppler_state="ok"
  else
    _lib_doppler_state="failed"
    echo "${LAUNCHER_NAME:-launcher}: Doppler fetch failed (not logged in? run 'doppler login') — resolving secrets from env/.env only." >&2
  fi
}

launcher_resolve_secret() {
  # $1 = secret name. Echoes the value; empty if unresolved.
  # Priority: process env → batched Doppler download → legacy .env.
  local name="$1" value=""
  # Names are interpolated into grep patterns below — accept env-var identifiers only.
  if [[ ! "$name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "${LAUNCHER_NAME:-launcher}: invalid secret name '$name'" >&2
    return 1
  fi
  value="${!name:-}"
  if [[ -z "$value" ]]; then
    launcher_fetch_doppler_batch
    if [[ "$_lib_doppler_state" == "ok" ]]; then
      value="$(printf '%s\n' "$_lib_doppler_batch" | grep -E "^${name}=" | head -1 | cut -d= -f2- || true)"
    fi
  fi
  if [[ -z "$value" && -f "$_lib_repo_root/.env" ]]; then
    # Legacy fallback only (last-line-wins loader semantics).
    value="$(grep -E "^${name}=" "$_lib_repo_root/.env" | tail -1 | cut -d= -f2- \
             | tr -d '"' | tr -d "'" | tr -d '[:space:]' || true)"
  fi
  printf '%s' "$value"
}

launcher_run() {
  : "${LAUNCHER_NAME:?}" "${LAUNCHER_BASE_URL:?}" "${LAUNCHER_KEY_VAR:?}" "${LAUNCHER_PRIMARY:?}"
  local fast="${LAUNCHER_FAST:-$LAUNCHER_PRIMARY}"

  local key
  key="$(launcher_resolve_secret "$LAUNCHER_KEY_VAR")"
  if [[ -z "$key" ]]; then
    echo "$LAUNCHER_NAME: $LAUNCHER_KEY_VAR not found in env, Doppler (h-analytics/dev), or .env." >&2
    echo "  Add it in the Doppler dashboard, or export it in this shell." >&2
    exit 1
  fi

  # Drop leftover routing from another provider/launcher in this shell (OpenAI
  # Grok recipe hygiene, 2026-07-24) so a prior Qwen/GLM/Claude session cannot
  # half-bleed model ids into this process. FABLE is owned by wrappers that set
  # it before launcher_run — do not clear it here.
  unset ANTHROPIC_MODEL ANTHROPIC_SMALL_FAST_MODEL \
        ANTHROPIC_DEFAULT_OPUS_MODEL ANTHROPIC_DEFAULT_SONNET_MODEL \
        ANTHROPIC_DEFAULT_HAIKU_MODEL \
        CLAUDE_CODE_SUBAGENT_MODEL 2>/dev/null || true

  # Anthropic-protocol wiring (OpenRouter cookbook / provider Claude Code guides):
  # AUTH_TOKEN carries the provider key; ANTHROPIC_API_KEY must be explicitly empty
  # so Claude Code never tries to authenticate against Anthropic directly.
  export ANTHROPIC_BASE_URL="$LAUNCHER_BASE_URL"
  export ANTHROPIC_AUTH_TOKEN="$key"
  export ANTHROPIC_API_KEY=""
  # Key lives only on AUTH_TOKEN for this session (avoid dual env exposure).
  unset "$LAUNCHER_KEY_VAR" 2>/dev/null || true

  # Opt-in escape hatch (GLM only, 2026-07-24): Ricardo's validated-working ad-hoc
  # invocation unsets ANTHROPIC_MODEL entirely rather than aliasing to "sonnet",
  # relying on --model <tier> + the DEFAULT_*_MODEL maps instead. Default is
  # unchanged for every other launcher.
  # NOTE: do NOT put a raw third-party slug in ANTHROPIC_MODEL / --model — Claude
  # Code 2.1.x rejects unknown raw slugs ("issue with the selected model"). The
  # tier name + DEFAULT_*_MODEL map is the documented custom-endpoint contract.
  if [[ -z "${LAUNCHER_SKIP_MODEL_ALIAS:-}" ]]; then
    export ANTHROPIC_MODEL="sonnet"
  else
    unset ANTHROPIC_MODEL
  fi
  # Sonnet slot defaults to the primary; a launcher may set LAUNCHER_SONNET_MODEL
  # for a genuinely three-tier map (OpenAI: sol-pro/terra/luna, 2026-07-24).
  export ANTHROPIC_DEFAULT_SONNET_MODEL="${LAUNCHER_SONNET_MODEL:-$LAUNCHER_PRIMARY}"
  export ANTHROPIC_DEFAULT_OPUS_MODEL="$LAUNCHER_PRIMARY"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="$fast"
  export ANTHROPIC_SMALL_FAST_MODEL="$fast"
  # Subagent model defaults to the primary; a launcher may set LAUNCHER_SUBAGENT_MODEL
  # to route subagents to a cheaper tier (Qwen: qwen3.7-plus, 2026-07-24).
  export CLAUDE_CODE_SUBAGENT_MODEL="${LAUNCHER_SUBAGENT_MODEL:-$LAUNCHER_PRIMARY}"

  # MCP dev-tooling keys (.mcp.json ${VAR} expansions): resolve the ALLOWLISTED set
  # so servers like greptile don't 403 on an empty Bearer header in launcher
  # sessions (launch-claude.sh's allowlist philosophy, Doppler-first). Missing keys
  # stay unset — their MCP server simply reports unauthenticated.
  local mcp_var mcp_val
  for mcp_var in GREPTILE_API_KEY RESEND_API_KEY EXA_API_KEY FRED_API_KEY RAPIDAPI_KEY FIGMA_API_KEY; do
    if [[ -z "${!mcp_var:-}" ]]; then
      mcp_val="$(launcher_resolve_secret "$mcp_var")"
      [[ -n "$mcp_val" ]] && export "$mcp_var"="$mcp_val"
    fi
  done

  # Keep DB/secret env out of the launched agent (mirror launch-claude.sh).
  unset DATABASE_URL POSTGRES_URL NEON_API_KEY APIFY_API_TOKEN 2>/dev/null || true

  # Resolve the Claude Code CLI: PATH first, then the VS Code extension's bundled
  # binary (Codespaces install it there but do not put it on PATH). sort -V so
  # 2.1.10 beats 2.1.9.
  local claude_bin
  claude_bin="$(command -v claude 2>/dev/null || true)"
  if [[ -z "$claude_bin" ]]; then
    claude_bin="$(ls -d "$HOME"/.vscode-remote/extensions/anthropic.claude-code-*/resources/native-binary/claude 2>/dev/null | sort -V | tail -1)"
  fi
  if [[ -z "$claude_bin" || ! -x "$claude_bin" ]]; then
    echo "$LAUNCHER_NAME: could not find the 'claude' CLI on PATH or in the VS Code extension." >&2
    echo "  Install it (npm i -g @anthropic-ai/claude-code) or symlink the extension binary into ~/.local/bin." >&2
    exit 1
  fi

  echo "$LAUNCHER_NAME: launching Claude Code on $LAUNCHER_PRIMARY via $LAUNCHER_BASE_URL ..." >&2
  command "$claude_bin" "$@"
}
