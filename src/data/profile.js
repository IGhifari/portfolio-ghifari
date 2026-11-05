/**
 * Structured profile, identity, and 3D developer pass metadata.
 * Extracted from src/components/Profile.jsx, src/components/Footer.jsx,
 * and src/utils/lanyardCardGenerator.js.
 */

import { siteConfig } from '../config/site.js';

export const profileData = {
  fullName: siteConfig.name,
  brandName: siteConfig.brandName,
  nameLines: {
    first: 'M. GHIFARI',
    second: 'BIMA KHADAFI',
  },
  alternateNames: [
    'M Ghifari Bima Khadafi',
    'Ghifari Bima Khadafi',
    'Muhammad Ghifari Bima Khadafi',
    'IGhifari',
  ],
  avatarImage: '/images/profile/ghifari.webp',
  avatarFallbackImage: '/images/profile/ghifari.jpeg',
  logoImage: '/logo.png',
  socials: {
    github: siteConfig.author.github,
    githubHandle: `github.com/${siteConfig.author.githubUsername}`,
    linkedin: siteConfig.author.linkedin,
    instagram: siteConfig.author.instagram,
  },
  lanyardCard: {
    badgeHeader: 'DEV // PASS',
    cardId: 'ID · GHF-2026',
    credentialLabel: 'PORTFOLIO // CREDENTIAL',
    credentialStatus: 'VERIFIED',
    availabilityLabel: 'AVAILABLE FOR WORK',
    roleTitle: 'WEB DEVELOPER / SOFTWARE ENGINEER',
    engineeringFocus: 'FULL-STACK & FRONTEND ENGINEERING',
    stackSummary: 'React · Node.js · TypeScript · SQL',
    baseLocation: 'Bogor / Jakarta, Indonesia',
    capabilities: [
      {
        number: '01',
        title: 'Frontend Architecture',
        stack: 'React · Tailwind CSS · Modern UI',
      },
      {
        number: '02',
        title: 'Backend & APIs',
        stack: 'Node.js · Express · RESTful Design',
      },
      {
        number: '03',
        title: 'Data & ORM',
        stack: 'PostgreSQL · MySQL · Prisma',
      },
      {
        number: '04',
        title: 'Web Quality',
        stack: 'Accessibility (WCAG) · Performance',
      },
    ],
  },
};
