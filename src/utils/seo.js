/**
 * SEO & Open Graph dynamic metadata helper.
 * Updates document.title, description, canonical link, and Open Graph tags on client route transitions.
 */

export const SITE_ORIGIN = 'https://www.ighifari.my.id';

export const updateDocumentMetadata = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = '/portfolio.png',
  ogType = 'website',
} = {}) => {
  if (typeof document === 'undefined') return;

  const resolvedCanonical = canonicalUrl || canonicalPath || '/';

  // 1. Update Title
  if (title) {
    document.title = title;
  }

  // 2. Helper to set or create <meta> tag
  const setMeta = (attribute, name, content) => {
    if (!content) return;
    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
    tag.content = content;
  };

  // 3. Meta Description
  if (description) {
    setMeta('name', 'description', description);
  }

  // 4. Open Graph Tags
  setMeta('property', 'og:title', ogTitle || title);
  setMeta('property', 'og:description', ogDescription || description);
  setMeta('property', 'og:type', ogType);

  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_ORIGIN}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  setMeta('property', 'og:image', fullOgImage);

  const fullCanonicalUrl = resolvedCanonical.startsWith('http')
    ? resolvedCanonical
    : `${SITE_ORIGIN}${resolvedCanonical.startsWith('/') ? '' : '/'}${resolvedCanonical}`;
  setMeta('property', 'og:url', fullCanonicalUrl);

  // 5. Canonical Link Tag
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', fullCanonicalUrl);
  linkCanonical.href = fullCanonicalUrl;
};
