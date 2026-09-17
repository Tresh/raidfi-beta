import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PanelLeftClose, Pin } from "lucide-react";

import { cn } from "@/lib/utils";
import { motionTokens, springs } from "@/lib/motion";

const HOVER_CLOSE_DELAY_MS = motionTokens.duration.instant * 1000;

interface DesktopNavigationRailProps {
  children: (expanded: boolean) => React.ReactNode;
  className?: string;
  label: string;
  locked: boolean;
}

export function DesktopNavigationRail({
  children,
  className,
  label,
  locked,
}: DesktopNavigationRailProps) {
  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const expanded = locked || hovered || focusWithin;

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  React.useEffect(() => clearCloseTimer, [clearCloseTimer]);

  return (
    <motion.aside
      aria-label={label}
      data-state={locked ? "locked" : expanded ? "open" : "collapsed"}
      initial={false}
      animate={{ x: expanded ? 0 : -motionTokens.distance.sidebarReveal }}
      transition={reduceMotion ? { duration: 0 } : springs.snappy}
      onPointerEnter={() => {
        clearCloseTimer();
        setHovered(true);
      }}
      onPointerLeave={() => {
        clearCloseTimer();
        closeTimer.current = setTimeout(() => setHovered(false), HOVER_CLOSE_DELAY_MS);
      }}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden w-[15.5rem] flex-col overflow-hidden rounded-r-lg border-r border-border bg-card shadow-sm will-change-transform lg:flex",
        className,
      )}
    >
      {children(expanded)}
    </motion.aside>
  );
}

export function DesktopNavigationLockButton({
  expanded,
  locked,
  onLockedChange,
}: {
  expanded: boolean;
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
}) {
  const label = locked ? "Unlock and collapse sidebar" : "Keep sidebar open";
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden={!expanded}
      initial={false}
      animate={{ opacity: expanded ? 1 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: motionTokens.duration.fast,
              ease: motionTokens.easing.smooth,
              delay: expanded ? motionTokens.duration.instant : 0,
            }
      }
      className={cn(
        "absolute right-2.5 flex w-8 shrink-0 items-center",
        expanded ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={locked}
        title={label}
        tabIndex={expanded ? 0 : -1}
        disabled={!expanded}
        onClick={() => onLockedChange(!locked)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {locked ? (
          <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Pin aria-hidden="true" className="h-4 w-4" />
        )}
      </button>
    </motion.span>
  );
}

export function DesktopNavigationIcon({
  expanded,
  children,
  className,
}: {
  expanded: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{ x: expanded ? 0 : motionTokens.distance.sidebarReveal }}
      transition={reduceMotion ? { duration: 0 } : springs.snappy}
      className={cn("flex shrink-0 items-center justify-center will-change-transform", className)}
    >
      {children}
    </motion.span>
  );
}

export function DesktopNavigationLabel({
  expanded,
  children,
  className,
}: {
  expanded: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden={!expanded}
      initial={false}
      animate={{ opacity: expanded ? 1 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: motionTokens.duration.fast,
              ease: motionTokens.easing.smooth,
              delay: expanded ? motionTokens.duration.instant : 0,
            }
      }
      className={cn("min-w-0 overflow-hidden whitespace-nowrap", className)}
    >
      {children}
    </motion.span>
  );
}
