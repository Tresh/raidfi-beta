import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bot,
  ClipboardCheck,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Users,
  X,
} from "lucide-react";

import {
  DesktopNavigationLabel,
  DesktopNavigationLockButton,
  DesktopNavigationRail,
} from "@/components/ui/desktop-navigation-rail";
import { desktopNavigationItemClass } from "@/components/ui/desktop-navigation-rail.styles";
import { useDesktopNavigationRailLock } from "@/components/ui/desktop-navigation-rail-state";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Overview", to: "/project", icon: LayoutDashboard, end: true },
  { label: "Contributors", to: "/project/contributors", icon: Users },
  { label: "Activity", to: "/project/activity", icon: Activity },
  { label: "Evaluate", to: "/project/evaluate", icon: ClipboardCheck },
  { label: "Analytics", to: "/project/analytics", icon: BarChart3 },
  { label: "AI Analyst", to: "/project/ai", icon: Bot },
  { label: "Settings", to: "/project/settings", icon: SettingsIcon },
];

const ProjectLayout = ({ children, fullBleed = false }: { children: ReactNode; fullBleed?: boolean }) => {
  const { loading, project, role } = useProject();
  const [open, setOpen] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useDesktopNavigationRailLock();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-3">
          <img src={logo} alt="RaidFi" className="w-10 h-10 mx-auto" />
          <h1 className="text-lg font-semibold text-foreground">No project workspace yet</h1>
          <p className="text-sm text-muted-foreground">
            This account isn't linked to a project. Request project access from the homepage - once approved, your
            workspace shows up here.
          </p>
          <a href="/" className="text-sm text-primary underline underline-offset-4">Back to RaidFi</a>
        </div>
      </div>
    );
  }

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);
  const roleLabel = (role ?? "member").replace("_", " ");

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopNavigationRail label="Project navigation" locked={sidebarLocked}>
        {(expanded) => (
          <>
            <div className="h-16 p-2.5 flex items-center gap-1 border-b border-border shrink-0">
              <a
                href="/project"
                aria-label={`${project.name} workspace`}
                title={expanded ? undefined : project.name}
                className={desktopNavigationItemClass({ expanded, className: "min-w-0 flex-1" })}
              >
                <img src={logo} alt="" aria-hidden="true" className="w-7 h-7 shrink-0" />
                <DesktopNavigationLabel expanded={expanded} className="flex flex-col items-start leading-tight">
                  <span className="max-w-[164px] truncate font-semibold text-foreground">{project.name}</span>
                  <span className="mt-0.5 text-[10px] capitalize text-muted-foreground">{roleLabel}</span>
                </DesktopNavigationLabel>
              </a>
              <DesktopNavigationLockButton
                expanded={expanded}
                locked={sidebarLocked}
                onLockedChange={setSidebarLocked}
              />
            </div>

            <nav aria-label="Project workspace" className="flex-1 p-2.5 space-y-1 overflow-y-auto min-h-0">
              <div className={`overflow-hidden transition-all duration-150 motion-reduce:transition-none ${expanded ? "h-7" : "h-2"}`}>
                <DesktopNavigationLabel
                  expanded={expanded}
                  className="block px-3 pt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70"
                >
                  Workspace
                </DesktopNavigationLabel>
              </div>
              {navItems.map((item) => {
                const active = isActive(item.to, item.end);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    aria-label={item.label}
                    title={expanded ? undefined : item.label}
                    className={desktopNavigationItemClass({ expanded, active })}
                  >
                    <item.icon aria-hidden="true" className="w-4 h-4 shrink-0" />
                    <DesktopNavigationLabel expanded={expanded}>{item.label}</DesktopNavigationLabel>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-2.5 border-t border-border space-y-1 shrink-0">
              <a
                href="/"
                aria-label="Back to site"
                title={expanded ? undefined : "Back to site"}
                className={desktopNavigationItemClass({ expanded })}
              >
                <Home aria-hidden="true" className="w-4 h-4 shrink-0" />
                <DesktopNavigationLabel expanded={expanded}>Back to site</DesktopNavigationLabel>
              </a>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title={expanded ? undefined : "Sign out"}
                className={desktopNavigationItemClass({ expanded, destructive: true })}
              >
                <LogOut aria-hidden="true" className="w-4 h-4 shrink-0" />
                <DesktopNavigationLabel expanded={expanded}>Sign out</DesktopNavigationLabel>
              </button>
            </div>
          </>
        )}
      </DesktopNavigationRail>

      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        aria-label="Project navigation"
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{project.name}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground"
            aria-label="Close navigation menu"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Project workspace" className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive(item.to, item.end)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2.5 text-[13px] font-medium">
                <item.icon aria-hidden="true" className="w-4 h-4" />
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2.5 border-t border-border space-y-0.5">
          <a href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted">
            <Home aria-hidden="true" className="w-4 h-4" /> Back to site
          </a>
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-destructive hover:bg-destructive/10"
          >
            <LogOut aria-hidden="true" className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 min-w-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none ${
          sidebarLocked ? "lg:ml-[15.5rem]" : "lg:ml-[4.5rem]"
        }`}
      >
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-muted-foreground"
            aria-label="Open navigation menu"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground truncate">{project.name}</span>
        </header>
        {fullBleed ? (
          <main className="h-[calc(100dvh-3.5rem)] lg:h-dvh overflow-hidden">{children}</main>
        ) : (
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</main>
        )}
      </div>
    </div>
  );
};

export default ProjectLayout;
