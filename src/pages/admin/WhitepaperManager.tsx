import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Plus, Eye, History, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhitepaperRow {
  id: string;
  content: string;
  version: string;
  is_published: boolean;
  updated_at: string;
  created_at: string;
}

interface Changelog {
  id: string;
  version: string;
  description: string;
  created_at: string;
}

const WhitepaperManager = () => {
  const { toast } = useToast();
  const [allVersions, setAllVersions] = useState<WhitepaperRow[]>([]);
  const [whitepaper, setWhitepaper] = useState<WhitepaperRow | null>(null);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChangeDesc, setNewChangeDesc] = useState("");
  const [newChangeVersion, setNewChangeVersion] = useState("");
  const [preview, setPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [wpRes, clRes] = await Promise.all([
      supabase.from("whitepaper" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("whitepaper_changelogs" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if (wpRes.data) {
      const versions = wpRes.data as any as WhitepaperRow[];
      setAllVersions(versions);
      if (versions.length > 0 && !whitepaper) {
        setWhitepaper(versions[0]);
        setContent(versions[0].content);
        setVersion(versions[0].version);
      }
    }
    if (clRes.data) setChangelogs(clRes.data as any);
    setLoading(false);
  };

  const loadVersion = (wp: WhitepaperRow) => {
    setWhitepaper(wp);
    setContent(wp.content);
    setVersion(wp.version);
    setShowHistory(false);
  };

  const handleSave = async () => {
    if (!whitepaper) return;
    setSaving(true);
    const { error } = await supabase
      .from("whitepaper" as any)
      .update({ content, version, updated_at: new Date().toISOString() } as any)
      .eq("id", whitepaper.id);
    
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Whitepaper saved" });
      const updated = { ...whitepaper, content, version, updated_at: new Date().toISOString() };
      setWhitepaper(updated);
      setAllVersions(prev => prev.map(v => v.id === updated.id ? updated : v));
    }
    setSaving(false);
  };

  const handleAddChangelog = async () => {
    if (!newChangeDesc.trim() || !newChangeVersion.trim()) return;
    const { error } = await supabase
      .from("whitepaper_changelogs" as any)
      .insert({ version: newChangeVersion, description: newChangeDesc } as any);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewChangeDesc("");
      setNewChangeVersion("");
      toast({ title: "Changelog added" });
      fetchData();
    }
  };

  const handleDeleteChangelog = async (id: string) => {
    await supabase.from("whitepaper_changelogs" as any).delete().eq("id", id);
    setChangelogs(prev => prev.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (showHistory) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Editor
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Version History</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Saved Versions</h3>
            {allVersions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No versions found.</p>
            ) : (
              <div className="space-y-2">
                {allVersions.map((v) => (
                  <div
                    key={v.id}
                    className={`border border-border/50 rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      whitepaper?.id === v.id ? "border-primary bg-muted/30" : ""
                    }`}
                    onClick={() => loadVersion(v)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono text-primary">v{v.version}</span>
                      <div className="flex items-center gap-2">
                        {v.is_published && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Published</span>
                        )}
                        <span className="text-xs text-muted-foreground/60">
                          {new Date(v.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {v.content.slice(0, 120)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Changelog</h3>
            {changelogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No entries yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {changelogs.map((cl) => (
                  <div key={cl.id} className="border-b border-border/50 pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary">v{cl.version}</span>
                      <span className="text-xs text-muted-foreground/60">
                        {new Date(cl.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cl.description}</p>
                    <button
                      onClick={() => handleDeleteChangelog(cl.id)}
                      className="text-xs text-destructive hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Whitepaper</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit whitepaper content and manage changelogs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-1" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
            <Eye className="w-4 h-4 mr-1" />
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-muted-foreground">Version</label>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground w-24"
              />
            </div>
            {preview ? (
              <div className="prose prose-invert max-w-none p-4 border border-border rounded-lg min-h-[500px] overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-input border border-border rounded-lg p-4 text-sm text-foreground font-mono min-h-[500px] resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Markdown content..."
              />
            )}
          </div>
        </div>

        <div>
          <div className="glass-card rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Add Changelog</h3>
            <input
              value={newChangeVersion}
              onChange={(e) => setNewChangeVersion(e.target.value)}
              placeholder="Version (e.g. 1.1)"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground mb-2"
            />
            <textarea
              value={newChangeDesc}
              onChange={(e) => setNewChangeDesc(e.target.value)}
              placeholder="What changed..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground mb-2 resize-none h-20"
            />
            <Button size="sm" onClick={handleAddChangelog} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Add Entry
            </Button>
          </div>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Recent Changes</h3>
            {changelogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No entries yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {changelogs.slice(0, 5).map((cl) => (
                  <div key={cl.id} className="border-b border-border/50 pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary">v{cl.version}</span>
                      <span className="text-xs text-muted-foreground/60">
                        {new Date(cl.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cl.description}</p>
                  </div>
                ))}
                {changelogs.length > 5 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    View all {changelogs.length} entries →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperManager;
