import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
}

const BASE_URL = "https://www.raidfi.site";

export const useSEO = ({ title, description, path }: SEOOptions) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      const setMeta = (selector: string, attr: string, value: string, key: string) => {
        let el = document.head.querySelector<HTMLMetaElement>(selector);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute("content", value);
      };
      setMeta('meta[name="description"]', "name", description, "description");
      setMeta('meta[property="og:description"]', "property", description, "og:description");
      setMeta('meta[name="twitter:description"]', "name", description, "twitter:description");
    }

    // OG/Twitter title
    const ogTitle = document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    const twTitle = document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);

    // Canonical + og:url
    const url = `${BASE_URL}${path ?? window.location.pathname}`;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", url);
    const twUrl = document.head.querySelector<HTMLMetaElement>('meta[name="twitter:url"]');
    if (twUrl) twUrl.setAttribute("content", url);
  }, [title, description, path]);
};
