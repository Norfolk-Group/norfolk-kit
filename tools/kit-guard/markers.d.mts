export interface MarkerPolicy {
  markers: Record<string, string>;
  unmatchedDefault?: string;
}

export const REQUIRED_UNMATCHED_DEFAULT: "kit-only";
export function matchesMarkerPattern(pattern: string, path: string): boolean;
export function hasSafeUnmatchedDefault(markers: MarkerPolicy): boolean;
export function sensitivityOf(markers: MarkerPolicy, path: string): string;
export function isKitManagedPath(markers: MarkerPolicy, path: string): boolean;
