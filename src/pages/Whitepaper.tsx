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


import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";
import { sanitizeUrl } from "@/lib/utils";

const Whitepaper = () => {
  useSEO({
    title: "Whitepaper - RaidFi",
    description: "RaidFi whitepaper: the architecture, mechanics, and vision behind the Web3 reputation and social intelligence layer.",
    path: "/whitepaper",
  });
  const [whitepaper, setWhitepaper] = useState<WhitepaperData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const result = await (supabase as any)
        .from("whitepaper_live")
        .select("content, version, updated_at")
        .eq("id", "live")
        .maybeSingle();

      const data = (result?.data ?? null) as WhitepaperData | null;
      const error = (result?.error ?? null) as { message?: string } | null;

      if (!mounted) return;

      if (error || !data) {
        setWhitepaper(null);
      } else {
        setWhitepaper({
          content: data.content,
          version: data.version,
          updated_at: data.updated_at,
        });
      }

      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("whitepaper-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whitepaper_live" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : !whitepaper ? (
          <p className="text-center text-muted-foreground py-20">Whitepaper not available.</p>
        ) : (
          <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": "RaidFi Whitepaper", "author": { "@type": "Organization", "name": "RaidFi" }, "publisher": { "@type": "Organization", "name": "RaidFi" }, "description": "RaidFi whitepaper: the architecture, mechanics, and vision behind the Web3 reputation and social intelligence layer.", "url": `${BASE_URL}/whitepaper` }) }} />
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
                    return <a href={sanitizeUrl(href)} {...props}>{children}</a>;
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
      </main>
      <Footer />
    </div>
  );
};

export default Whitepaper;
