import { cn } from "@/lib/utils";

export function desktopNavigationItemClass({
  expanded,
  active = false,
  destructive = false,
  className,
}: {
  expanded: boolean;
  active?: boolean;
  destructive?: boolean;
  className?: string;
}) {
  return cn(
    "group flex min-h-10 w-full items-center rounded-lg text-[13px] font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    expanded ? "justify-start gap-3 px-3" : "justify-center px-0",
    destructive
      ? "text-destructive hover:bg-destructive/10"
      : active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    className,
  );
}
