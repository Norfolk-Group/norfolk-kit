/**
 * Focus-trap helpers for the AgentWaitingOverlay modal (`role="dialog"`
 * `aria-modal="true"`). Pure / DOM-query-only — no React or framer-motion
 * imports — so the trap *decision* logic is unit-testable in the portal's
 * node test environment (vitest.config.ts uses `environment: 'node'`).
 */

/**
 * Tabbable elements inside `container`, in DOM order. The `[tabindex="-1"]`
 * exclusion is load-bearing: it keeps the programmatically-focusable dialog
 * container (which carries `tabIndex={-1}`) OUT of the tabbable list, so the
 * trap never treats the container itself as a boundary element.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/** Where focus should move on a Tab keypress inside the trap. */
export type TrapFocusTarget = "first" | "last" | "container" | null;

/**
 * Pure decision for the Tab focus-trap. Returns which element the caller should
 * move focus to (after `preventDefault()`), or `null` to let the browser's
 * default Tab move focus naturally within the dialog.
 *
 * The `activeInsideDialog === false` branch is the containment guard and the
 * fix for #351: if focus has escaped — or never entered — the dialog, Tab pulls
 * it back in. Without it the boundary-only wrap silently lets Tab walk the
 * background elements behind the modal. `"container"` pins focus to the dialog
 * itself when nothing inside is tabbable (e.g. an overlay with no Cancel
 * button), so Tab still cannot reach the background.
 */
export function nextTrapFocusTarget(args: {
  focusableCount: number;
  activeInsideDialog: boolean;
  activeIsFirst: boolean;
  activeIsLast: boolean;
  shiftKey: boolean;
}): TrapFocusTarget {
  const { focusableCount, activeInsideDialog, activeIsFirst, activeIsLast, shiftKey } = args;
  if (focusableCount === 0) return "container";
  if (!activeInsideDialog) return shiftKey ? "last" : "first";
  if (shiftKey && activeIsFirst) return "last";
  if (!shiftKey && activeIsLast) return "first";
  return null;
}
