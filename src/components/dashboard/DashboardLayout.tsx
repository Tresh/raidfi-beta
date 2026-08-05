import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Signal,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  Loader2,
  Bell,
  Gift,
  MessageSquareWarning,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ContributeFab from "@/components/dashboard/ContributeFab";
import logo from "/logo.png";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Contributions", to: "/dashboard/contributions", icon: Signal },
  { label: "Reputation", to: "/dashboard/reputation", icon: ShieldCheck },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Referrals", to: "/dashboard/referrals", icon: Gift },
  { label: "Feedback", to: "/dashboard/feedback", icon: MessageSquareWarning },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];



const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { loading, session, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
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
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto min-h-0">
          <p className="px-3 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            Intelligence
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                isActive(item.to, item.end)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2.5 border-t border-border space-y-0.5 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to site
          </a>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background/95 backdrop-blur sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-xs text-muted-foreground">
            Contribution intelligence workspace
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/explore"
              aria-label="Notifications"
              className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-4 h-4" />
            </a>
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
