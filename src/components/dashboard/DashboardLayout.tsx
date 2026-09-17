import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Signal,
  X,
} from "lucide-react";

import ContributeFab from "@/components/dashboard/ContributeFab";
import NotificationsBell from "@/components/dashboard/NotificationsBell";
import {
  DesktopNavigationLabel,
  DesktopNavigationLockButton,
  DesktopNavigationRail,
} from "@/components/ui/desktop-navigation-rail";
import { desktopNavigationItemClass } from "@/components/ui/desktop-navigation-rail.styles";
import { useDesktopNavigationRailLock } from "@/components/ui/desktop-navigation-rail-state";
import { useAuth } from "@/hooks/useAuth";
import logo from "/logo.png";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Contributions", to: "/dashboard/contributions", icon: Signal },
  { label: "Reputation", to: "/dashboard/reputation", icon: ShieldCheck },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Feedback", to: "/dashboard/feedback", icon: MessageSquareWarning },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { loading, session, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useDesktopNavigationRailLock();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const email = session?.user?.email ?? "";

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopNavigationRail label="Contributor navigation" locked={sidebarLocked}>
        {(expanded) => (
          <>
            <div className="h-14 p-2.5 flex items-center gap-1 border-b border-border shrink-0">
              <a
                href="/"
                aria-label="RaidFi home"
                title={expanded ? undefined : "RaidFi home"}
                className={desktopNavigationItemClass({ expanded, className: "min-w-0 flex-1" })}
              >
                <img src={logo} alt="" aria-hidden="true" className="w-6 h-6 shrink-0" />
                <DesktopNavigationLabel expanded={expanded} className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight text-foreground">RaidFi</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    Beta
                  </span>
                </DesktopNavigationLabel>
              </a>
              <DesktopNavigationLockButton
                expanded={expanded}
                locked={sidebarLocked}
                onLockedChange={setSidebarLocked}
              />
            </div>

            <nav aria-label="Contributor workspace" className="flex-1 p-2.5 space-y-1 overflow-y-auto min-h-0">
              <div className={`overflow-hidden transition-all duration-150 motion-reduce:transition-none ${expanded ? "h-7" : "h-2"}`}>
                <DesktopNavigationLabel
                  expanded={expanded}
                  className="block px-3 pt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70"
                >
                  Intelligence
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

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Contributor navigation"
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="RaidFi" className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-tight text-foreground">RaidFi</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              Beta
            </span>
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground"
            aria-label="Close navigation menu"
          >
            <X aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>

        <nav aria-label="Contributor workspace" className="flex-1 p-2.5 space-y-0.5 overflow-y-auto min-h-0">
          <p className="px-3 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            Intelligence
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive(item.to, item.end)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon aria-hidden="true" className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2.5 border-t border-border space-y-0.5 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Home aria-hidden="true" className="w-4 h-4" />
            Back to site
          </a>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut aria-hidden="true" className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none ${
          sidebarLocked ? "lg:ml-[15.5rem]" : "lg:ml-[4.5rem]"
        }`}
      >
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background/95 backdrop-blur sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-xs text-muted-foreground">
            Contribution intelligence workspace
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationsBell email={email} />
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[200px]">
              {email}
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary">
              {email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        <ContributeFab />
      </div>
    </div>
  );
};

export default DashboardLayout;
