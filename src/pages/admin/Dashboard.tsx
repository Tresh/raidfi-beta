import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, ClipboardList, TrendingUp } from "lucide-react";

interface Stats {
  waitlistCount: number;
  validationCount: number;
  contactCount: number;
  totalPoints: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    waitlistCount: 0,
    validationCount: 0,
    contactCount: 0,
    totalPoints: 0,
  });
  const [recentWaitlist, setRecentWaitlist] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [waitlist, validations, contacts] = await Promise.all([
        supabase.from("waitlist_submissions").select("id, email, points, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("validation_submissions").select("id", { count: "exact" }),
        supabase.from("contact_submissions").select("id, name, subject, status, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        waitlistCount: waitlist.count || 0,
        validationCount: validations.count || 0,
        contactCount: contacts.count || 0,
        totalPoints: 0, // Avoid loading all rows just for sum
      });

      setRecentWaitlist(waitlist.data || []);
      setRecentContacts(contacts.data || []);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Waitlist Signups", value: stats.waitlistCount, icon: Users, color: "text-primary" },
    { label: "Form Completions", value: stats.validationCount, icon: ClipboardList, color: "text-green-400" },
    { label: "Contact Messages", value: stats.contactCount, icon: Mail, color: "text-amber-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Recent Waitlist Signups</h2>
          {recentWaitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <div className="space-y-3">
              {recentWaitlist.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{r.email}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">{r.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Recent Contact Messages</h2>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "new" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
