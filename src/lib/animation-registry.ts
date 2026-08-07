import type React from "react";
import { AnalystBarChartPulse } from "../components/animations/AnalystBarChartPulse";
import { AnalystCubeIcon } from "../components/animations/AnalystCubeIcon";
import { AnalystExpandingSolver } from "../components/animations/AnalystExpandingSolver";
import { AnalystNexusCore } from "../components/animations/AnalystNexusCore";
import { AnalystQuantumSolver } from "../components/animations/AnalystQuantumSolver";
import { AnalystSwissCube } from "../components/animations/AnalystSwissCube";
import { AnalystThinkingCube } from "../components/animations/AnalystThinkingCube";
import { RebeccaOrbitAdvanced } from "../components/animations/RebeccaAdvancedOrbit";
import { RebeccaAlive } from "../components/animations/RebeccaAliveGeometry";
import { RebeccaCaveSequence } from "../components/animations/RebeccaCaveSequence";
import { RebeccaGeoSequence } from "../components/animations/RebeccaGeoSequence";
import { RebeccaOrbit } from "../components/animations/RebeccaSwissOrbit";
import { RebeccaTotemSequence } from "../components/animations/RebeccaTotemSequence";

export type AnimationSlotProps = { size?: number };
type AnimationComponent = React.ComponentType<AnimationSlotProps>;

export const DEFAULT_ANIMATION_ID = "rebecca-orbit-advanced";

export const ANIMATION_REGISTRY = new Map<string, AnimationComponent>([
  ["rebecca-orbit-advanced", RebeccaOrbitAdvanced],
  ["rebecca-orbit", RebeccaOrbit],
  ["rebecca-cave", RebeccaCaveSequence],
  ["rebecca-geo", RebeccaGeoSequence],
  ["rebecca-totem", RebeccaTotemSequence],
  ["rebecca-alive", RebeccaAlive],
  ["analyst-cube", AnalystCubeIcon],
  ["analyst-nexus", AnalystNexusCore],
  ["analyst-bar", AnalystBarChartPulse],
  ["analyst-quantum", AnalystQuantumSolver],
  ["analyst-expanding", AnalystExpandingSolver],
  ["analyst-swiss", AnalystSwissCube],
  ["analyst-thinking", AnalystThinkingCube]
]);

export function resolveAnimation(animationId: string): AnimationComponent {
  const component = ANIMATION_REGISTRY.get(animationId);
  if (component) return component;
  console.warn(`[animation-registry] Unknown animationId "${animationId}"; using ${DEFAULT_ANIMATION_ID}.`);
  return ANIMATION_REGISTRY.get(DEFAULT_ANIMATION_ID)!;
}
