import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PanelLeftClose, Pin } from "lucide-react";

import { cn } from "@/lib/utils";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 248;

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
  const reduceMotion = useReducedMotion();
  const expanded = locked || hovered || focusWithin;

  return (
    <motion.aside
      aria-label={label}
      data-state={locked ? "locked" : expanded ? "open" : "collapsed"}
      initial={false}
      animate={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden border-r border-border bg-card shadow-sm lg:flex",
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

  return (
    <span
      aria-hidden={!expanded}
      className={cn(
        "flex shrink-0 items-center overflow-hidden transition-[width,opacity] duration-150 motion-reduce:transition-none",
        expanded ? "w-8 opacity-100" : "w-0 opacity-0",
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
    </span>
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
  return (
    <span
      aria-hidden={!expanded}
      className={cn(
        "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ease-out motion-reduce:transition-none",
        expanded ? "max-w-[176px] opacity-100" : "max-w-0 opacity-0",
        className,
      )}
    >
      {children}
    </span>
  );
}
