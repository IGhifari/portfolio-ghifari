/**
 * Structured profile, identity, and 3D developer pass metadata.
 * Extracted from src/components/Profile.jsx, src/components/Footer.jsx,
 * and src/utils/lanyardCardGenerator.js.
 */

export const profileData = {
  fullName: 'M. Ghifari Bima Khadafi',
  brandName: 'GHIFARI',
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
  avatarImage: '/ghifari.webp',
  avatarFallbackImage: '/ghifari.jpeg',
  logoImage: '/logo1.png',
  socials: {
    github: 'https://github.com/IGhifari',
    githubHandle: 'github.com/IGhifari',
    linkedin: 'https://www.linkedin.com/in/ighifari/',
    instagram: 'https://www.instagram.com/ghfrriii/',
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
