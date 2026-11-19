import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { allProjects } from '../src/data/projects.js';
import { siteConfig } from '../src/config/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN || siteConfig.origin;
const DEFAULT_IMAGE = `${SITE_ORIGIN}${siteConfig.seo.ogImage}`;
const TWITTER_HANDLE = siteConfig.seo.twitterHandle;

const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildAlternates = (basePath = '/') => {
  const cleanBase = basePath === '/' ? '/' : basePath.replace(/\/+$/, '');
  const idUrl = `${SITE_ORIGIN}${cleanBase}`;
  const enUrl = cleanBase === '/' ? `${SITE_ORIGIN}/en` : `${SITE_ORIGIN}/en${cleanBase}`;
  return { idUrl, enUrl, xDefaultUrl: idUrl };
};

const injectSeoMetadata = (baseHtml, {
  lang = 'id',
  basePath = '/',
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schemaData = null,
  noscriptContent = '',
}) => {
  let html = baseHtml;
  const { idUrl, enUrl, xDefaultUrl } = buildAlternates(basePath);

  // 0. Replace <html lang="...">
  html = html.replace(/<html\s+lang=["'][^"']*["']/i, `<html lang="${lang}"`);

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // 2. Replace Meta Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 3. Replace Canonical & hreflang Alternate Links
  const canonicalAndHreflang = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `    <link rel="alternate" hreflang="id" href="${idUrl}" />`,
    `    <link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `    <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`,
  ].join('\n');

  html = html.replace(/\s*<link\s+rel=["']alternate["']\s+hreflang=["'][^"']*["']\s+href=["'][^"']*["']\s*\/?>/gi, '');
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    canonicalAndHreflang
  );

  // 4. Replace Open Graph Tags & Locale
  html = html.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:image" content="${ogImage}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:type["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:locale["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'id_ID'}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:locale:alternate["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:locale:alternate" content="${lang === 'en' ? 'id_ID' : 'en_US'}" />`
  );

  // 5. Replace Twitter Tags
  html = html.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:image" content="${ogImage}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:creator["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:creator" content="${TWITTER_HANDLE}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:site["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:site" content="${TWITTER_HANDLE}" />`
  );

  // 6. Replace or Inject Schema.org JSON-LD
  if (schemaData) {
    const jsonLdBlock = `<!-- Structured Data: Page-Specific Pre-rendered Schema.org JSON-LD -->\n    <script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n    </script>`;
    html = html.replace(
      /<!-- Structured Data:[^<]*<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i,
      jsonLdBlock
    );
  }

  // 7. Inject Page-Specific Noscript Content
  if (noscriptContent) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, `<noscript>\n${noscriptContent}\n    </noscript>`);
  }

  return html;
};

const writePage = (segments, html) => {
  const targetDir = path.join(distDir, ...segments);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
};

const generateStaticPages = () => {
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[prerender-seo] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  let generatedCount = 0;

  // 0. Generate /en/index.html (English Home)
  {
    const enHomeTitle = 'M. Ghifari Bima Khadafi | Web Developer & Software Engineer Portfolio';
    const enHomeDesc =
      'Official portfolio of M. Ghifari Bima Khadafi (IGhifari) — Web Developer from Bogor, Indonesia. Focused on Frontend React, TypeScript & Tailwind CSS, with backend experience in Node.js and Laravel.';
    const enHomeCanonical = `${SITE_ORIGIN}/en`;
    const enHomeNoscript = `      <div style="padding: 24px; max-width: 820px; margin: 0 auto; font-family: sans-serif; line-height: 1.65;">
        <h1>M. Ghifari Bima Khadafi (M Ghifari Bima Khadafi)</h1>
        <p><strong>Web Developer &amp; Software Engineer</strong> | Bogor / Jakarta, Indonesia | Available for Work</p>
        <p>${escapeHtml(enHomeDesc)}</p>
        <p>
          <a href="/docs/M.GhifariBimaKhadafi_CV.pdf" download><strong>Download CV (PDF)</strong></a> |
          <a href="/en/recruiter"><strong>Recruiter Mode (Executive Overview)</strong></a> |
          <a href="/en/study-case"><strong>Case Studies Directory</strong></a>
        </p>
        <h2>Work Experience</h2>
        <ul>
          <li><strong>Frontend Developer Intern</strong> — PT. AMA Salam Indonesia (October 2025 – February 2026). Built web-based Project Management System interfaces with React &amp; Tailwind CSS and optimized performance &amp; accessibility via Lighthouse audits.</li>
        </ul>
        <h2>Selected Projects</h2>
        <ul>
${allProjects
  .slice(0, 5)
  .map(
    (p) =>
      `          <li><strong>${escapeHtml(p.title)}</strong> — ${escapeHtml(p.description.en)} (<a href="/en/study-case/${p.id}">Case Study</a>)</li>`
  )
  .join('\n')}
        </ul>
        <h2>Contact</h2>
        <ul>
          <li>Contact Form: <a href="/en#contact">Send a message via contact section</a></li>
          <li>Email (Anti-Spam): <code>ighifarii05 [at] gmail [dot] com</code></li>
          <li>GitHub: <a href="https://github.com/IGhifari" target="_blank" rel="noopener noreferrer">github.com/IGhifari</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/ighifari/" target="_blank" rel="noopener noreferrer">linkedin.com/in/ighifari</a></li>
        </ul>
      </div>`;

    const enHomeHtml = injectSeoMetadata(baseHtml, {
      lang: 'en',
      basePath: '/',
      title: enHomeTitle,
      description: enHomeDesc,
      canonicalUrl: enHomeCanonical,
      ogImage: DEFAULT_IMAGE,
      ogType: 'profile',
      noscriptContent: enHomeNoscript,
    });
    writePage(['en'], enHomeHtml);
    generatedCount++;
    console.log('[prerender-seo] Generated /en/index.html');
  }

  // 1. Generate /study-case/index.html & /en/study-case/index.html
  for (const lang of ['id', 'en']) {
    const isEn = lang === 'en';
    const listTitle = isEn
      ? 'Software Engineering Case Studies | M. Ghifari Bima Khadafi'
      : 'Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi';
    const listDesc = isEn
      ? 'Directory of technical architecture case studies, problem analysis, and software engineering implementations by M. Ghifari Bima Khadafi.'
      : 'Direktori studi kasus arsitektur teknis, analisis permasalahan, dan implementasi rekayasa perangkat lunak pada proyek-proyek pilihan M. Ghifari Bima Khadafi.';
    const listCanonical = isEn ? `${SITE_ORIGIN}/en/study-case` : `${SITE_ORIGIN}/study-case`;
    const prefix = isEn ? '/en' : '';

    const listSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${listCanonical}#collection`,
      url: listCanonical,
      name: listTitle,
      description: listDesc,
      inLanguage: lang,
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
      hasPart: allProjects.map((p) => ({
        '@type': 'TechArticle',
        name: p.title,
        url: `${SITE_ORIGIN}${prefix}/study-case/${p.id}`,
        description: typeof p.description === 'object' ? p.description[lang] : p.description,
      })),
    };

    const listNoscript = `      <div style="padding: 24px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
        <h1>${isEn ? 'Software Engineering Case Studies' : 'Studi Kasus Rekayasa Perangkat Lunak'}</h1>
        <p><strong>M. Ghifari Bima Khadafi</strong> — Web Developer &amp; Software Engineer</p>
        <p>${escapeHtml(listDesc)}</p>
        <h2>${isEn ? 'Project Case Studies' : 'Daftar Studi Kasus Proyek'}</h2>
        <ul>
${allProjects
  .map(
    (p) =>
      `          <li><a href="${prefix}/study-case/${p.id}"><strong>${escapeHtml(p.title)}</strong></a> — ${escapeHtml(
        typeof p.description === 'object' ? p.description[lang] : p.description
      )}</li>`
  )
  .join('\n')}
        </ul>
        <p><a href="${prefix || '/'}">${isEn ? 'Back to Portfolio Home' : 'Kembali ke Beranda Portofolio'}</a></p>
      </div>`;

    const listHtml = injectSeoMetadata(baseHtml, {
      lang,
      basePath: '/study-case',
      title: listTitle,
      description: listDesc,
      canonicalUrl: listCanonical,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
      schemaData: listSchema,
      noscriptContent: listNoscript,
    });

    writePage(isEn ? ['en', 'study-case'] : ['study-case'], listHtml);
    generatedCount++;
    console.log(`[prerender-seo] Generated ${prefix}/study-case/index.html`);
  }

  // 2. Generate /study-case/:slug/index.html & /en/study-case/:slug/index.html
  for (const project of allProjects) {
    const isInternal = project.id === 'project-management';
    const projectImage = project.image
      ? (project.image.startsWith('http') ? project.image : `${SITE_ORIGIN}${project.image}`)
      : DEFAULT_IMAGE;

    for (const lang of ['id', 'en']) {
      const isEn = lang === 'en';
      const prefix = isEn ? '/en' : '';
      const projectTitle = isEn
        ? `${project.title} — Software Engineering Case Study | M. Ghifari Bima Khadafi`
        : `${project.title} — Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi`;
      const projectDesc =
        typeof project.description === 'object'
          ? project.description[lang] || project.description.id
          : project.description;
      const projectCanonical = `${SITE_ORIGIN}${prefix}/study-case/${project.id}`;

      const detailSchema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': `${projectCanonical}#article`,
        url: projectCanonical,
        headline: isEn
          ? `${project.title} — Architecture & Software Engineering Case Study`
          : `${project.title} — Studi Kasus Arsitektur & Rekayasa Perangkat Lunak`,
        name: project.title,
        description: projectDesc,
        image: projectImage,
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
          ...(project.npm && !isInternal ? { downloadUrl: project.npm } : {}),
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

      const problemDesc = project.details?.problem?.[lang] || '';
      const solutionDesc = project.details?.solution?.[lang] || '';
      const roleDesc = project.details?.contribution?.[lang] || '';
      const catLabel =
        typeof project.category === 'object' ? project.category[lang] : project.category || '';

      const linksArr = [
        project.live ? `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : '',
        project.npm ? `<a href="${escapeHtml(project.npm)}" target="_blank" rel="noopener noreferrer">npm Package</a>` : '',
        project.github ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">Source Code (GitHub)</a>` : '',
      ].filter(Boolean);

      const detailNoscript = `      <div style="padding: 24px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
        <h1>${escapeHtml(project.title)} — ${isEn ? 'Software Engineering Case Study' : 'Studi Kasus Rekayasa Perangkat Lunak'}</h1>
        <p><strong>${isEn ? 'Developer' : 'Pengembang'}:</strong> M. Ghifari Bima Khadafi | <strong>${isEn ? 'Category' : 'Kategori'}:</strong> ${escapeHtml(catLabel)}</p>
        ${isInternal ? `<p><strong>${isEn ? 'Note' : 'Catatan'}:</strong> ${isEn ? 'Internal internship project at PT. AMA Salam Indonesia.' : 'Proyek internal magang di PT. AMA Salam Indonesia.'}</p>` : ''}
        <p>${escapeHtml(projectDesc)}</p>
        ${problemDesc ? `<h2>${isEn ? 'Problem Statement' : 'Tantangan &amp; Problem Statement'}</h2><p>${escapeHtml(problemDesc)}</p>` : ''}
        ${solutionDesc ? `<h2>${isEn ? 'Technical Solution &amp; Architecture' : 'Solusi Teknis &amp; Arsitektur'}</h2><p>${escapeHtml(solutionDesc)}</p>` : ''}
        ${roleDesc ? `<h2>${isEn ? 'Role &amp; Contributions' : 'Peran &amp; Kontribusi Nyata'}</h2><p>${escapeHtml(roleDesc)}</p>` : ''}
        <h2>Tech Stack</h2>
        <ul>${(project.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        ${!isInternal && linksArr.length > 0 ? `<h2>${isEn ? 'Project Links' : 'Tautan Proyek'}</h2><p>${linksArr.join(' | ')}</p>` : ''}
        <p><a href="${prefix}/study-case">${isEn ? 'View All Case Studies' : 'Lihat Semua Studi Kasus'}</a> | <a href="${prefix || '/'}">${isEn ? 'Back to Home' : 'Kembali ke Beranda'}</a></p>
      </div>`;

      const detailHtml = injectSeoMetadata(baseHtml, {
        lang,
        basePath: `/study-case/${project.id}`,
        title: projectTitle,
        description: projectDesc,
        canonicalUrl: projectCanonical,
        ogImage: projectImage,
        ogType: 'article',
        schemaData: detailSchema,
        noscriptContent: detailNoscript,
      });

      writePage(isEn ? ['en', 'study-case', project.id] : ['study-case', project.id], detailHtml);
      generatedCount++;
      console.log(`[prerender-seo] Generated ${prefix}/study-case/${project.id}/index.html`);
    }
  }

  // 3. Generate /recruiter/index.html & /en/recruiter/index.html
  for (const lang of ['id', 'en']) {
    const isEn = lang === 'en';
    const prefix = isEn ? '/en' : '';
    const recruiterTitle = isEn
      ? 'Recruiter Mode & Executive Summary | M. Ghifari Bima Khadafi'
      : 'Mode Rekruter & Ringkasan Eksekutif | M. Ghifari Bima Khadafi';
    const recruiterDesc = isEn
      ? 'Executive summary of software engineering qualifications, formal education, verified internship experience (PT. AMA Salam Indonesia), technical stack (React, TypeScript, Next.js, Node.js, PostgreSQL), and flagship projects by M. Ghifari Bima Khadafi.'
      : 'Ringkasan profesional profil rekayasa perangkat lunak, riwayat pendidikan formal, pengalaman kerja terverifikasi (PT. AMA Salam Indonesia), keahlian teknis (React, TypeScript, Next.js, Node.js, PostgreSQL), dan proyek unggulan M. Ghifari Bima Khadafi.';
    const recruiterCanonical = `${SITE_ORIGIN}${prefix}/recruiter`;

    const recruiterSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': `${recruiterCanonical}#webpage`,
      url: recruiterCanonical,
      name: recruiterTitle,
      description: recruiterDesc,
      inLanguage: lang,
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
      },
    };

    const recruiterNoscript = `      <div style="padding: 24px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
        <h1>M. Ghifari Bima Khadafi — Recruiter Overview / Mode Rekruter</h1>
        <p><strong>${isEn ? 'Role' : 'Posisi'}:</strong> Web Developer / Software Engineer | <strong>Status:</strong> ${isEn ? 'Available for Work' : 'Tersedia untuk Bekerja'}</p>
        <p><strong>${isEn ? 'Location' : 'Lokasi'}:</strong> Bogor / Jakarta, Indonesia | <strong>${isEn ? 'Contact' : 'Kontak'}:</strong> <a href="${prefix || '/'}#contact">${isEn ? 'Contact Form' : 'Formulir Kontak'}</a> (<code>ighifarii05 [at] gmail [dot] com</code>)</p>
        <p>${escapeHtml(recruiterDesc)}</p>
        <h2>${isEn ? 'Verified Work Experience' : 'Pengalaman Kerja Terverifikasi'}</h2>
        <p><strong>Frontend Developer Intern</strong> — PT. AMA Salam Indonesia (Oct 2025 – Feb 2026)</p>
        <ul>
          <li>${isEn ? 'Developed web-based Project Management System interfaces with React and Tailwind CSS.' : 'Mengembangkan antarmuka Project Management System berbasis web dengan React dan Tailwind CSS.'}</li>
          <li>${isEn ? 'Built modular, responsive, and structured UI components.' : 'Membangun komponen antarmuka yang modular, responsif, dan terstruktur.'}</li>
          <li>${isEn ? 'Optimized page performance and accessibility via Lighthouse audits.' : 'Optimasi performa halaman web dan aksesibilitas (audit Lighthouse).'}</li>
        </ul>
        <h2>${isEn ? 'Formal Education' : 'Pendidikan Formal'}</h2>
        <ul>
          <li><strong>Universitas Gunadarma:</strong> ${isEn ? 'B.Sc. in Informatics (In Progress)' : 'S1 Informatika (Sedang Menempuh)'}</li>
          <li><strong>SMKN 1 Cibinong:</strong> ${isEn ? 'Software Engineering (2023 – 2026)' : 'Rekayasa Perangkat Lunak (2023 – 2026)'}</li>
        </ul>
        <h2>${isEn ? 'Core Technical Skills' : 'Keahlian Teknis Utama'}</h2>
        <p>React, TypeScript, Next.js, Node.js, Express, PostgreSQL, Prisma ORM, Tailwind CSS, Vitest, REST APIs, Git/GitHub, Lighthouse.</p>
        <h2>${isEn ? 'Official Links' : 'Tautan Resmi'}</h2>
        <p>
          <a href="/docs/M.GhifariBimaKhadafi_CV.pdf" download>${isEn ? 'Download CV (PDF)' : 'Unduh CV (PDF)'}</a> |
          <a href="https://github.com/IGhifari" target="_blank" rel="noopener noreferrer">GitHub</a> |
          <a href="https://www.linkedin.com/in/ighifari/" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
          <a href="${prefix || '/'}">${isEn ? 'Back to Portfolio Home' : 'Kembali ke Beranda Portofolio'}</a>
        </p>
      </div>`;

    const recruiterHtml = injectSeoMetadata(baseHtml, {
      lang,
      basePath: '/recruiter',
      title: recruiterTitle,
      description: recruiterDesc,
      canonicalUrl: recruiterCanonical,
      ogImage: DEFAULT_IMAGE,
      ogType: 'profile',
      schemaData: recruiterSchema,
      noscriptContent: recruiterNoscript,
    });

    writePage(isEn ? ['en', 'recruiter'] : ['recruiter'], recruiterHtml);
    generatedCount++;
    console.log(`[prerender-seo] Generated ${prefix}/recruiter/index.html`);
  }

  // 4. Generate synchronized dist/sitemap.xml covering both ID and EN routes
  const buildDate = new Date().toISOString().split('T')[0];
  const baseRoutes = [
    { basePath: '/', changefreq: 'weekly', priority: '1.0' },
    { basePath: '/study-case', changefreq: 'weekly', priority: '0.9' },
    { basePath: '/recruiter', changefreq: 'weekly', priority: '0.9' },
    ...allProjects.map((project, idx) => ({
      basePath: `/study-case/${project.id}`,
      changefreq: 'monthly',
      priority: idx < 6 ? '0.8' : '0.7',
    })),
  ];

  const sitemapUrls = baseRoutes.flatMap(({ basePath, changefreq, priority }) => {
    const { idUrl, enUrl } = buildAlternates(basePath);
    return [
      { loc: idUrl, changefreq, priority },
      { loc: enUrl, changefreq, priority },
    ];
  });

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map(
      (entry) =>
        `  <url>\n    <loc>${escapeHtml(entry.loc)}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    ),
    '</urlset>',
  ].join('\n') + '\n';

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`[prerender-seo] Generated /sitemap.xml (${sitemapUrls.length} bilingual URLs)`);

  console.log(`[prerender-seo] Successfully generated ${generatedCount} static prerendered HTML pages for Cloudflare Pages!`);
};

generateStaticPages();
