/**
 * SEO, Open Graph, Twitter Cards & Schema.org dynamic metadata helper.
 * Updates document.title, description, canonical link, social tags, and structured data on client route transitions.
 */

export const SITE_ORIGIN = 'https://www.ighifari.my.id';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/portfolio.png`;
export const TWITTER_HANDLE = '@IGhifari';

export const updateDocumentMetadata = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = '/portfolio.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schemaData = null,
  noindex = false,
  lang,
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

  // 3b. Robots noindex directive for non-indexed interactive routes (/play)
  const existingRobots = document.querySelector('meta[name="robots"]');
  if (noindex) {
    setMeta('name', 'robots', 'noindex, nofollow');
  } else if (existingRobots) {
    if (typeof existingRobots.remove === 'function') {
      existingRobots.remove();
    } else if (existingRobots.parentNode && typeof existingRobots.parentNode.removeChild === 'function') {
      existingRobots.parentNode.removeChild(existingRobots);
    }
  }

  // 4. Open Graph Tags
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDesc = ogDescription || description;
  setMeta('property', 'og:title', resolvedOgTitle);
  setMeta('property', 'og:description', resolvedOgDesc);
  setMeta('property', 'og:type', ogType);

  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_ORIGIN}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  setMeta('property', 'og:image', fullOgImage);

  const isEnRoute =
    typeof window !== 'undefined' &&
    (() => {
      const p = (window.location?.pathname || '/').replace(/\/+$/, '') || '/';
      return p === '/en' || p.startsWith('/en/');
    })();

  const rawFullCanonical = resolvedCanonical.startsWith('http')
    ? resolvedCanonical
    : `${SITE_ORIGIN}${resolvedCanonical.startsWith('/') ? '' : '/'}${resolvedCanonical}`;
  const baseRoutePath = (rawFullCanonical.replace(SITE_ORIGIN, '').replace(/^\/en(?=\/|$)/, '') || '/').replace(/\/+$/, '') || '/';
  const idAltHref = `${SITE_ORIGIN}${baseRoutePath}`;
  const enAltHref = baseRoutePath === '/' ? `${SITE_ORIGIN}/en` : `${SITE_ORIGIN}/en${baseRoutePath}`;
  const fullCanonicalUrl = !canonicalUrl && isEnRoute ? enAltHref : rawFullCanonical;

  const activeLang = lang === 'en' || lang === 'id' ? lang : (isEnRoute ? 'en' : 'id');
  setMeta('property', 'og:url', fullCanonicalUrl);
  setMeta('property', 'og:locale', activeLang === 'en' ? 'en_US' : 'id_ID');
  setMeta('property', 'og:locale:alternate', activeLang === 'en' ? 'id_ID' : 'en_US');

  // 5. Canonical Link Tag & Bilingual hreflang Alternates
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', fullCanonicalUrl);
  linkCanonical.href = fullCanonicalUrl;

  const setAlternateLink = (hreflang, href) => {
    let alt = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!alt) {
      alt = document.createElement('link');
      alt.setAttribute('rel', 'alternate');
      alt.setAttribute('hreflang', hreflang);
      document.head.appendChild(alt);
    }
    alt.setAttribute('href', href);
    alt.href = href;
  };
  setAlternateLink('id', idAltHref);
  setAlternateLink('en', enAltHref);
  setAlternateLink('x-default', idAltHref);

  // 6. Twitter Card Tags
  setMeta('name', 'twitter:card', twitterCard);
  setMeta('name', 'twitter:title', resolvedOgTitle);
  setMeta('name', 'twitter:description', resolvedOgDesc);
  setMeta('name', 'twitter:image', fullOgImage);
  setMeta('name', 'twitter:creator', TWITTER_HANDLE);
  setMeta('name', 'twitter:site', TWITTER_HANDLE);

  // 7. Schema.org Structured Data (JSON-LD)
  const existingScript = document.getElementById('schema-structured-data');
  if (schemaData) {
    let scriptTag = existingScript;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  } else if (existingScript) {
    if (typeof existingScript.remove === 'function') {
      existingScript.remove();
    } else if (existingScript.parentNode && typeof existingScript.parentNode.removeChild === 'function') {
      existingScript.parentNode.removeChild(existingScript);
    }
  }
};

/**
 * Generates Schema.org CollectionPage JSON-LD for the case study catalog.
 */
export const generateCaseStudyListSchema = (projects = [], lang = 'id') => {
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '';
  const listUrl = `${SITE_ORIGIN}${prefix}/study-case`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${listUrl}#collection`,
    url: listUrl,
    inLanguage: lang,
    name: isEn
      ? 'Software Engineering Case Studies | M. Ghifari Bima Khadafi'
      : 'Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi',
    description: isEn
      ? 'Directory of software engineering case studies, system architecture, and modern web development by M. Ghifari Bima Khadafi.'
      : 'Direktori studi kasus arsitektur perangkat lunak, perancangan sistem, dan pengembangan web modern oleh M. Ghifari Bima Khadafi.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Portfolio Ghifari',
      url: SITE_ORIGIN,
    },
    about: {
      '@type': 'Person',
      name: 'M. Ghifari Bima Khadafi',
      url: SITE_ORIGIN,
    },
    hasPart: projects.map((p) => ({
      '@type': 'TechArticle',
      name: p.title,
      url: `${SITE_ORIGIN}${prefix}/study-case/${p.id}`,
      description:
        typeof p.description === 'object' ? (p.description[lang] || p.description.id) : p.description,
    })),
  };
};

/**
 * Generates Schema.org TechArticle & SoftwareApplication JSON-LD for individual project case studies.
 */
export const generateCaseStudyDetailSchema = (project, lang = 'id') => {
  if (!project) return null;

  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '';
  const detailUrl = `${SITE_ORIGIN}${prefix}/study-case/${project.id}`;
  const desc =
    typeof project.description === 'object'
      ? (project.description[lang] || project.description.id)
      : project.description;
  const isInternal = project.id === 'project-management';
  const fullImage = project.image
    ? (project.image.startsWith('http') ? project.image : `${SITE_ORIGIN}${project.image}`)
    : DEFAULT_OG_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${detailUrl}#article`,
    url: detailUrl,
    headline: isEn
      ? `${project.title} — Architecture & Software Engineering Case Study`
      : `${project.title} — Studi Kasus Arsitektur & Rekayasa Perangkat Lunak`,
    name: project.title,
    description: desc,
    image: fullImage,
    inLanguage: lang,
    author: {
      '@type': 'Person',
      name: 'M. Ghifari Bima Khadafi',
      url: SITE_ORIGIN,
      jobTitle: 'Web Developer & Software Engineer',
    },
    publisher: {
      '@type': 'Person',
      name: 'M. Ghifari Bima Khadafi',
      url: SITE_ORIGIN,
    },
    about: {
      '@type': 'SoftwareApplication',
      name: project.title,
      applicationCategory: 'WebApplication',
      operatingSystem: 'All',
      ...(project.github && !isInternal ? { codeRepository: project.github } : {}),
      ...(project.live && !isInternal ? { installUrl: project.live } : {}),
      ...(isInternal
        ? {
            provider: {
              '@type': 'Organization',
              name: 'PT. AMA Salam Indonesia',
            },
          }
        : {}),
    },
  };
};

/**
 * Generates Schema.org ProfilePage & Person JSON-LD for the recruiter overview.
 */
export const generateRecruiterSchema = (lang = 'id') => {
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '';
  const recruiterCanonical = `${SITE_ORIGIN}${prefix}/recruiter`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${recruiterCanonical}#webpage`,
    url: recruiterCanonical,
    inLanguage: lang,
    name: isEn
      ? 'Recruiter Mode & Executive Summary | M. Ghifari Bima Khadafi'
      : 'Ringkasan Eksekutif & Mode Rekruter | M. Ghifari Bima Khadafi',
    description: isEn
      ? 'Executive summary of software engineering qualifications, formal education, verified work experience, technical skills, and flagship projects by M. Ghifari Bima Khadafi for recruiters and hiring managers.'
      : 'Ringkasan profesional profil rekayasa perangkat lunak, riwayat pendidikan formal, pengalaman kerja terverifikasi, keahlian teknis, dan proyek unggulan M. Ghifari Bima Khadafi untuk peninjauan rekruter dan hiring manager.',
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#person`,
      name: 'M. Ghifari Bima Khadafi',
      jobTitle: 'Web Developer / Software Engineer',
      url: SITE_ORIGIN,
      sameAs: [
        'https://github.com/IGhifari',
        'https://www.linkedin.com/in/ighifari/',
      ],
      knowsAbout: [
        'React',
        'TypeScript',
        'Next.js',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Tailwind CSS',
        'Prisma ORM',
        'Web Accessibility (WCAG 2.1 AA)',
        'Full-Stack Web Engineering',
      ],
      alumniOf: [
        {
          '@type': 'EducationalOrganization',
          name: 'Universitas Gunadarma',
          location: 'Indonesia',
        },
        {
          '@type': 'EducationalOrganization',
          name: 'SMKN 1 Cibinong',
          location: 'Bogor, Jawa Barat, Indonesia',
        },
      ],
      worksFor: {
        '@type': 'Organization',
        name: 'Available for Work',
      },
    },
  };
};
