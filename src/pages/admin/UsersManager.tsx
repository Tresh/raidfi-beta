import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Shield, ShieldCheck, ShieldX, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PERMISSIONS } from "@/hooks/useAdmin";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type AppRole = "admin" | "moderator" | "user";

const ROLE_BADGES: Record<string, { label: string; cls: string; icon: typeof Shield }> = {
  admin: { label: "Admin", cls: "bg-red-500/20 text-red-400", icon: ShieldCheck },
  moderator: { label: "Moderator", cls: "bg-yellow-500/20 text-yellow-400", icon: Shield },
  user: { label: "User", cls: "bg-blue-500/20 text-blue-400", icon: Shield },
};

const UsersManager = () => {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [userResult, setUserResult] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [addingRole, setAddingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>("moderator");
  const [savingPerms, setSavingPerms] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; desc: string; action: () => void }>({
    title: "", desc: "", action: () => {},
  });

  const askConfirm = (title: string, desc: string, action: () => void) => {
    setConfirmAction({ title, desc, action });
    setConfirmOpen(true);
  };

  const isModerator = userRoles.some(r => r.role === "moderator");
  const isTargetAdmin = userRoles.some(r => r.role === "admin");

  const [staff, setStaff] = useState<{ user_id: string; role: string; name: string | null; email: string }[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "moderator", "super_admin"] as any);
    const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
    let profileMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .in("user_id", ids);
      profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, p]));
    }
    setStaff(
      (roles ?? []).map((r: any) => ({
        user_id: r.user_id,
        role: r.role,
        name: profileMap[r.user_id]?.name ?? null,
        email: profileMap[r.user_id]?.email ?? "Unknown email",
      })),
    );
    setStaffLoading(false);
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleSearch = async (emailOverride?: string) => {
    const raw = emailOverride ?? searchEmail;
    if (!raw.trim()) return;
    if (emailOverride) setSearchEmail(emailOverride);
    setSearching(true);
    setUserResult(null);
    setUserRoles([]);
    setUserPermissions([]);

    const normalized = raw.trim().toLowerCase();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", normalized)
      .maybeSingle();

    if (!profile) {
      toast({ title: "Not found", description: "No user profile found with that email.", variant: "destructive" });
      setSearching(false);
      return;
    }

    setUserResult(profile);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", profile.user_id);
    setUserRoles(roles || []);

    // Fetch permissions
    const { data: perms } = await supabase
      .from("moderator_permissions" as any)
      .select("permission")
      .eq("user_id", profile.user_id);
    setUserPermissions((perms || []).map((p: any) => p.permission));

    setSearching(false);
  };

  const handleAddRole = async () => {
    if (!userResult) return;
    if (userRoles.some(r => r.role === selectedRole)) {
      toast({ title: "Already assigned", description: `User already has the ${selectedRole} role.`, variant: "destructive" });
      return;
    }

    setAddingRole(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: userResult.user_id,
      role: selectedRole,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role assigned", description: `${selectedRole} role added.` });
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userResult.user_id);
      setUserRoles(roles || []);
      loadStaff();
    }
    setAddingRole(false);
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setUserRoles(prev => prev.filter(r => r.id !== roleId));
      if (roleName === "moderator") {
        // Also clear permissions
        await supabase.from("moderator_permissions" as any).delete().eq("user_id", userResult.user_id);
        setUserPermissions([]);
      }
      toast({ title: "Role removed", description: `${roleName} role removed.` });
    }
  };

  const togglePermission = (key: string) => {
    setUserPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async () => {
    if (!userResult) return;
    setSavingPerms(true);

    // Delete all existing permissions for this user
    await supabase.from("moderator_permissions" as any).delete().eq("user_id", userResult.user_id);

    // Insert new permissions
    if (userPermissions.length > 0) {
      const rows = userPermissions.map(p => ({
        user_id: userResult.user_id,
        permission: p,
      }));
      const { error } = await supabase.from("moderator_permissions" as any).insert(rows as any);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSavingPerms(false);
        return;
      }
    }

    toast({ title: "Permissions saved", description: `Updated permissions for ${userResult.email}.` });
    setSavingPerms(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Roles & Permissions</h1>
        <p className="text-muted-foreground text-sm mt-1">Search users, assign roles, and configure moderator access.</p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search user by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={searching} size="sm" className="h-10 px-4">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {/* Admins & moderators */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Admins & moderators</h2>
          <span className="text-xs text-muted-foreground">{staff.length} total</span>
        </div>
        {staffLoading ? (
          <div className="py-6 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
        ) : staff.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No admins or moderators yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {staff.map((s) => (
              <button
                key={`${s.user_id}-${s.role}`}
                onClick={() => handleSearch(s.email)}
                className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{s.name || s.email}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">
                  {s.role.replace("_", " ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>


      {userResult && (
        <div className="space-y-4">
          {/* User info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-foreground">{userResult.name || "Unnamed"}</p>
                <p className="text-xs text-muted-foreground">{userResult.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-xs text-foreground font-mono">{userResult.user_id.slice(0, 12)}...</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{userResult.total_points || 0}</p>
                <p className="text-[10px] text-muted-foreground">Total XP</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{userResult.referral_count || 0}</p>
                <p className="text-[10px] text-muted-foreground">Referrals</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{userResult.waitlist_completed ? "Yes" : "No"}</p>
                <p className="text-[10px] text-muted-foreground">Waitlist</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground">{new Date(userResult.created_at).toLocaleDateString()}</p>
                <p className="text-[10px] text-muted-foreground">Joined</p>
              </div>
            </div>
          </div>

          {/* Current Roles */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Current Roles
            </h3>
            {userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles assigned. User has default permissions only.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((r) => {
                  const badge = ROLE_BADGES[r.role] || ROLE_BADGES.user;
                  return (
                    <div key={r.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${badge.cls}`}>
                      <badge.icon className="w-3.5 h-3.5" />
                      {badge.label}
                      <button
                        onClick={() => askConfirm(
                          "Remove Role",
                          `Remove the "${r.role}" role from ${userResult.email}? This will revoke their ${r.role} permissions immediately.${r.role === "moderator" ? " All page permissions will also be removed." : ""}`,
                          () => handleRemoveRole(r.id, r.role)
                        )}
                        className="ml-1 hover:opacity-70"
                      >
                        <ShieldX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Role */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Assign Role
            </h3>
            <div className="flex gap-3 items-center">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                className="h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                size="sm"
                className="h-9"
                disabled={addingRole}
                onClick={() => askConfirm(
                  "Assign Role",
                  `Assign "${selectedRole}" role to ${userResult.email}? ${
                    selectedRole === "admin" ? "⚠️ This grants FULL admin access to the entire platform." :
                    selectedRole === "moderator" ? "This grants moderation privileges. You can configure specific page access below." :
                    "This assigns the basic user role."
                  }`,
                  handleAddRole
                )}
              >
                {addingRole ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                Assign
              </Button>
            </div>
          </div>

          {/* Moderator Permissions - only show for moderators */}
          {isModerator && !isTargetAdmin && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Page Permissions
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Select which admin pages this moderator can access. They will only see these in their sidebar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {ADMIN_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={userPermissions.includes(perm.key)}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                    <span className="text-sm text-foreground">{perm.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => askConfirm(
                    "Save Permissions",
                    `Update page access for ${userResult.email}? They will ${userPermissions.length === 0 ? "have no page access" : `be able to access: ${userPermissions.join(", ")}`}.`,
                    handleSavePermissions
                  )}
                  disabled={savingPerms}
                >
                  {savingPerms ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save Permissions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setUserPermissions(ADMIN_PERMISSIONS.map(p => p.key))}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setUserPermissions([])}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {isTargetAdmin && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 inline mr-1 text-primary" />
                Admins have full access to all pages. No permission configuration needed.
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction.title}
        description={confirmAction.desc}
        confirmLabel={confirmAction.title.includes("Remove") ? "Remove" : confirmAction.title.includes("Save") ? "Save" : "Assign"}
        variant={confirmAction.title.includes("Remove") ? "destructive" : "default"}
        onConfirm={confirmAction.action}
      />
    </div>
  );
};

export default UsersManager;
