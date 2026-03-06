import { useEffect } from "react";

interface PageSEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Hook to set per-page SEO meta tags dynamically.
 * Updates document.title and meta description/OG tags when a marketing page mounts.
 * Restores the default title on unmount.
 */
export function usePageSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
}: PageSEOOptions) {
  useEffect(() => {
    const prevTitle = document.title;

    // Set page title
    document.title = title;

    // Update meta description
    if (description) {
      let meta = document.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement | null;
      const prevDescription = meta?.content;
      if (meta) {
        meta.content = description;
      }

      // Update OG tags
      const ogTitleMeta = document.querySelector(
        'meta[property="og:title"]',
      ) as HTMLMetaElement | null;
      const ogDescMeta = document.querySelector(
        'meta[property="og:description"]',
      ) as HTMLMetaElement | null;
      const twitterTitleMeta = document.querySelector(
        'meta[name="twitter:title"]',
      ) as HTMLMetaElement | null;
      const twitterDescMeta = document.querySelector(
        'meta[name="twitter:description"]',
      ) as HTMLMetaElement | null;

      const prevOgTitle = ogTitleMeta?.content;
      const prevOgDesc = ogDescMeta?.content;
      const prevTwitterTitle = twitterTitleMeta?.content;
      const prevTwitterDesc = twitterDescMeta?.content;

      if (ogTitleMeta) ogTitleMeta.content = ogTitle || title;
      if (ogDescMeta) ogDescMeta.content = ogDescription || description;
      if (twitterTitleMeta) twitterTitleMeta.content = ogTitle || title;
      if (twitterDescMeta)
        twitterDescMeta.content = ogDescription || description;

      // Update canonical
      const canonicalLink = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null;
      const prevCanonical = canonicalLink?.href;
      if (canonicalLink && canonical) {
        canonicalLink.href = canonical;
      }

      // Cleanup: restore previous values
      return () => {
        document.title = prevTitle;
        if (meta && prevDescription !== undefined)
          meta.content = prevDescription;
        if (ogTitleMeta && prevOgTitle !== undefined)
          ogTitleMeta.content = prevOgTitle;
        if (ogDescMeta && prevOgDesc !== undefined)
          ogDescMeta.content = prevOgDesc;
        if (twitterTitleMeta && prevTwitterTitle !== undefined)
          twitterTitleMeta.content = prevTwitterTitle;
        if (twitterDescMeta && prevTwitterDesc !== undefined)
          twitterDescMeta.content = prevTwitterDesc;
        if (canonicalLink && prevCanonical !== undefined)
          canonicalLink.href = prevCanonical;
      };
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, canonical, ogTitle, ogDescription]);
}
