import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Send, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const BATCH_SIZE = 30;

const PointsManager = () => {
  const { toast } = useToast();
  const { userEmail: adminEmail } = useAdmin();

  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesHasMore, setActivitiesHasMore] = useState(false);

  const [grantPoints, setGrantPoints] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [granting, setGranting] = useState(false);

  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [allHasMore, setAllHasMore] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title: string; desc: string; action: () => void }>({
    title: "", desc: "", action: () => {},
  });

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    setUserActivities([]);

    const normalized = searchEmail.trim().toLowerCase();

    const { data: score } = await supabase.from("leaderboard_scores").select("*").eq("email", normalized).maybeSingle();
    const { data: profile } = await supabase.from("profiles").select("*").ilike("email", normalized).maybeSingle();
    const { data: waitlist } = await supabase.from("waitlist_submissions").select("email, points, created_at").ilike("email", normalized).maybeSingle();

    if (!score && !profile && !waitlist) {
      toast({ title: "Not found", description: "No user found with that email.", variant: "destructive" });
      setSearching(false);
      return;
    }

    setSearchResult({
      email: normalized,
      display_name: score?.display_name || profile?.name || normalized,
      total_xp: score?.total_xp || 0,
      waitlist_xp: score?.waitlist_xp || 0,
      validation_xp: score?.validation_xp || 0,
      contribution_xp: score?.contribution_xp || 0,
      referral_count: profile?.referral_count || 0,
      waitlist_completed: profile?.waitlist_completed || !!waitlist,
    });

    await fetchUserActivities(normalized, 0, false);
    setSearching(false);
  };

  const fetchUserActivities = async (email: string, offset: number, append: boolean) => {
    setLoadingActivities(true);
    const { data } = await supabase.from("user_activities").select("*").eq("user_email", email).order("created_at", { ascending: false }).range(offset, offset + BATCH_SIZE - 1);
    const fetched = data || [];
    if (append) setUserActivities(prev => [...prev, ...fetched]);
    else setUserActivities(fetched);
    setActivitiesHasMore(fetched.length === BATCH_SIZE);
    setLoadingActivities(false);
  };

  const handleGrantPoints = async () => {
    if (!searchResult || !grantPoints || parseInt(grantPoints) === 0) return;
    setGranting(true);

    const points = parseInt(grantPoints);
    const description = grantReason.trim() || `Admin granted ${points} XP`;

    const { error } = await supabase.from("user_activities").insert({
      user_email: searchResult.email,
      activity_type: "admin_grant",
      description,
      points,
      metadata: { granted_by: adminEmail },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${points > 0 ? "+" : ""}${points} XP granted`, description: `To ${searchResult.email}` });
      setGrantPoints("");
      setGrantReason("");
      setTimeout(() => handleSearch(), 500);
    }
    setGranting(false);
  };

  const fetchAllActivities = async (offset: number, append: boolean) => {
    setLoadingAll(true);
    const { data } = await supabase.from("user_activities").select("*").order("created_at", { ascending: false }).range(offset, offset + BATCH_SIZE - 1);
    const fetched = data || [];
    if (append) setAllActivities(prev => [...prev, ...fetched]);
    else setAllActivities(fetched);
    setAllHasMore(fetched.length === BATCH_SIZE);
    setLoadingAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    fetchAllActivities(0, false);
  };

  const activityBadge = (type: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      waitlist: { label: "Waitlist", cls: "bg-blue-500/20 text-blue-400" },
      validation: { label: "Validation", cls: "bg-purple-500/20 text-purple-400" },
      contribution: { label: "Contribution", cls: "bg-green-500/20 text-green-400" },
      task: { label: "Task", cls: "bg-yellow-500/20 text-yellow-400" },
      admin_grant: { label: "Admin", cls: "bg-primary/20 text-primary" },
      referral: { label: "Referral", cls: "bg-pink-500/20 text-pink-400" },
    };
    const s = map[type] || { label: type, cls: "bg-muted text-muted-foreground" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Points Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">Search users, view activities, and allocate XP.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search user by email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-9 h-10 text-sm" />
          </div>
          <Button onClick={handleSearch} disabled={searching} size="sm" className="h-10 px-4">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {searchResult && (
        <div className="space-y-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-foreground">{searchResult.display_name}</p>
                <p className="text-xs text-muted-foreground">{searchResult.email}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{searchResult.total_xp} XP</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{searchResult.waitlist_xp}</p>
                <p className="text-[10px] text-muted-foreground">Waitlist</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{searchResult.validation_xp}</p>
                <p className="text-[10px] text-muted-foreground">Validation</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{searchResult.contribution_xp}</p>
                <p className="text-[10px] text-muted-foreground">Contributions</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{searchResult.referral_count}</p>
                <p className="text-[10px] text-muted-foreground">Referrals</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" /> Allocate Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input type="number" placeholder="Points (e.g. 50 or -10)" value={grantPoints} onChange={(e) => setGrantPoints(e.target.value)} className="h-9 text-sm" />
              <Input placeholder="Reason (required)" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} className="h-9 text-sm" />
              <Button size="sm" className="h-9" disabled={granting || !grantPoints || !grantReason.trim()}
                onClick={() => {
                  setConfirmData({
                    title: `Grant ${grantPoints} XP`,
                    desc: `Grant ${grantPoints} XP to ${searchResult.email} for "${grantReason}"? This will be logged and reflected immediately.`,
                    action: handleGrantPoints,
                  });
                  setConfirmOpen(true);
                }}>
                {granting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />} Grant
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> User Activity Log
              </h3>
            </div>
            {loadingActivities && userActivities.length === 0 ? (
              <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
            ) : userActivities.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No activities recorded.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Description</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Points</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivities.map((a) => (
                        <tr key={a.id} className="border-b border-border/30">
                          <td className="p-3">{activityBadge(a.activity_type)}</td>
                          <td className="p-3 text-foreground text-xs max-w-[200px] truncate">{a.description}</td>
                          <td className="p-3">
                            <span className={`font-semibold ${a.points >= 0 ? "text-green-400" : "text-destructive"}`}>
                              {a.points > 0 ? "+" : ""}{a.points}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">{new Date(a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {activitiesHasMore && (
                  <div className="p-3 text-center border-t border-border/30">
                    <Button variant="ghost" size="sm" onClick={() => fetchUserActivities(searchResult.email, userActivities.length, true)} disabled={loadingActivities}>
                      {loadingActivities && <Loader2 className="w-3 h-3 mr-1 animate-spin" />} Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-6">
        {!showAll ? (
          <Button variant="outline" onClick={handleShowAll} className="w-full">
            <History className="w-4 h-4 mr-2" /> View All Activities
          </Button>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">All Activities (Recent)</h3>
            </div>
            {loadingAll && allActivities.length === 0 ? (
              <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Description</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Points</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allActivities.map((a) => (
                        <tr key={a.id} className="border-b border-border/30">
                          <td className="p-3 text-foreground text-xs">{a.user_email}</td>
                          <td className="p-3">{activityBadge(a.activity_type)}</td>
                          <td className="p-3 text-foreground text-xs max-w-[200px] truncate hidden md:table-cell">{a.description}</td>
                          <td className="p-3">
                            <span className={`font-semibold ${a.points >= 0 ? "text-green-400" : "text-destructive"}`}>
                              {a.points > 0 ? "+" : ""}{a.points}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {allHasMore && (
                  <div className="p-3 text-center border-t border-border/30">
                    <Button variant="ghost" size="sm" onClick={() => fetchAllActivities(allActivities.length, true)} disabled={loadingAll}>
                      {loadingAll && <Loader2 className="w-3 h-3 mr-1 animate-spin" />} Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmData.title}
        description={confirmData.desc}
        confirmLabel="Grant"
        variant="default"
        onConfirm={confirmData.action}
      />
    </div>
  );
};

export default PointsManager;
