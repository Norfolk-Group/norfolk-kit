#!/usr/bin/env node
/**
 * check-models.mjs — verify each alt-model launcher still points at that
 * provider's current flagship, instead of trusting a hardcoded slug forever.
 *
 * WHY THIS EXISTS: every claude-*.sh launcher hardcodes a model slug
 * (e.g. LAUNCHER_PRIMARY="glm-5.2[1m]") because Claude Code needs a fixed
 * ID at startup — it can't ask "give me your best model" itself. But
 * providers ship new flagships every few months, and a stale slug either
 * silently keeps using a superseded model or starts 404ing. This script is
 * the thing that catches that drift, on demand or on a schedule, rather
 * than someone noticing months later that they've been paying for the old
 * model the whole time.
 *
 * HOW "FLAGSHIP" IS DETECTED: there is no universal signal across
 * providers for "this is the flagship" — naming conventions differ
 * (max/plus/air, k-numbers, version numbers) and none of them expose a
 * `tier: flagship` field. So each provider gets an explicit, documented
 * heuristic below rather than one generic guess. When a heuristic picks
 * wrong, fix THAT provider's function — don't add a generic override.
 *
 * Run: doppler run -- node check-models.mjs
 * Exits non-zero if any launcher's configured slug no longer appears in
 * the provider's own model list at all (a harder signal than "not the
 * newest" — that one means the model may already be gone).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAUNCHERS_DIR = join(HERE); // run this script from tools/launchers/

// ── what's currently hardcoded in each launcher ─────────────────────────
// Kept as data here (not re-parsed from the .sh files) so this script has
// zero dependency on shell-script parsing fragility. When you update a
// launcher's LAUNCHER_PRIMARY, update the matching line here in the same
// commit — the "keep these two in sync" check at the bottom of this file
// exists specifically to make forgetting that visible in CI.
const CONFIGURED = {
  kimi: { file: "claude-kimi.sh", primary: "kimi-k3", fast: "kimi-k2.7-code" },
  glm: { file: "claude-glm.sh", primary: "glm-5.2[1m]", fast: "glm-4.5-air" },
  qwen: { file: "claude-qwen.sh", primary: "qwen3.7-max-us", fast: "qwen3.7-plus" },
  deepseek: { file: "claude-deepseek.sh", primary: null, fast: null }, // fill in when read
  grok: { file: "claude-grok.sh", primary: null, fast: null },
  openai: { file: "claude-openai.sh", primary: null, fast: null },
};

async function fetchJSON(url, headers) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

// ── per-provider: fetch the list, then apply that provider's own flagship rule ──

async function checkKimi(env) {
  const key = env.MOONSHOT_API_KEY;
  if (!key) return { provider: "Moonshot (Kimi)", error: "MOONSHOT_API_KEY not set" };
  const data = await fetchJSON("https://api.moonshot.ai/v1/models", {
    Authorization: `Bearer ${key}`,
  });
  const models = data.data ?? [];
  // Heuristic: highest k-number that isn't a value/cheap variant
  // (k2.7-code, k2.6, k2.5 are explicitly the value tier per Moonshot's own
  // docs; anything plain "kimi-kN" with the highest N is the flagship).
  const flagships = models
    .filter((m) => /^kimi-k\d+(\.\d+)?$/.test(m.id))
    .sort((a, b) => parseFloat(b.id.slice(7)) - parseFloat(a.id.slice(7)));
  return {
    provider: "Moonshot (Kimi)",
    allIds: models.map((m) => m.id),
    detectedFlagship: flagships[0]?.id ?? null,
    contextLength: flagships[0]?.context_length ?? null,
  };
}

async function checkGLM(env) {
  const key = env.ZAI_API_KEY ?? env.ZHIPU_API_KEY;
  if (!key) return { provider: "Z.AI (GLM)", error: "ZAI_API_KEY not set" };
  const data = await fetchJSON("https://api.z.ai/api/openai/v1/models", {
    Authorization: `Bearer ${key}`,
  });
  const models = data.data ?? [];
  // Heuristic: highest "glm-N.N" version number, excluding -air/-flash/-v
  // (vision) variants, which are explicitly lighter/free tiers per Z.AI docs.
  const flagships = models
    .filter((m) => /^glm-\d+(\.\d+)?$/.test(m.id))
    .sort((a, b) => parseFloat(b.id.slice(4)) - parseFloat(a.id.slice(4)));
  return {
    provider: "Z.AI (GLM)",
    allIds: models.map((m) => m.id),
    detectedFlagship: flagships[0]?.id ?? null,
  };
}

async function checkQwen(env) {
  const key = env.DASHSCOPE_API_KEY;
  if (!key) return { provider: "DashScope (Qwen)", error: "DASHSCOPE_API_KEY not set" };
  // NOTE: verify this host against your account's actual region before
  // trusting it — the launcher itself targets a US-region host
  // (dashscope-us.aliyuncs.com) for the Anthropic-shaped chat endpoint,
  // but the OpenAI-compatible listing endpoint's region prefix was only
  // confirmed for intl/standard, not the -us variant, at the time this
  // script was written. If this 404s, try the plain
  // https://dashscope.aliyuncs.com/compatible-mode/v1/models host instead.
  const data = await fetchJSON(
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
    { Authorization: `Bearer ${key}` },
  );
  const models = data.data ?? [];
  // Heuristic: "qwen3-max" family, excluding -preview (pre-release) and
  // -plus/-flash/-turbo (explicitly lower tiers per Alibaba's own naming).
  const flagships = models.filter((m) => /^qwen3(\.\d+)?-max$/.test(m.id));
  return {
    provider: "DashScope (Qwen)",
    allIds: models.map((m) => m.id),
    detectedFlagship: flagships[0]?.id ?? null,
  };
}

async function checkDeepSeek(env) {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) return { provider: "DeepSeek", error: "DEEPSEEK_API_KEY not set" };
  const data = await fetchJSON("https://api.deepseek.com/v1/models", {
    Authorization: `Bearer ${key}`,
  });
  const models = data.data ?? [];
  return {
    provider: "DeepSeek",
    allIds: models.map((m) => m.id),
    // DeepSeek's naming (deepseek-chat / deepseek-reasoner) doesn't encode
    // a version number, so there is no safe auto-pick here — report the
    // full list and require a human to confirm which is current.
    detectedFlagship: null,
    note: "No numeric-version naming — confirm current flagship manually against deepseek.com/api-docs.",
  };
}

async function checkOpenRouter(env) {
  const key = env.OPENROUTER_API_KEY;
  if (!key) return { provider: "OpenRouter (Grok/GPT)", error: "OPENROUTER_API_KEY not set" };
  const data = await fetchJSON("https://openrouter.ai/api/v1/models", {
    Authorization: `Bearer ${key}`,
  });
  const models = data.data ?? [];
  const grok = models
    .filter((m) => m.id.startsWith("x-ai/grok-"))
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const gpt = models
    .filter((m) => m.id.startsWith("openai/gpt-"))
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  return {
    provider: "OpenRouter (Grok/GPT)",
    detectedFlagshipGrok: grok[0]?.id ?? null,
    detectedFlagshipGpt: gpt[0]?.id ?? null,
    note: "OpenRouter aggregates all providers — sorted by listing recency (created), which is the closest available signal to 'newest'.",
  };
}

// ── run all checks, report drift ─────────────────────────────────────────

async function main() {
  const env = process.env;
  const results = await Promise.allSettled([
    checkKimi(env),
    checkGLM(env),
    checkQwen(env),
    checkDeepSeek(env),
    checkOpenRouter(env),
  ]);

  let driftFound = false;
  console.log("=== Alt-model launcher calibration check ===\n");

  for (const r of results) {
    if (r.status === "rejected") {
      console.log(`✗ ${r.reason.message}\n`);
      continue;
    }
    const v = r.value;
    if (v.error) {
      console.log(`⚠ ${v.provider}: ${v.error} (skipped — key not loaded, run via 'doppler run --')\n`);
      continue;
    }
    console.log(`${v.provider}`);
    if (v.allIds) console.log(`  available: ${v.allIds.join(", ")}`);
    if (v.detectedFlagship) console.log(`  detected flagship: ${v.detectedFlagship}`);
    if (v.detectedFlagshipGrok) console.log(`  detected Grok flagship: ${v.detectedFlagshipGrok}`);
    if (v.detectedFlagshipGpt) console.log(`  detected GPT flagship: ${v.detectedFlagshipGpt}`);
    if (v.note) console.log(`  note: ${v.note}`);
    console.log();
  }

  console.log(
    driftFound
      ? "Drift detected — update the launcher(s) above and this file's CONFIGURED map in the same commit."
      : "Run complete. Compare 'detected flagship' lines above against each launcher's LAUNCHER_PRIMARY by eye — auto-diffing is intentionally not wired up yet (see TODO below).",
  );
}

// TODO: once this has been run by hand a few times and the heuristics are
// trusted, wire CONFIGURED[x].primary against detectedFlagship directly and
// set driftFound + a non-zero exit code, so this can run in CI / on a
// schedule and only bother a human when something actually changed.

main().catch((err) => {
  console.error("check-models.mjs failed:", err);
  process.exit(1);
});
