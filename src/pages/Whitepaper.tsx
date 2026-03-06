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

const CACHE_KEY = "raidfi_whitepaper_cache";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const getCached = (): WhitepaperData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
};

const setCache = (data: WhitepaperData) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
};

const Whitepaper = () => {
  const [whitepaper, setWhitepaper] = useState<WhitepaperData | null>(getCached);
  const [loading, setLoading] = useState(!getCached());

  useEffect(() => {
    const fetchData = async () => {
      const wpRes = await supabase
        .from("whitepaper" as any)
        .select("content, version, updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (wpRes.data) {
        const d = wpRes.data as any;
        // Only update if version changed
        if (!whitepaper || d.version !== whitepaper.version || d.updated_at !== whitepaper.updated_at) {
          setWhitepaper(d);
          setCache(d);
        }
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
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
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
