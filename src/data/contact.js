/**
 * Structured contact information and verified social/developer channels.
 * Extracted from src/components/Contact.jsx.
 * Localized channel descriptions are available in src/data/translations.js (contact.channels.*).
 */

import { siteConfig } from '../config/site.js';

export const directEmail = siteConfig.author.email;

export const contactChannelsData = [
  {
    key: 'github',
    name: 'GitHub',
    handle: `@${siteConfig.author.githubUsername}`,
    desc: 'Public code, project repositories & contributions',
    url: siteConfig.author.github,
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/ighifari',
    desc: 'Professional network, career background & credentials',
    url: siteConfig.author.linkedin,
  },
  {
    key: 'instagram',
    name: 'Instagram',
    handle: '@ghfrriii',
    desc: 'Personal activities, design experiments & updates',
    url: siteConfig.author.instagram,
  },
  {
    key: 'discord',
    name: 'Discord',
    handle: `@${siteConfig.author.discord}`,
    desc: 'Real-time developer chat and collaboration',
    url: 'https://discord.com',
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    handle: '@ghrfiii',
    desc: 'Short-form coding clips and creative uploads',
    url: 'https://www.tiktok.com/@ghrfiii',
  },
];
