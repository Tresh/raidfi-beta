import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  title: string;
  detail: string;
  created_at: string;
  url?: string | null;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

const NotificationsBell = ({ email }: { email: string }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      const [{ data: contribs }, { data: acts }] = await Promise.all([
        supabase
          .from("contributions")
          .select("id,post_url,status,points_earned,created_at")
          .ilike("user_email", email)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("user_activities")
          .select("id,description,points,created_at")
          .ilike("user_email", email)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const merged: Item[] = [
        ...(contribs ?? []).map((c: any) => ({
          id: `c-${c.id}`,
          title:
            c.status === "approved"
              ? `Post approved · +${c.points_earned ?? 0} XP`
              : c.status === "rejected"
                ? "Post not accepted"
                : "Post received · awaiting review",
          detail: c.post_url,
          created_at: c.created_at,
          url: c.post_url,
        })),
        ...(acts ?? []).map((a: any) => ({
          id: `a-${a.id}`,
          title: a.description,
          detail: a.points ? `+${a.points} XP` : "",
          created_at: a.created_at,
        })),
      ]
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        .slice(0, 10);

      if (!cancelled) setItems(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
          {items.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-semibold text-foreground">Notifications</p>
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-6 text-xs text-muted-foreground text-center">
            Nothing yet. Updates on your posts show up here.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.map((n) => (
              <li key={n.id} className="px-3 py-2.5">
                <p className="text-[12.5px] text-foreground leading-snug">{n.title}</p>
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline break-all"
                  >
                    {n.detail}
                  </a>
                ) : n.detail ? (
                  <p className="text-[11px] text-muted-foreground">{n.detail}</p>
                ) : null}
                <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
