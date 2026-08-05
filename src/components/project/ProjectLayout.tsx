import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Megaphone, BarChart3, Settings as SettingsIcon, Menu, X, Home, Loader2, LogOut } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";


const navItems = [
  { label: "Overview", to: "/project", icon: LayoutDashboard, end: true },
  { label: "Contributors", to: "/project/contributors", icon: Users },
  { label: "Campaigns", to: "/project/campaigns", icon: Megaphone },
  { label: "Analytics", to: "/project/analytics", icon: BarChart3 },
  { label: "Settings", to: "/project/settings", icon: SettingsIcon },
];

const ProjectLayout = ({ children }: { children: ReactNode }) => {
  const { loading, project, role } = useProject();
  const [open, setOpen] = useState(false);
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
            This account isn't linked to a project. Request project access from the homepage — once approved, your
            workspace shows up here.
          </p>
          <a href="/" className="text-sm text-primary underline underline-offset-4">Back to RaidFi</a>
        </div>
      </div>
    );
  }

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{project.name}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{role ?? "member"} · project workspace</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
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

        <div className="p-3 border-t border-border space-y-0.5">
          <a href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground">
            <Home className="w-4 h-4" /> Back to site
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>


      <div className="flex-1 lg:ml-60 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="text-muted-foreground"><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-semibold text-foreground truncate">{project.name}</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
};

export default ProjectLayout;
