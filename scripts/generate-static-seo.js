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

const injectSeoMetadata = (baseHtml, {
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schemaData = null,
  noscriptContent = '',
}) => {
  let html = baseHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // 2. Replace Meta Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 3. Replace Canonical Link
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 4. Replace Open Graph Tags
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

const generateStaticPages = () => {
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[prerender-seo] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  let generatedCount = 0;

  // 1. Generate /study-case/index.html
  const listTitle = 'Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi';
  const listDesc =
    'Direktori studi kasus arsitektur teknis, analisis permasalahan, dan implementasi rekayasa perangkat lunak pada proyek-proyek pilihan M. Ghifari Bima Khadafi.';
  const listCanonical = `${SITE_ORIGIN}/study-case`;

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${listCanonical}#collection`,
    url: listCanonical,
    name: listTitle,
    description: listDesc,
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
      url: `${SITE_ORIGIN}/study-case/${p.id}`,
      description: typeof p.description === 'object' ? p.description.id : p.description,
    })),
  };

  const listNoscript = `      <div style="padding: 24px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
        <h1>Studi Kasus Rekayasa Perangkat Lunak</h1>
        <p><strong>M. Ghifari Bima Khadafi</strong> — Web Developer &amp; Software Engineer</p>
        <p>${escapeHtml(listDesc)}</p>
        <h2>Daftar Studi Kasus Proyek</h2>
        <ul>
${allProjects
  .map(
    (p) =>
      `          <li><a href="/study-case/${p.id}"><strong>${escapeHtml(p.title)}</strong></a> — ${escapeHtml(
        typeof p.description === 'object' ? p.description.id : p.description
      )}</li>`
  )
  .join('\n')}
        </ul>
        <p><a href="/">Kembali ke Beranda Portofolio</a></p>
      </div>`;

  const listHtml = injectSeoMetadata(baseHtml, {
    title: listTitle,
    description: listDesc,
    canonicalUrl: listCanonical,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    schemaData: listSchema,
    noscriptContent: listNoscript,
  });

  const listDir = path.join(distDir, 'study-case');
  fs.mkdirSync(listDir, { recursive: true });
  fs.writeFileSync(path.join(listDir, 'index.html'), listHtml, 'utf-8');
  generatedCount++;
  console.log('[prerender-seo] Generated /study-case/index.html');

  // 2. Generate /study-case/:slug/index.html for each project
  for (const project of allProjects) {
    const isInternal = project.id === 'project-management';
    const projectTitle = `${project.title} — Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi`;
    const projectDesc =
      typeof project.description === 'object'
        ? project.description.id || project.description.en
        : project.description;
    const projectCanonical = `${SITE_ORIGIN}/study-case/${project.id}`;
    const projectImage = project.image
      ? (project.image.startsWith('http') ? project.image : `${SITE_ORIGIN}${project.image}`)
      : DEFAULT_IMAGE;

    const detailSchema = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${projectCanonical}#article`,
      url: projectCanonical,
      headline: `${project.title} — Studi Kasus Arsitektur & Rekayasa Perangkat Lunak`,
      name: project.title,
      description: projectDesc,
      image: projectImage,
      inLanguage: ['id', 'en'],
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

    const problemDesc = project.details?.problem?.id || '';
    const solutionDesc = project.details?.solution?.id || '';
    const roleDesc = project.details?.contribution?.id || '';

    const detailNoscript = `      <div style="padding: 24px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
        <h1>${escapeHtml(project.title)} — Studi Kasus Rekayasa Perangkat Lunak</h1>
        <p><strong>Pengembang:</strong> M. Ghifari Bima Khadafi | <strong>Kategori:</strong> ${escapeHtml(
          typeof project.category === 'object' ? project.category.id : project.category || ''
        )}</p>
        ${isInternal ? '<p><strong>Catatan:</strong> Proyek internal magang di PT. AMA Salam Indonesia.</p>' : ''}
        <p>${escapeHtml(projectDesc)}</p>
        ${problemDesc ? `<h2>Tantangan &amp; Problem Statement</h2><p>${escapeHtml(problemDesc)}</p>` : ''}
        ${solutionDesc ? `<h2>Solusi Teknis &amp; Arsitektur</h2><p>${escapeHtml(solutionDesc)}</p>` : ''}
        ${roleDesc ? `<h2>Peran &amp; Kontribusi Nyata</h2><p>${escapeHtml(roleDesc)}</p>` : ''}
        <h2>Tech Stack</h2>
        <ul>${(project.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        ${!isInternal && (project.live || project.npm || project.github) ? `<h2>Tautan Proyek</h2><p>${[project.live ? `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : '', project.npm ? `<a href="${escapeHtml(project.npm)}" target="_blank" rel="noopener noreferrer">npm Package</a>` : '', project.github ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">Source Code (GitHub)</a>` : ''].filter(Boolean).join(' | ')}</p>` : ''}
        <p><a href="/study-case">Lihat Semua Studi Kasus</a> | <a href="/">Kembali ke Beranda</a></p>
      </div>`;

    const detailHtml = injectSeoMetadata(baseHtml, {
      title: projectTitle,
      description: projectDesc,
      canonicalUrl: projectCanonical,
      ogImage: projectImage,
      ogType: 'article',
      schemaData: detailSchema,
      noscriptContent: detailNoscript,
    });

    const projectDir = path.join(distDir, 'study-case', project.id);
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'index.html'), detailHtml, 'utf-8');
    generatedCount++;
    console.log(`[prerender-seo] Generated /study-case/${project.id}/index.html`);
  }

  // 3. Generate /recruiter/index.html (Recruiter Mode Executive Overview)
  const recruiterTitle = 'Mode Rekruter & Ringkasan Eksekutif | M. Ghifari Bima Khadafi';
  const recruiterDesc =
    'Ringkasan profesional profil rekayasa perangkat lunak, riwayat pendidikan formal, pengalaman kerja terverifikasi (PT. AMA Salam Indonesia), keahlian teknis (React, TypeScript, Next.js, Node.js, PostgreSQL), dan proyek unggulan M. Ghifari Bima Khadafi.';
  const recruiterCanonical = `${SITE_ORIGIN}/recruiter`;

  const recruiterSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${recruiterCanonical}#webpage`,
    url: recruiterCanonical,
    name: recruiterTitle,
    description: recruiterDesc,
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
        <p><strong>Posisi:</strong> Web Developer / Software Engineer | <strong>Status:</strong> Tersedia untuk Bekerja</p>
        <p><strong>Lokasi:</strong> Bogor / Jakarta, Indonesia | <strong>Kontak:</strong> <a href="/#contact">Formulir Kontak</a> (<code>ighifarii05 [at] gmail [dot] com</code>)</p>
        <p>${escapeHtml(recruiterDesc)}</p>
        <h2>Pengalaman Kerja Terverifikasi</h2>
        <p><strong>Frontend Developer Intern</strong> — PT. AMA Salam Indonesia (Okt 2025 – Feb 2026)</p>
        <ul>
          <li>Mengembangkan antarmuka Project Management System berbasis web dengan React dan Tailwind CSS.</li>
          <li>Membangun komponen antarmuka yang modular, responsif, dan terstruktur.</li>
          <li>Optimasi performa halaman web dan aksesibilitas (audit Lighthouse).</li>
        </ul>
        <h2>Pendidikan Formal</h2>
        <ul>
          <li><strong>Universitas Gunadarma:</strong> S1 Informatika (Sedang Menempuh)</li>
          <li><strong>SMKN 1 Cibinong:</strong> Rekayasa Perangkat Lunak (2023 – 2026)</li>
        </ul>
        <h2>Keahlian Teknis Utama</h2>
        <p>React, TypeScript, Next.js, Node.js, Express, PostgreSQL, Prisma ORM, Tailwind CSS, REST APIs, Git/GitHub, Lighthouse.</p>
        <h2>Tautan Resmi</h2>
        <p>
          <a href="/docs/M.GhifariBimaKhadafi_CV.pdf" download>Unduh CV (PDF)</a> |
          <a href="https://github.com/IGhifari" target="_blank" rel="noopener noreferrer">GitHub</a> |
          <a href="https://www.linkedin.com/in/ighifari/" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
          <a href="/">Kembali ke Beranda Portofolio</a>
        </p>
      </div>`;

  const recruiterHtml = injectSeoMetadata(baseHtml, {
    title: recruiterTitle,
    description: recruiterDesc,
    canonicalUrl: recruiterCanonical,
    ogImage: DEFAULT_IMAGE,
    ogType: 'profile',
    schemaData: recruiterSchema,
    noscriptContent: recruiterNoscript,
  });

  const recruiterDir = path.join(distDir, 'recruiter');
  fs.mkdirSync(recruiterDir, { recursive: true });
  fs.writeFileSync(path.join(recruiterDir, 'index.html'), recruiterHtml, 'utf-8');
  generatedCount++;
  console.log('[prerender-seo] Generated /recruiter/index.html');

  console.log(`[prerender-seo] Successfully generated ${generatedCount} static prerendered HTML pages for Cloudflare Pages!`);
};

generateStaticPages();
