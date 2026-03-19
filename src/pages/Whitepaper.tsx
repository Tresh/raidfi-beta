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


const Whitepaper = () => {
  const [whitepaper, setWhitepaper] = useState<WhitepaperData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const cached = getCached();

      // Show cached immediately while we check for updates
      if (cached) {
        setWhitepaper(cached.data);
        setLoading(false);
      }

      // Always fetch latest metadata
      const { data: meta } = await supabase
        .from("whitepaper")
        .select("version, updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!meta) {
        setLoading(false);
        return;
      }

      // If cache matches, we're done
      if (
        cached &&
        cached.data.version === meta.version &&
        cached.data.updated_at === meta.updated_at
      ) {
        setLoading(false);
        return;
      }

      // Cache is stale or missing — fetch full content
      const { data: full } = await supabase
        .from("whitepaper")
        .select("content, version, updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (full) {
        const wpData: WhitepaperData = {
          content: full.content,
          version: full.version,
          updated_at: full.updated_at,
        };
        setWhitepaper(wpData);
        setCache(wpData);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : !whitepaper ? (
          <p className="text-center text-muted-foreground py-20">Whitepaper not available.</p>
        ) : (
          <>
            <article className="prose prose-invert max-w-none whitepaper-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => {
                    if (href?.startsWith('#')) {
                      return (
                        <a href={href} onClick={(e) => { e.preventDefault(); const el = document.getElementById(href.slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                          className="text-primary hover:underline cursor-pointer" {...props}>{children}</a>
                      );
                    }
                    return <a href={href} {...props}>{children}</a>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.map(c => typeof c === 'string' ? c : '').join('') : '';
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
