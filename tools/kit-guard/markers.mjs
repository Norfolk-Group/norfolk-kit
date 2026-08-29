export const REQUIRED_UNMATCHED_DEFAULT = "kit-only";

export function matchesMarkerPattern(pattern, path) {
  return pattern.endsWith("/**") ? path.startsWith(pattern.slice(0, -2)) : pattern === path;
}

export function hasSafeUnmatchedDefault(markers) {
  return markers.unmatchedDefault === undefined || markers.unmatchedDefault === REQUIRED_UNMATCHED_DEFAULT;
}

export function sensitivityOf(markers, path) {
  let best = null;
  for (const [pattern, sensitivity] of Object.entries(markers.markers)) {
    if (matchesMarkerPattern(pattern, path) && (!best || pattern.length > best.pattern.length)) {
      best = { pattern, sensitivity };
    }
  }
  return best ? best.sensitivity : REQUIRED_UNMATCHED_DEFAULT;
}

export function isKitManagedPath(markers, path) {
  return Object.keys(markers.markers).some((pattern) => matchesMarkerPattern(pattern, path));
}
