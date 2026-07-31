#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$HOME/.claude" "$HOME/.claude/skills" "$HOME/workspace/.claude/commands"
cp "$ROOT_DIR/claude-code/settings.template.json" "$HOME/.claude/settings.json"
cp -R "$ROOT_DIR/claude-code/skills/"* "$HOME/.claude/skills/"
cp -R "$ROOT_DIR/claude-code/commands/"* "$HOME/workspace/.claude/commands/"
echo "Norfolk AI Claude setup restored."
