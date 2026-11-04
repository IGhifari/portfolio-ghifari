/**
 * Structured technology stack and skills data.
 * Categorized strictly by engineering domain and backed by verified project implementations.
 * Category titles and descriptions are paired with bilingual entries in src/data/translations.js (stack.categories.*).
 */

export const techCategoriesData = [
  {
    id: 'languages',
    title: 'PROGRAMMING LANGUAGES',
    badge: '// 01',
    description: 'Core syntax, static type systems, and scripting languages implemented across projects.',
    skills: [
      { name: 'TypeScript', highlight: true },
      { name: 'JavaScript', highlight: true },
      { name: 'PHP', highlight: false },
      { name: 'Python', highlight: false },
      { name: 'HTML5 & CSS3', highlight: false },
    ],
  },
  {
    id: 'frontend',
    title: 'FRONTEND DEVELOPMENT',
    badge: '// 02',
    description: 'Modern reactive user interfaces, component architectures, and responsive styling systems.',
    skills: [
      { name: 'React', highlight: true },
      { name: 'Next.js', highlight: true },
      { name: 'Tailwind CSS', highlight: true },
      { name: 'Vite', highlight: false },
    ],
  },
  {
    id: 'backend',
    title: 'BACKEND DEVELOPMENT',
    badge: '// 03',
    description: 'Server-side runtimes, RESTful API architecture, authentication, and backend services.',
    skills: [
      { name: 'Node.js', highlight: true },
      { name: 'Express', highlight: true },
      { name: 'Laravel', highlight: false },
    ],
  },
  {
    id: 'database',
    title: 'DATABASE & ORM',
    badge: '// 04',
    description: 'Relational database schema modeling, object-relational mapping, and query optimization.',
    skills: [
      { name: 'PostgreSQL', highlight: true },
      { name: 'Prisma ORM', highlight: true },
      { name: 'MySQL', highlight: false },
      { name: 'Supabase', highlight: false },
      { name: 'Redis', highlight: false },
    ],
  },
  {
    id: 'ai',
    title: 'AI & LLM INTEGRATION',
    badge: '// 05',
    description: 'Language model API integration, strict knowledge grounding, and asynchronous worker queues.',
    skills: [
      { name: 'Gemini API', highlight: true },
      { name: 'Prompt Grounding', highlight: false },
      { name: 'BullMQ Job Queues', highlight: false },
    ],
  },
  {
    id: 'devops',
    title: 'DEVOPS & DEPLOYMENT',
    badge: '// 06',
    description: 'Edge cloud platforms, static hosting, containerization, and deployment workflows.',
    skills: [
      { name: 'Vercel', highlight: true },
      { name: 'Cloudflare Pages', highlight: false },
      { name: 'Docker', highlight: false },
    ],
  },
  {
    id: 'tools',
    title: 'DEVELOPER TOOLS',
    badge: '// 07',
    description: 'Version control workflows, API testing clients, database inspectors, and development environments.',
    skills: [
      { name: 'Git', highlight: false },
      { name: 'GitHub', highlight: true },
      { name: 'Postman', highlight: false },
      { name: 'Bruno', highlight: false },
      { name: 'TablePlus', highlight: false },
      { name: 'VS Code', highlight: false },
    ],
  },
];

export const marqueeTechnologies = [
  'REACT',
  'TYPESCRIPT',
  'NEXT.JS',
  'NODE.JS',
  'POSTGRESQL',
  'PRISMA',
  'TAILWIND CSS',
  'EXPRESS',
  'GEMINI API',
  'SUPABASE',
  'REDIS',
  'DOCKER',
  'VERCEL',
  'CLOUDFLARE',
  'VITE',
  'MYSQL',
  'GIT',
  'GITHUB',
  'POSTMAN',
];
