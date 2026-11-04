/**
 * Pure terminal command parsing, sanitization, and execution engine.
 * Designed for safe, client-side portfolio exploration without any shell APIs,
 * eval(), filesystem access, or external command execution.
 */

import { allProjects, getProjectBySlug } from '../data/projects.js';
import { experiences } from '../data/experience.js';
import { techCategoriesData } from '../data/skills.js';
import { educationMetadata } from '../data/education.js';
import { directEmail, contactChannelsData } from '../data/contact.js';
import { GITHUB_TOTAL_CONTRIBUTIONS } from '../data/githubContributions.js';

export const MAX_COMMAND_LENGTH = 100;

/**
 * Supported navigation section mappings from user targets to anchor IDs or routes.
 */
export const NAVIGATION_TARGETS = {
  projects: { type: 'section', target: 'projects', url: '#projects' },
  project: { type: 'section', target: 'projects', url: '#projects' },
  work: { type: 'section', target: 'projects', url: '#projects' },
  about: { type: 'section', target: 'about', url: '#about' },
  experience: { type: 'section', target: 'experience', url: '#experience' },
  internship: { type: 'section', target: 'experience', url: '#experience' },
  journey: { type: 'section', target: 'journey', url: '#journey' },
  skills: { type: 'section', target: 'stack', url: '#stack' },
  stack: { type: 'section', target: 'stack', url: '#stack' },
  tech: { type: 'section', target: 'stack', url: '#stack' },
  github: { type: 'section', target: 'github', url: '#github' },
  certificates: { type: 'section', target: 'certificates', url: '#certificates' },
  cert: { type: 'section', target: 'certificates', url: '#certificates' },
  education: { type: 'section', target: 'education', url: '#education' },
  academic: { type: 'section', target: 'education', url: '#education' },
  contact: { type: 'section', target: 'contact', url: '#contact' },
  terminal: { type: 'section', target: 'terminal', url: '#terminal' },
  'study-case': { type: 'route', target: 'study-case', url: '/study-case' },
  'study-cases': { type: 'route', target: 'study-case', url: '/study-case' },
  'case-studies': { type: 'route', target: 'study-case', url: '/study-case' },
  'case-study': { type: 'route', target: 'study-case', url: '/study-case' },
  recruiter: { type: 'route', target: 'recruiter', url: '/recruiter' },
  resume: { type: 'route', target: 'recruiter', url: '/recruiter' },
  cv: { type: 'route', target: 'recruiter', url: '/recruiter' },
};

/**
 * Sanitizes raw user input by trimming, stripping dangerous HTML characters,
 * and capping maximum string length.
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return Array.from(input.slice(0, MAX_COMMAND_LENGTH))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 9; // Allow printable ASCII and tab, drop control codes
    })
    .join('')
    .replace(/[<>'"&]/g, '') // Strip markup delimiters
    .trim();
};

/**
 * Parses command line string into command name and argument array.
 */
export const parseCommandLine = (rawInput) => {
  const sanitized = sanitizeInput(rawInput);
  if (!sanitized) {
    return { command: '', args: [], raw: '' };
  }

  const tokens = sanitized.split(/\s+/).filter(Boolean);
  const command = tokens[0]?.toLowerCase() || '';
  const args = tokens.slice(1);

  return { command, args, raw: sanitized };
};

/**
 * Formats current date and time for terminal output.
 */
export const formatTerminalDate = (locale = 'en') => {
  const date = new Date();
  try {
    const langTag = locale === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleString(langTag, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return date.toISOString();
  }
};

/**
 * Returns list of all predefined commands with localized descriptions.
 */
export const getAvailableCommands = (t = (k) => k) => [
  { cmd: 'help', desc: t('terminal.cmdHelpDesc') || 'Display list of all available commands and usage.' },
  { cmd: 'about', desc: t('terminal.cmdAboutDesc') || 'Display profile overview, role, location, and engineering focus.' },
  { cmd: 'projects', desc: t('terminal.cmdProjectsDesc') || 'Display list of all verified showcase projects.' },
  { cmd: 'project <slug>', desc: t('terminal.cmdProjectDesc') || 'Display architectural details for a specific project.' },
  { cmd: 'skills', desc: t('terminal.cmdSkillsDesc') || 'Display technical skills organized by engineering domain.' },
  { cmd: 'experience', desc: t('terminal.cmdExperienceDesc') || 'Display verified work experience and internship contributions.' },
  { cmd: 'education', desc: t('terminal.cmdEducationDesc') || 'Display formal academic and vocational education history.' },
  { cmd: 'github', desc: t('terminal.cmdGithubDesc') || 'Display GitHub profile summary and activity metrics.' },
  { cmd: 'contact', desc: t('terminal.cmdContactDesc') || 'Display direct email and verified communication channels.' },
  { cmd: 'recruiter', desc: t('terminal.cmdRecruiterDesc') || 'Open recruiter mode executive overview.' },
  { cmd: 'whoami', desc: t('terminal.cmdWhoamiDesc') || 'Display current guest explorer session information.' },
  { cmd: 'open <target>', desc: t('terminal.cmdOpenDesc') || 'Navigate to a portfolio section or case study.' },
  { cmd: 'date', desc: t('terminal.cmdDateDesc') || 'Display current local date and time.' },
  { cmd: 'clear', desc: t('terminal.cmdClearDesc') || 'Clear all terminal output history.' },
  { cmd: 'exit', desc: t('terminal.cmdExitDesc') || 'Close the terminal window modal.' },
];

/**
 * Executes a terminal command in a safe sandbox.
 * Returns structured result for rendering in the terminal UI.
 */
export const executeTerminalCommand = (rawInput, context = {}) => {
  const {
    language = 'en',
    t = (k) => k,
    projects = allProjects,
    projectFinder = getProjectBySlug,
    experiencesList = experiences,
    techCategories = techCategoriesData,
    contactChannels = contactChannelsData,
    emailAddress = directEmail,
    educationData = educationMetadata,
    onNavigate,
  } = context;

  const { command, args, raw } = parseCommandLine(rawInput);

  if (!command) {
    return {
      type: 'empty',
      command: '',
      args: [],
      raw: '',
      message: '',
    };
  }

  switch (command) {
    case 'help': {
      return {
        type: 'help',
        command,
        args,
        raw,
        commands: getAvailableCommands(t),
        note: language === 'id' 
          ? "Tips: Klik salah satu chip di bawah atau ketik 'open <target>' untuk navigasi cepat."
          : "Tip: Click a chip below or type 'open <target>' for instant navigation.",
      };
    }

    case 'about': {
      const isId = language === 'id';
      return {
        type: 'about',
        command,
        args,
        raw,
        name: 'M. Ghifari Bima Khadafi',
        role: 'Web Developer / Software Engineer',
        location: isId ? 'Bogor, Jawa Barat, Indonesia' : 'Bogor, West Java, Indonesia',
        summary: isId
          ? 'Mengembangkan aplikasi web yang responsif, terstruktur, dan berkinerja tinggi dari antarmuka hingga backend.'
          : 'Developing responsive, structured, and high-performance web applications from frontend interfaces to backend systems.',
        focus: [
          isId ? 'Pengembangan Web Frontend (React, Next.js, Tailwind CSS)' : 'Frontend Web Development (React, Next.js, Tailwind CSS)',
          isId ? 'Arsitektur Backend & RESTful API (Node.js, Express, Laravel)' : 'Backend Architecture & RESTful APIs (Node.js, Express, Laravel)',
          isId ? 'Desain Basis Data Relasional & ORM (PostgreSQL, Prisma)' : 'Relational Database Design & ORM (PostgreSQL, Prisma)',
          isId ? 'Aksesibilitas & Optimasi Web Vitals (Lighthouse)' : 'Accessibility & Web Vitals Optimization (Lighthouse)',
        ],
      };
    }

    case 'projects': {
      const isId = language === 'id';
      const projectList = projects.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category?.[language] || p.category?.en || p.categoryKey || '',
        summary: p.description?.[language] || p.description?.en || '',
        tags: p.tags || [],
      }));

      return {
        type: 'projects',
        command,
        args,
        raw,
        count: projectList.length,
        projects: projectList,
        tip: isId
          ? "Gunakan 'project <slug>' untuk melihat detail arsitektur atau 'open <slug>' untuk membuka studi kasus."
          : "Use 'project <slug>' to inspect architectural details or 'open <slug>' to view the case study.",
      };
    }

    case 'project': {
      const slug = args[0]?.toLowerCase();
      const isId = language === 'id';

      if (!slug) {
        return {
          type: 'error',
          command,
          args,
          raw,
          message: t('terminal.projectUsage') || (isId ? 'Penggunaan: project <slug>. Contoh: project akseskita' : 'Usage: project <slug>. Example: project akseskita'),
          availableSlugs: projects.map((p) => p.id),
        };
      }

      const project = projectFinder(slug);
      if (!project) {
        const template = t('terminal.projectNotFound') || (isId ? 'Proyek tidak ditemukan: "{slug}".' : 'Project not found: "{slug}".');
        return {
          type: 'error',
          command,
          args,
          raw,
          message: template.replace('{slug}', slug),
          hint: isId ? "Ketik 'projects' untuk melihat seluruh ID proyek yang valid." : "Type 'projects' to see all valid project slugs.",
          availableSlugs: projects.map((p) => p.id),
        };
      }

      return {
        type: 'project-detail',
        command,
        args,
        raw,
        slug: project.id,
        title: project.title,
        category: project.category?.[language] || project.category?.en || '',
        subtitle: project.subtitle?.[language] || project.subtitle?.en || '',
        description: project.description?.[language] || project.description?.en || '',
        problem: project.details?.problem?.[language] || project.details?.problem?.en || '',
        solution: project.details?.solution?.[language] || project.details?.solution?.en || '',
        architecture: project.details?.architecture?.[language] || project.details?.architecture?.en || '',
        technologies: project.tags || [],
        github: project.github || null,
        live: project.live || null,
        isConfidential: !project.github && !project.live,
        confidentialNotice: t('terminal.confidentialNotice') || (isId ? 'Proyek magang internal (tautan privat).' : 'Internal internship project (links proprietary).'),
        openPrompt: isId ? `Ketik 'open ${project.id}' untuk melihat studi kasus lengkap.` : `Type 'open ${project.id}' to view full case study.`,
      };
    }

    case 'skills': {
      const isId = language === 'id';
      const categories = techCategories.map((cat) => ({
        id: cat.id,
        badge: cat.badge,
        title: cat.title,
        description: cat.description,
        skills: cat.skills.map((s) => s.name),
      }));

      return {
        type: 'skills',
        command,
        args,
        raw,
        categories,
        note: isId
          ? 'Seluruh teknologi didasarkan pada implementasi proyek nyata di portofolio.'
          : 'All skills are backed by verifiable project implementations across this portfolio.',
      };
    }

    case 'experience': {
      const expList = experiencesList.map((exp) => ({
        id: exp.id,
        company: exp.company,
        role: exp.role?.[language] || exp.role?.en || '',
        period: exp.period?.[language] || exp.period?.en || '',
        duration: exp.duration?.[language] || exp.duration?.en || '',
        location: exp.location?.[language] || exp.location?.en || '',
        type: exp.type?.[language] || exp.type?.en || '',
        description: exp.description?.[language] || exp.description?.en || '',
        responsibilities: exp.responsibilities?.[language] || exp.responsibilities?.en || [],
        technologies: exp.technologies || [],
        projectRef: exp.projectRef || null,
      }));

      return {
        type: 'experience',
        command,
        args,
        raw,
        experiences: expList,
      };
    }

    case 'education': {
      const isId = language === 'id';
      return {
        type: 'education',
        command,
        args,
        raw,
        items: [
          {
            institution: educationData.gunadarma?.institution || 'Universitas Gunadarma',
            degree: isId ? 'Sarjana (S1)' : "Bachelor's Degree",
            major: isId ? 'Informatika' : 'Informatics / Computer Science',
            faculty: isId ? 'Fakultas Teknologi Industri' : 'Faculty of Industrial Technology',
            period: isId ? 'Saat Ini (Aktif)' : 'Current / Ongoing',
            status: isId ? 'Sedang Menempuh' : 'Active Student',
          },
          {
            institution: educationData.smkn1Cibinong?.institution || 'SMKN 1 Cibinong',
            degree: isId ? 'SMK / Pendidikan Kejuruan' : 'Vocational High School',
            major: isId ? 'Rekayasa Perangkat Lunak (RPL)' : 'Software Engineering',
            period: '2023 — 2026',
            status: isId ? 'Lulus Kejuruan' : 'Vocational Graduate',
          },
        ],
      };
    }

    case 'github': {
      const isId = language === 'id';
      return {
        type: 'github',
        command,
        args,
        raw,
        username: 'IGhifari',
        url: 'https://github.com/IGhifari',
        stats: {
          contributions: GITHUB_TOTAL_CONTRIBUTIONS,
          publicRepos: 22,
          followers: 22,
          following: 23,
        },
        summary: isId
          ? `${GITHUB_TOTAL_CONTRIBUTIONS} kontribusi dalam 1 tahun terakhir, 22 repositori publik.`
          : `${GITHUB_TOTAL_CONTRIBUTIONS} annual contributions across 22 verified public repositories.`,
        actionLabel: isId ? 'Buka Profil GitHub' : 'View GitHub Profile',
      };
    }

    case 'contact': {
      const channels = contactChannels.map((c) => ({
        key: c.key,
        name: c.name,
        handle: c.handle,
        url: c.url,
      }));

      return {
        type: 'contact',
        command,
        args,
        raw,
        email: emailAddress,
        channels,
      };
    }

    case 'whoami': {
      return {
        type: 'whoami',
        command,
        args,
        raw,
        user: 'visitor@ighifari',
        role: t('terminal.whoamiRole') || 'Guest Explorer',
        session: t('terminal.whoamiSession') || 'Sandboxed Read-Only Client Session',
        host: 'https://www.ighifari.my.id',
        shell: 'Virtual Portfolio Terminal [v1.0.0]',
      };
    }

    case 'date': {
      return {
        type: 'date',
        command,
        args,
        raw,
        timestamp: formatTerminalDate(language),
      };
    }

    case 'clear': {
      return {
        type: 'clear',
        command,
        args,
        raw,
      };
    }

    case 'recruiter': {
      const isId = language === 'id';
      const destUrl = '/recruiter';
      if (typeof onNavigate === 'function') {
        onNavigate(destUrl, { type: 'route', target: 'recruiter', url: destUrl });
      }
      return {
        type: 'navigate',
        command,
        args,
        raw,
        target: 'recruiter',
        url: destUrl,
        mode: 'route',
        message: isId ? 'Membuka Mode Rekruter...' : 'Navigating to Recruiter Mode...',
      };
    }

    case 'open': {
      const target = args[0]?.toLowerCase();
      const isId = language === 'id';

      if (!target) {
        return {
          type: 'error',
          command,
          args,
          raw,
          message: t('terminal.openUsage') || (isId ? 'Penggunaan: open <target>. Contoh: open projects, open akseskita' : 'Usage: open <target>. Example: open projects, open akseskita'),
        };
      }

      // 1. Check known section and route targets
      if (NAVIGATION_TARGETS[target]) {
        const dest = NAVIGATION_TARGETS[target];
        const template = t('terminal.navigating') || (isId ? 'Membuka {target}...' : 'Navigating to {target}...');
        const message = template.replace('{target}', target);

        if (typeof onNavigate === 'function') {
          onNavigate(dest.url, dest);
        }

        return {
          type: 'navigate',
          command,
          args,
          raw,
          target,
          url: dest.url,
          mode: dest.type,
          message,
        };
      }

      // 2. Check if target is a project slug
      const project = projectFinder(target);
      if (project) {
        const caseStudyUrl = `/study-case/${project.id}`;
        const template = t('terminal.navigating') || (isId ? 'Membuka {target}...' : 'Navigating to {target}...');
        const message = template.replace('{target}', project.title);

        if (typeof onNavigate === 'function') {
          onNavigate(caseStudyUrl, { type: 'route', target: project.id, url: caseStudyUrl });
        }

        return {
          type: 'navigate',
          command,
          args,
          raw,
          target: project.id,
          url: caseStudyUrl,
          mode: 'route',
          message,
        };
      }

      // 3. Target not recognized
      const notFoundTemplate = t('terminal.targetNotFound') || (isId
        ? 'Target navigasi tidak valid: "{target}". Target valid: projects, experience, skills, github, contact, study-case, atau slug proyek (misal: akseskita).'
        : 'Navigation target not recognized: "{target}". Valid targets: projects, experience, skills, github, contact, study-case, or any project slug (e.g., akseskita).');

      return {
        type: 'error',
        command,
        args,
        raw,
        message: notFoundTemplate.replace('{target}', target),
      };
    }

    // Harmless, playful developer easter eggs
    case 'sudo': {
      return {
        type: 'easter-egg',
        command,
        args,
        raw,
        message: 'Permission denied: "visitor" is not in the sudoers file. This incident will be reported.',
      };
    }

    case 'ls': {
      const isId = language === 'id';
      return {
        type: 'easter-egg',
        command,
        args,
        raw,
        message: isId
          ? "Ini adalah CLI portofolio terisolasi. Gunakan 'projects' untuk daftar karya atau 'help' untuk daftar perintah."
          : "This is a virtual portfolio CLI. Use 'projects' to list showcase works or 'help' for available commands.",
      };
    }

    case 'pwd': {
      return {
        type: 'easter-egg',
        command,
        args,
        raw,
        message: 'portfolio://www.ighifari.my.id/visitor',
      };
    }

    case 'cat': {
      const isId = language === 'id';
      return {
        type: 'easter-egg',
        command,
        args,
        raw,
        message: isId
          ? "Gunakan 'project <slug>' untuk membaca detail proyek (contoh: project akseskita)."
          : "Use 'project <slug>' to inspect project details (e.g. project akseskita).",
      };
    }

    case 'exit': {
      const isId = language === 'id';
      return {
        type: 'exit',
        command,
        args,
        raw,
        message: isId
          ? 'Menutup sesi terminal...'
          : 'Closing terminal session...',
      };
    }

    default: {
      const isId = language === 'id';
      const template = t('terminal.commandNotFound') || (isId
        ? 'Perintah tidak ditemukan: "{cmd}". Ketik \'help\' untuk melihat daftar perintah yang valid.'
        : 'Command not found: "{cmd}". Type \'help\' for a list of valid commands.');
      return {
        type: 'error',
        command,
        args,
        raw,
        message: template.replace('{cmd}', command),
      };
    }
  }
};
