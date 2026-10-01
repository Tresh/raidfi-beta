import { ReactNode, useState } from "react";
import { Navigate, NavLink, useLocation } from "react-router-dom";
import {
  Award,
  BarChart3,
  Building2,
  Coins,
  Home,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquareWarning,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  DesktopNavigationIcon,
  DesktopNavigationLabel,
  DesktopNavigationLockButton,
  DesktopNavigationRail,
} from "@/components/ui/desktop-navigation-rail";
import {
  desktopNavigationContentClass,
  desktopNavigationItemClass,
} from "@/components/ui/desktop-navigation-rail.styles";
import { useDesktopNavigationRailLock } from "@/components/ui/desktop-navigation-rail-state";
import { useAdmin } from "@/hooks/useAdmin";
import logo from "@/assets/logo.png";

const allNavItems = [
  { label: "Dashboard", to: "/admin", permKey: "dashboard", icon: LayoutDashboard, end: true },
  { label: "Contributors", to: "/admin/contributors", permKey: "contributors", icon: Users },
  { label: "Manage Projects", to: "/admin/manage-projects", permKey: "manage-projects", icon: Building2 },
  { label: "Project Requests", to: "/admin/projects", permKey: "projects", icon: Building2 },
  { label: "Contributions", to: "/admin/contributions", permKey: "contributions", icon: MessageSquareWarning },
  { label: "Beta Requests", to: "/admin/beta", permKey: "beta", icon: KeyRound },
  { label: "Analytics", to: "/admin/analytics", permKey: "dashboard", icon: BarChart3 },
  { label: "Contribute Tasks", to: "/admin/contribute-tasks", permKey: "contribute-tasks", icon: Award },
  { label: "Tasks & Onboarding", to: "/admin/tasks", permKey: "tasks", icon: ListChecks },
  { label: "Points Manager", to: "/admin/points", permKey: "points", icon: Coins },
  { label: "Reports", to: "/admin/reports", permKey: "reports", icon: MessageSquareWarning },
  { label: "User Roles", to: "/admin/users", permKey: "users", icon: ShieldCheck, adminOnly: true },
  { label: "Contacts", to: "/admin/contacts", permKey: "contacts", icon: Mail },
  { label: "Settings", to: "/admin/settings", permKey: "settings", icon: SettingsIcon, adminOnly: true },
];

const AdminLayout = ({ children, requiredPermission }: { children: ReactNode; requiredPermission?: string }) => {
  const { loading, isAdmin, isModerator, hasPermission, userEmail, signOut } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useDesktopNavigationRailLock();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    const firstAllowed = allNavItems.find((item) => !item.adminOnly && hasPermission(item.permKey));
    return <Navigate to={firstAllowed?.to || "/admin"} replace />;
  }

  const navItems = allNavItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return hasPermission(item.permKey);
  });

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);
  const accessLabel = isAdmin ? "Admin" : "Moderator";

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopNavigationRail label="Administration navigation" locked={sidebarLocked}>
        {(expanded) => (
          <>
            <div className="relative h-16 p-2.5 flex items-center border-b border-border shrink-0">
              <NavLink
                to="/admin"
                aria-label="Admin panel"
                title={expanded ? undefined : "Admin panel"}
                className={desktopNavigationItemClass({ expanded, className: "min-w-0 flex-1" })}
              >
                <DesktopNavigationIcon expanded={expanded}>
                  <img src={logo} alt="" className="w-7 h-7 shrink-0" />
                </DesktopNavigationIcon>
                <DesktopNavigationLabel expanded={expanded} className="flex flex-col items-start leading-tight">
                  <span className="font-semibold text-foreground">Admin Panel</span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{accessLabel}</span>
                </DesktopNavigationLabel>
              </NavLink>
              <DesktopNavigationLockButton
                expanded={expanded}
                locked={sidebarLocked}
                onLockedChange={setSidebarLocked}
              />
            </div>

            <nav aria-label="Administration" className="flex-1 p-2.5 space-y-1 overflow-y-auto min-h-0">
              <div className="h-7 overflow-hidden">
                <DesktopNavigationLabel
                  expanded={expanded}
                  className="block px-3 pt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70"
                >
                  Management
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
                    <DesktopNavigationIcon expanded={expanded}>
                      <item.icon className="w-4 h-4 shrink-0" />
                    </DesktopNavigationIcon>
                    <DesktopNavigationLabel expanded={expanded}>{item.label}</DesktopNavigationLabel>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-2.5 border-t border-border space-y-1 shrink-0">
              <NavLink
                to="/"
                aria-label="Back to site"
                title={expanded ? undefined : "Back to site"}
                className={desktopNavigationItemClass({ expanded })}
              >
                <DesktopNavigationIcon expanded={expanded}>
                  <Home className="w-4 h-4 shrink-0" />
                </DesktopNavigationIcon>
                <DesktopNavigationLabel expanded={expanded}>Back to site</DesktopNavigationLabel>
              </NavLink>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title={expanded ? undefined : "Sign out"}
                className={desktopNavigationItemClass({ expanded, destructive: true })}
              >
                <DesktopNavigationIcon expanded={expanded}>
                  <LogOut className="w-4 h-4 shrink-0" />
                </DesktopNavigationIcon>
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
        aria-label="Administration navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img src={logo} alt="RaidFi" className="w-8 h-8" />
            <div>
              <p className="font-semibold text-foreground text-sm">Admin Panel</p>
              <p className="text-xs text-muted-foreground">{accessLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Administration" className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">Management</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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

        <div className="p-3 border-t border-border space-y-1 shrink-0">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Home aria-hidden="true" className="w-4 h-4" /> Back to Site
          </NavLink>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut aria-hidden="true" className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className={desktopNavigationContentClass({
        locked: sidebarLocked,
        className: "flex-1 flex flex-col min-w-0",
      })}>
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden text-foreground hover:text-primary p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            {isModerator && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-medium">
                MOD
              </span>
            )}
            <span className="text-xs text-muted-foreground">{userEmail}</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
