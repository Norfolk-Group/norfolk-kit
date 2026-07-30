/**
 * AgentWaitingOverlay — centered waiting dialog for long-running async tasks.
 *
 * Renders as an absolute-positioned overlay inside <main> (the main content
 * area in Layout.tsx). Resolves a single admin-configured animation via
 * useAnimationForCategory("narration-ticker") — OQ4 ruling drops the legacy
 * 3-slot cycle in favour of a single server-driven category (U10 Phase A).
 *
 * Wiring in Layout.tsx:
 *   1. Wrap the full layout with <AgentWaitingOverlayProvider>
 *   2. Place <AgentWaitingOverlayDisplay /> as a direct child of <main>
 *      so it can use absolute inset-0 relative to the main positioned ancestor.
 *
 * Usage in page components:
 *   const { show, hide } = useAgentWaitingOverlay();
 *   show({ message: "Researching…" });
 *   await doWork();
 *   hide();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";
import { ANALYST_BRAND } from "@/lib/agent-taxonomy";
import { Button } from "@/components/ui/button";
import { getFocusableElements, nextTrapFocusTarget } from "./focus-trap";
import { useAnimationForCategory } from "@/hooks/useAnimationForCategory";

// ── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_DISPLAY_SIZE_PX = 240;

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentWaitingOverlayOptions {
  message?: string;
  onCancel?: () => void;
}

interface OverlayState {
  visible: boolean;
  opts: AgentWaitingOverlayOptions;
}

interface AgentWaitingOverlayContextValue {
  show: (opts?: AgentWaitingOverlayOptions) => void;
  hide: () => void;
  isVisible: boolean;
  _state: OverlayState;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AgentWaitingOverlayContext =
  createContext<AgentWaitingOverlayContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAgentWaitingOverlay(): Pick<
  AgentWaitingOverlayContextValue,
  "show" | "hide" | "isVisible"
> {
  const ctx = useContext(AgentWaitingOverlayContext);
  if (!ctx) {
    throw new Error(
      "useAgentWaitingOverlay must be used inside AgentWaitingOverlayProvider",
    );
  }
  return { show: ctx.show, hide: ctx.hide, isVisible: ctx.isVisible };
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AgentWaitingOverlayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<OverlayState>({
    visible: false,
    opts: {},
  });

  const show = useCallback((opts?: AgentWaitingOverlayOptions) => {
    setState({ visible: true, opts: opts ?? {} });
  }, []);

  const hide = useCallback(() => {
    setState({ visible: false, opts: {} });
  }, []);

  return (
    <AgentWaitingOverlayContext.Provider
      value={{
        show,
        hide,
        isVisible: state.visible,
        _state: state,
      }}
    >
      {children}
    </AgentWaitingOverlayContext.Provider>
  );
}

// ── Display — placed as a direct child of <main> in Layout.tsx ───────────────

export function AgentWaitingOverlayDisplay() {
  const ctx = useContext(AgentWaitingOverlayContext);

  const prefersReduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const visible = ctx?.isVisible ?? false;
  const opts = ctx?._state.opts ?? {};
  const hide = ctx?.hide ?? (() => { /* no-op outside provider */ });

  // Resolve the admin-configured animation for the generic-wait category.
  // useAnimationForCategory uses staleTime:Infinity so this is a single fetch
  // per session. Falls back to DEFAULT_ANIMATION_COMPONENT on miss (KTD-4).
  const AnimComponent = useAnimationForCategory("narration-ticker");

  // Focus management: trap focus, handle Escape, restore on close
  useEffect(() => {
    if (!visible) return;

    prevFocusRef.current = document.activeElement as HTMLElement;

    // Focus the cancel button if present, else the dialog container
    const dialog = dialogRef.current;
    if (dialog) {
      const cancelBtn = dialog.querySelector<HTMLElement>(
        '[data-testid="agent-waiting-overlay-cancel"]',
      );
      (cancelBtn ?? dialog).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        opts.onCancel?.();
        hide();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = getFocusableElements(dialog);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const target = nextTrapFocusTarget({
        focusableCount: focusable.length,
        activeInsideDialog: !!active && dialog.contains(active),
        activeIsFirst: !!first && active === first,
        activeIsLast: !!last && active === last,
        shiftKey: e.shiftKey,
      });
      if (!target) return; // let default Tab move focus within the dialog
      e.preventDefault();
      if (target === "container") dialog.focus();
      else if (target === "first") first?.focus();
      else last?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      prevFocusRef.current?.focus();
      prevFocusRef.current = null;
    };
  }, [visible, hide, opts.onCancel]);

  // Suppress animation component when user prefers reduced motion
  const AnimationSlot = prefersReduced ? null : (
    <AnimComponent size={ANIMATION_DISPLAY_SIZE_PX} />
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="agent-waiting-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-12 inset-x-0 bottom-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-label={`${ANALYST_BRAND} is working`}
          data-testid="agent-waiting-overlay"
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-5 bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-xs w-full mx-4"
            // Load-bearing for the focus trap: this is the `dialogRef` element
            // that `dialog.focus()` targets — the initial focus when there's no
            // Cancel button, and the no-tabbable-children ("container") trap case.
            // tabIndex={-1} keeps it programmatically focusable without putting it
            // in the Tab order (getFocusableElements excludes [tabindex="-1"]).
            tabIndex={-1}
          >
            {/* Animation slot — single admin-configured category animation */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: ANIMATION_DISPLAY_SIZE_PX, height: ANIMATION_DISPLAY_SIZE_PX }}
              aria-hidden="true"
            >
              {AnimationSlot}
            </div>

            {/* Label */}
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground tracking-wide">
                {ANALYST_BRAND}
              </p>
              {opts.message && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {opts.message}
                </p>
              )}
            </div>

            {/* Optional cancel */}
            {opts.onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  opts.onCancel?.();
                  hide();
                }}
                className="text-xs text-muted-foreground"
                data-testid="agent-waiting-overlay-cancel"
              >
                Cancel
              </Button>
            )}
          </motion.div>

          {/* SR announcement */}
          <span className="sr-only" role="status">
            {ANALYST_BRAND} is working
            {opts.message ? `: ${opts.message}` : ""}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
