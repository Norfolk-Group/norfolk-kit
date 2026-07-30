/**
 * useAnimationForCategory — TanStack Query hook that resolves the admin-configured
 * animation component for a given category key (e.g. "logo", "rebecca",
 * "file-export", "agent-ticker", "narration-ticker").
 *
 * Fetches GET /api/animation-config (returns [{ category, animationId }]).
 * Resolves animationId → component via the shared animation-registry Map.
 *
 * staleTime: Infinity — the admin-configured animation rarely changes during a
 * session; aggressive caching prevents redundant fetches from concurrent long-
 * running operations that each mount their own progress component.
 *
 * U3, KTD-4 (Map resolver), U3-2.
 */

import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  resolveAnimation,
  DEFAULT_ANIMATION_COMPONENT,
  type AnimationSlotProps,
} from "@/lib/animation-registry";

// ── API types ─────────────────────────────────────────────────────────────────

interface AnimationConfigRow {
  category: string;
  animationId: string;
}

// ── Query key ─────────────────────────────────────────────────────────────────

const ANIMATION_CONFIG_QUERY_KEY = ["animation-config"] as const;

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useAnimationForCategory
 *
 * @param category - short key (e.g. "rebecca", "file-export"). Pass the DB value
 *   directly — the API returns these unchanged.
 * @returns The resolved ComponentType for the category, or DEFAULT_ANIMATION_COMPONENT
 *   if the category is absent or the query has not yet resolved.
 */
export function useAnimationForCategory(
  category: string,
): React.ComponentType<AnimationSlotProps> {
  const { data } = useQuery<AnimationConfigRow[]>({
    queryKey: ANIMATION_CONFIG_QUERY_KEY,
    queryFn: async (): Promise<AnimationConfigRow[]> => {
      const res = await fetch("/api/animation-config", { credentials: "include" });
      if (!res.ok) {
        throw new Error(
          `[useAnimationForCategory] GET /api/animation-config failed: ${res.status} ${res.statusText}`,
        );
      }
      const payload: unknown = await res.json();
      // Guard against malformed payloads — fall back to empty array rather than
      // throwing so the resolver gracefully uses DEFAULT_ANIMATION_COMPONENT.
      if (!Array.isArray(payload)) return [];
      return (payload as unknown[]).filter(
        (r): r is AnimationConfigRow =>
          r !== null &&
          typeof r === "object" &&
          typeof (r as Record<string, unknown>).category === "string" &&
          typeof (r as Record<string, unknown>).animationId === "string",
      );
    },
    staleTime: Infinity,
  });

  if (!data) return DEFAULT_ANIMATION_COMPONENT;

  const row = data.find((r) => r.category === category);
  if (!row) return DEFAULT_ANIMATION_COMPONENT;

  return resolveAnimation(row.animationId);
}
