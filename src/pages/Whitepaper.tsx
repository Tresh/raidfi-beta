import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

interface WhitepaperData {
  content: string;
  version: string;
  updated_at: string;
}

interface Changelog {
  id: string;
  version: string;
  description: string;
  created_at: string;
}

const Whitepaper = () => {
  const [whitepaper, setWhitepaper] = useState<WhitepaperData | null>(null);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [wpRes, clRes] = await Promise.all([
        supabase.from("whitepaper" as any).select("content, version, updated_at").eq("is_published", true).order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("whitepaper_changelogs" as any).select("*").order("created_at", { ascending: false }),
      ]);
      if (wpRes.data) setWhitepaper(wpRes.data as any);
      if (clRes.data) setChangelogs(clRes.data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !whitepaper ? (
          <p className="text-center text-muted-foreground py-20">Whitepaper not available.</p>
        ) : (
          <>
            {changelogs.length > 0 && (
              <div className="mb-8 p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Changelog</p>
                <div className="space-y-2">
                  {changelogs.map((cl) => (
                    <div key={cl.id} className="flex items-start gap-3 text-sm">
                      <span className="text-primary font-mono text-xs mt-0.5">v{cl.version}</span>
                      <span className="text-muted-foreground">{cl.description}</span>
                      <span className="text-muted-foreground/60 text-xs ml-auto shrink-0">
                        {new Date(cl.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <article className="prose prose-invert max-w-none whitepaper-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => {
                    if (href?.startsWith('#')) {
                      return (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            const id = href.slice(1);
                            const el = document.getElementById(id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className="text-primary hover:underline cursor-pointer"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    }
                    return <a href={href} {...props}>{children}</a>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = typeof children === 'string' ? children : 
                      Array.isArray(children) ? children.map(c => typeof c === 'string' ? c : '').join('') : '';
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                }}
              >
                {whitepaper.content}
              </ReactMarkdown>
            </article>

            <div className="mt-12 text-center text-xs text-muted-foreground">
              Version {whitepaper.version} · Last updated {new Date(whitepaper.updated_at).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Whitepaper;
