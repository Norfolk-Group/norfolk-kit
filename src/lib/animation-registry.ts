/**
 * animation-registry — shared Map from animation catalog ID → React component.
 *
 * This is the single source of truth for the animationId→component binding
 * used across AnalystProgressDialog, CategoryProgressDialog, and
 * AgentWaitingOverlay. It covers every ID in the admin catalog so any admin
 * selection resolves to a real component (KTD-4, U3).
 *
 * Prototype-pollution safe: uses Map.get() (not bracket access on a plain
 * object) so IDs like "constructor" / "toString" / "__proto__" never resolve
 * to an inherited native function.
 *
 * Default: RebeccaOrbitAdvanced (KTD-6 directive — the primary operation
 * animation).
 */

import React from "react";
import {
  RebeccaOrbitAdvanced,
  RebeccaOrbit,
  RebeccaCaveSequence,
  RebeccaGeoSequence,
  RebeccaTotemSequence,
  RebeccaAlive,
  AnalystThinkingCube,
  AnalystNexusCore,
  AnalystSwissCube,
  AnalystBarChartPulse,
  AnalystQuantumSolver,
  AnalystExpandingSolver,
} from "@/components/agent-animations";
import { HplusLogoAnimated, AnalystCubeIcon } from "@/components/graphics";

// ── Adapter type ──────────────────────────────────────────────────────────────

/** The canonical slot contract: every registered component must accept this shape. */
export type AnimationSlotProps = { size?: number };

// ── Adapters for components with incompatible signatures ──────────────────────
//
// RebeccaOrb requires phase: AgentPhase (enum) and size: AgentOrbSize (string enum),
// both mandatory conceptually (no safe default maps a number to the enum shape).
// We wrap it with sane defaults so the registry contract (size?: number) holds.

import { RebeccaOrb } from "@/components/agent-animations";

/** Adapter: RebeccaOrb (phase enum + string size) → numeric size slot. */
const RebeccaOrbAdapter = React.memo(function RebeccaOrbAdapter({
  size: _size,
}: AnimationSlotProps) {
  // RebeccaOrb's size is AgentOrbSize ("sm"|"md"|"lg"), not numeric. We render
  // "lg" always to fill the slot — the container is sized by the caller.
  return React.createElement(RebeccaOrb, { phase: "thinking", size: "lg" });
});
RebeccaOrbAdapter.displayName = "RebeccaOrbAdapter";

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * ANIMATION_REGISTRY — Map<animationId, ComponentType<AnimationSlotProps>>.
 *
 * Covers every id exported by animationCatalog.tsx (15 entries) plus adapters
 * for components with non-standard prop shapes.
 */
export const ANIMATION_REGISTRY = new Map<
  string,
  React.ComponentType<AnimationSlotProps>
>([
  // ── Rebecca family ──────────────────────────────────────────────────────
  ["rebecca-orb", RebeccaOrbAdapter],
  ["rebecca-orbit-advanced", RebeccaOrbitAdvanced],
  ["rebecca-orbit", RebeccaOrbit],
  ["rebecca-cave", RebeccaCaveSequence],
  ["rebecca-geo", RebeccaGeoSequence],
  ["rebecca-totem", RebeccaTotemSequence],
  ["rebecca-alive", RebeccaAlive],
  // ── Analyst / brand family ──────────────────────────────────────────────
  ["hplus-logo", HplusLogoAnimated],
  ["analyst-cube", AnalystCubeIcon],
  ["analyst-nexus", AnalystNexusCore],
  ["analyst-bar", AnalystBarChartPulse],
  ["analyst-quantum", AnalystQuantumSolver],
  ["analyst-expanding", AnalystExpandingSolver],
  ["analyst-swiss", AnalystSwissCube],
  ["analyst-thinking", AnalystThinkingCube],
]);

/** The default component returned when an unknown animationId is requested. */
export const DEFAULT_ANIMATION_COMPONENT: React.ComponentType<AnimationSlotProps> =
  RebeccaOrbitAdvanced;

/**
 * resolveAnimation — looks up an animationId in the registry.
 *
 * Returns the registered component, or `DEFAULT_ANIMATION_COMPONENT` on miss.
 * Warns to the console on an unknown id so admin misconfigurations are visible
 * in dev without crashing the UI.
 */
export function resolveAnimation(
  animationId: string,
): React.ComponentType<AnimationSlotProps> {
  const component = ANIMATION_REGISTRY.get(animationId);
  if (!component) {
    console.warn(
      `[animation-registry] Unknown animationId "${animationId}" — falling back to default. ` +
        "Check admin_resources animation_category rows.",
    );
    return DEFAULT_ANIMATION_COMPONENT;
  }
  return component;
}
