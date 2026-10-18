import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Eye, History, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DOCS } from "@/lib/docs/content";

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

type Tab = "whitepaper" | "pages";

const DocsManager = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("whitepaper");

  // Whitepaper editor state
  const [allVersions, setAllVersions] = useState<WhitepaperRow[]>([]);
  const [whitepaper, setWhitepaper] = useState<WhitepaperRow | null>(null);
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [newChangeDesc, setNewChangeDesc] = useState("");
  const [newChangeVersion, setNewChangeVersion] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Doc pages editor state
  const [pageSlug, setPageSlug] = useState(DOCS[0].slug);
  const [pageContent, setPageContent] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPageLoaded(false);
    loadPage(pageSlug);
  }, [pageSlug]);

  const fetchData = async () => {
    const [wpRes, clRes] = await Promise.all([
      supabase.from("whitepaper" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("whitepaper_changelogs" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if (wpRes.data && wpRes.data.length > 0) {
      const versions = wpRes.data as any as WhitepaperRow[];
      setAllVersions(versions);
      setWhitepaper(versions[0]);
      setContent(versions[0].content);
      setVersion(versions[0].version);
    }
    if (clRes.data) setChangelogs(clRes.data as any);
    setLoading(false);
  };

  const loadPage = async (slug: string) => {
    const { data, error } = await supabase.from("docs_content").select("body, updated_at").eq("slug", slug).maybeSingle();
    if (error) {
      toast({ title: "Could not load page", description: error.message, variant: "destructive" });
    }
    setPageContent(data?.body ?? getStaticBody(slug));
    setSavedAt(data?.updated_at ?? null);
    setPageLoaded(true);
  };

  const handleSavePage = async () => {
    setSaving(true);
    const { error } = await supabase.from("docs_content").upsert(
      { slug: pageSlug, body: pageContent },
      { onConflict: "slug" }
    );
    if (error) {
      toast({ title: "Error saving page", description: error.message, variant: "destructive" });
    } else {
      const { data } = await supabase.from("docs_content").select("updated_at").eq("slug", pageSlug).maybeSingle();
      setSavedAt(data?.updated_at ?? new Date().toISOString());
      toast({ title: "Page saved" });
    }
    setSaving(false);
  };

  const handleResetPage = async () => {
    const { error } = await supabase.from("docs_content").delete().eq("slug", pageSlug);
    if (error) {
      toast({ title: "Error resetting page", description: error.message, variant: "destructive" });
      return;
    }
    setPageContent(getStaticBody(pageSlug));
    setSavedAt(null);
    toast({ title: "Page reset to built-in content" });
  };

  const getStaticBody = (slug: string) => DOCS.find((d) => d.slug === slug)?.body ?? "";

  const loadVersion = (wp: WhitepaperRow) => {
    setWhitepaper(wp);
    setContent(wp.content);
    setVersion(wp.version);
    setShowHistory(false);
  };

  const handleCreateNewVersion = () => {
    setWhitepaper(null);
    setContent("# New Whitepaper Version\n\nWrite your content here...");
    setVersion("1.0.0");
    setShowHistory(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    let currentId = whitepaper?.id;
    let saveError = null;

    if (currentId) {
      const { error } = await (supabase as any)
        .from("whitepaper")
        .update({ content, version, updated_at: now, is_published: true })
        .eq("id", currentId);
      saveError = error;
    } else {
      const { data, error } = await (supabase as any)
        .from("whitepaper")
        .insert({ content, version, created_at: now, updated_at: now, is_published: true })
        .select()
        .single();
      saveError = error;
      if (data) {
        currentId = data.id;
      }
    }

    if (saveError) {
      toast({ title: "Error saving whitepaper", description: saveError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Sync to whitepaper_live table so the context updates across the site & telegram bot
    const { error: liveError } = await (supabase as any)
      .from("whitepaper_live")
      .upsert({
        id: "live",
        content,
        version,
        updated_at: now,
        source_whitepaper_id: currentId || null,
      });

    await (supabase as any).rpc("refresh_whitepaper_live").catch(() => {});

    if (liveError) {
      toast({ title: "Saved to database, but failed updating live context", description: liveError.message, variant: "destructive" });
    } else {
      toast({ title: "Whitepaper saved & published to live context" });
    }

    await fetchData();
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
          <h1 className="text-2xl font-bold text-foreground">Docs</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit the whitepaper and every docs page in markdown</p>
        </div>
        {tab === "whitepaper" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCreateNewVersion}>
              <Plus className="w-4 h-4 mr-1" /> New Version
            </Button>
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
        )}
        {tab === "pages" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              <Eye className="w-4 h-4 mr-1" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" onClick={handleSavePage} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("whitepaper")}
          className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
            tab === "whitepaper" ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Whitepaper
        </button>
        <button
          type="button"
          onClick={() => setTab("pages")}
          className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
            tab === "pages" ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Doc Pages
        </button>
      </div>

      {tab === "whitepaper" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-muted-foreground">Version</label>
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground w-24"
                />
              </div>
              {preview ? (
                <div className="prose prose-invert max-w-none p-4 border border-border rounded-lg min-h-[500px] overflow-auto whitepaper-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
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
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
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

            <div className="bg-card border border-border rounded-xl p-4">
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
      )}

      {tab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-xl p-3 h-fit">
            <h3 className="font-semibold text-foreground text-sm mb-2 px-1">Pages</h3>
            <div className="space-y-1">
              {DOCS.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setPageSlug(d.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    pageSlug === d.slug
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {d.title}
                  <span className="block text-[10px] text-muted-foreground/60">{d.slug}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {DOCS.find((d) => d.slug === pageSlug)?.title ?? pageSlug}
                  </h3>
                  {savedAt && (
                    <p className="text-[11px] text-muted-foreground/70">
                      Last saved {new Date(savedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleResetPage}>
                  Reset to built-in
                </Button>
                </div>
              {preview ? (
                <div className="prose prose-invert max-w-none p-4 border border-border rounded-lg min-h-[500px] overflow-auto whitepaper-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {pageContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg p-4 text-sm text-foreground font-mono min-h-[500px] resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Markdown content..."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsManager;
