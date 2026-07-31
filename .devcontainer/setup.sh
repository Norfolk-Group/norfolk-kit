#!/usr/bin/env bash
# Codespace bootstrap. Idempotent — safe to re-run.
set -euo pipefail

echo "==> Doppler CLI"
if ! command -v doppler >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq apt-transport-https ca-certificates curl gnupg
  curl -sLf --retry 3 --tlsv1.2 --proto "=https" \
    'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" \
    | sudo tee /etc/apt/sources.list.d/doppler-cli.list >/dev/null
  sudo apt-get update -qq && sudo apt-get install -y -qq doppler
fi
doppler --version

# Claude Code itself is installed by the OFFICIAL devcontainer feature
# (ghcr.io/anthropics/devcontainer-features/claude-code in devcontainer.json)
# — Anthropic maintains it, we don't. Verify only:
echo "==> Claude Code (installed by official devcontainer feature)"
claude --version || echo "WARN: claude not found — check the devcontainer feature"

echo "==> pnpm + deps"
corepack enable
if [ -f package.json ]; then pnpm install --frozen-lockfile || pnpm install; fi

echo "==> alt-model launchers executable"
chmod +x tools/launchers/*.sh 2>/dev/null || true

cat <<'EOF'

Ready. Next steps:
  1. doppler login          # device-code flow, opens in browser
  2. doppler setup          # pick this project's Doppler project + dev config
  3. doppler run -- pnpm dev

Alternative models (keys come from Doppler, never from files):
  claude-kimi.sh · claude-glm.sh · claude-qwen.sh
  claude-grok.sh · claude-deepseek.sh · claude-openai.sh
  See tools/launchers/README.md
EOF
