/**
 * Centralized Site & Identity Configuration
 *
 * This file serves as the Single Source of Truth (SSOT) for the entire portfolio.
 * When adapting this project for another person/template, simply update the values below
 * and the entire application (Navbar, Footer, Terminal, ChatAssistant, SEO, etc.) will adapt automatically.
 */

export const siteConfig = {
  name: 'M. Ghifari Bima Khadafi',
  brandName: 'GHIFARI',
  shortName: 'Ghifari',
  title: 'M. Ghifari Bima Khadafi | Web Developer & Software Engineer',
  description:
    'Portfolio & engineering showcase of M. Ghifari Bima Khadafi. Exploring software engineering, modern frontend architecture, and full-stack web solutions.',
  origin: 'https://www.ighifari.my.id',
  domain: 'ighifari.my.id',

  author: {
    name: 'M. Ghifari Bima Khadafi',
    email: ['ighifarii05', 'gmail.com'].join(String.fromCharCode(64)),
    github: 'https://github.com/IGhifari',
    githubUsername: 'IGhifari',
    linkedin: 'https://www.linkedin.com/in/ighifari/',
    instagram: 'https://www.instagram.com/ghfrriii/',
    discord: 'ghifarii5',
    twitter: '@IGhifari',
  },

  bot: {
    name: 'GHIFARI AI',
    role: 'Portfolio Assistant',
  },

  terminal: {
    user: 'visitor',
    host: 'ighifari',
    osName: 'GHIFARI-OS',
    version: 'v1.0.0',
  },

  seo: {
    defaultTitle: 'M. Ghifari Bima Khadafi | Web Developer & Software Engineer',
    twitterHandle: '@IGhifari',
    ogImage: '/portfolio.png',
  },
};

/**
 * Master feature flag to quickly enable/disable everything under /play.
 */
export const ENABLE_3D_GAME = true;

/**
 * Sub-flag to enable/disable the "Deploy Stack" 3D mini-game (/play/stack).
 */
export const ENABLE_STACK_GAME = true;

/**
 * Sub-flag to enable/disable the "Bug Hunter" 3D mini-game (/play/bugs).
 */
export const ENABLE_BUG_GAME = true;

/**
 * Sub-flag to enable/disable the "Stack Runner" 3D mini-game (/play/runner).
 */
export const ENABLE_RUNNER_GAME = true;

export default siteConfig;
