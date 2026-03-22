import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Mail, ClipboardList, LogOut, Home, Menu, X, ListChecks, Award, Coins,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Points Manager", to: "/admin/points", icon: Coins },
  { label: "Waitlist", to: "/admin/waitlist", icon: Users },
  { label: "Waitlist Tasks", to: "/admin/tasks", icon: ListChecks },
  { label: "Contribute Tasks", to: "/admin/contribute-tasks", icon: Award },
  { label: "Validations", to: "/admin/validations", icon: ClipboardList },
  { label: "Contacts", to: "/admin/contacts", icon: Mail },
  { label: "Whitepaper", to: "/admin/whitepaper", icon: ClipboardList },
  { label: "Contributions", to: "/admin/contributions", icon: Users },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { loading, userEmail, signOut } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img src={logo} alt="RaidFi" className="w-8 h-8" />
            <div>
              <p className="font-semibold text-foreground text-sm">Admin Panel</p>
              <p className="text-xs text-muted-foreground">RaidFi</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">Management</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}
              className={() => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.to, item.end) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1 shrink-0">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Home className="w-4 h-4" /> Back to Site
          </NavLink>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground"><Menu className="w-5 h-5" /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
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
