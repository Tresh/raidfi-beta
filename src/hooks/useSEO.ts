import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  ogType?: "website" | "article" | "profile";
}

const BASE_URL = "https://raidfi.site";

export const useSEO = ({ title, description, path, ogType = "website" }: SEOOptions) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string, key: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    if (description) {
      setMeta('meta[name="description"]', "name", description, "description");
      setMeta('meta[property="og:description"]', "property", description, "og:description");
      setMeta('meta[name="twitter:description"]', "name", description, "twitter:description");
    }

    setMeta('meta[property="og:title"]', "property", title, "og:title");
    setMeta('meta[name="twitter:title"]', "name", title, "twitter:title");
    setMeta('meta[property="og:type"]', "property", ogType, "og:type");

    // Canonical + og:url
    const url = `${BASE_URL}${path ?? window.location.pathname}`;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    setMeta('meta[property="og:url"]', "property", url, "og:url");
    setMeta('meta[name="twitter:url"]', "name", url, "twitter:url");
  }, [title, description, path, ogType]);
};
