import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Loader2, Menu } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { DOCS, DOC_SECTIONS, getDoc } from "@/lib/docs/content";
import { sanitizeUrl } from "@/lib/utils";

const SideNav = ({ active, onPick }: { active: string; onPick?: () => void }) => (
  <nav className="space-y-6 text-sm">
    {DOC_SECTIONS.map((s) => (
      <div key={s}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s}</p>
        <ul className="space-y-1">
          {DOCS.filter((d) => d.section === s).map((d) => (
            <li key={d.slug}>
              <Link to={`/docs/${d.slug}`} onClick={onPick}
                className={`block rounded-md px-2 py-1.5 ${active === d.slug ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
    <div className="border-t border-border pt-4">
      <Link to="/changelog" onClick={onPick} className="block px-2 py-1.5 text-muted-foreground hover:text-foreground">Changelog</Link>
    </div>
  </nav>
);

const Docs = () => {
  const { slug = "introduction" } = useParams();
  const doc = getDoc(slug);
  const [open, setOpen] = useState(false);
  const [wp, setWp] = useState<string | null>(null);
  const [wpLoading, setWpLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const loadOverride = useCallback(async (slug: string) => {
    const { data } = await supabase.from("docs_content").select("body").eq("slug", slug).maybeSingle();
    if (data?.body) setOverrides((prev) => ({ ...prev, [slug]: data.body }));
  }, []);

  useEffect(() => { loadOverride(slug); }, [slug, loadOverride]);

  useSEO({ title: `${doc?.title ?? "Docs"} - RaidFi Docs`, description: doc?.summary ?? "RaidFi documentation", path: `/docs/${slug}` });

  useEffect(() => {
    if (slug !== "whitepaper" || wp !== null) return;
    setWpLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("whitepaper_live").select("content").eq("id", "live").maybeSingle()
      .then(({ data }: { data: { content: string } | null }) => { setWp(data?.content ?? "Whitepaper not available."); setWpLoading(false); });
  }, [slug, wp]);

  if (!doc) return <Navigate to="/docs/introduction" replace />;
  const idx = DOCS.indexOf(doc);
  const prev = DOCS[idx - 1], next = DOCS[idx + 1];
  const body = overrides[slug] ?? (slug === "whitepaper" ? wp ?? "" : doc.body);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex gap-10 px-6 pt-24 pb-16">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"><SideNav active={slug} /></div>
        </aside>
        <main className="min-w-0 flex-1 max-w-3xl">
          <div className="mb-6 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <Menu className="h-4 w-4" /> Docs menu
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto pt-10"><SideNav active={slug} onPick={() => setOpen(false)} /></SheetContent>
            </Sheet>
          </div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">{doc.section}</p>
            {wpLoading ? null : (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy this page"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy page"}
              </button>
            )}
          </div>
          {wpLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
            <article className="prose prose-invert max-w-none whitepaper-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={sanitizeUrl(href)}>{children}</a> }}>
                {body}
              </ReactMarkdown>
            </article>
          )}
          <div className="mt-12 flex justify-between gap-4 border-t border-border pt-6 text-sm">
            {prev ? <Link to={`/docs/${prev.slug}`} className="text-muted-foreground hover:text-foreground">← {prev.title}</Link> : <span />}
            {next ? <Link to={`/docs/${next.slug}`} className="text-muted-foreground hover:text-foreground">{next.title} →</Link> : <span />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
