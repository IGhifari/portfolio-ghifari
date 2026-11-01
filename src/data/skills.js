/**
 * Structured technology stack and skills data.
 * Extracted from src/components/Skill.jsx.
 * Category titles and descriptions are paired with bilingual entries in src/data/translations.js (stack.*).
 */

export const techCategoriesData = [
  {
    id: 'frontend',
    title: 'FRONTEND',
    badge: '// 01',
    description: 'Modern component architectures, fluid user interfaces, and typed client systems.',
    skills: [
      { name: 'React', highlight: true },
      { name: 'TypeScript', highlight: true },
      { name: 'JavaScript', highlight: false },
      { name: 'Tailwind CSS', highlight: true },
      { name: 'Vite', highlight: false },
      { name: 'HTML5 & CSS3', highlight: false },
    ],
  },
  {
    id: 'backend',
    title: 'BACKEND',
    badge: '// 02',
    description: 'Scalable RESTful services, server middleware, schema validation, and authentication.',
    skills: [
      { name: 'Node.js', highlight: true },
      { name: 'Express', highlight: true },
      { name: 'Prisma ORM', highlight: true },
      { name: 'Supabase', highlight: false },
      { name: 'Laravel', highlight: false },
      { name: 'PHP', highlight: false },
    ],
  },
  {
    id: 'database',
    title: 'DATABASE',
    badge: '// 03',
    description: 'Relational database schemas, normalization, query optimizations, and migrations.',
    skills: [
      { name: 'PostgreSQL', highlight: true },
      { name: 'MySQL', highlight: false },
    ],
  },
  {
    id: 'tools',
    title: 'TOOLS & WORKFLOW',
    badge: '// 04',
    description: 'Version control, API testing workflows, developer environments, and deployment tooling.',
    skills: [
      { name: 'Git', highlight: false },
      { name: 'GitHub', highlight: true },
      { name: 'Docker', highlight: false },
      { name: 'Vercel', highlight: false },
      { name: 'VS Code', highlight: false },
      { name: 'Antigravity', highlight: false },
      { name: 'TablePlus', highlight: false },
      { name: 'Postman', highlight: false },
      { name: 'Bruno', highlight: false },
      { name: 'Claude', highlight: false },
      { name: 'Gemini', highlight: false },
    ],
  },
];

export const marqueeTechnologies = [
  'REACT',
  'TYPESCRIPT',
  'NODE.JS',
  'POSTGRESQL',
  'PRISMA',
  'TAILWIND CSS',
  'EXPRESS',
  'SUPABASE',
  'DOCKER',
  'VERCEL',
  'VITE',
  'MYSQL',
  'GIT',
  'GITHUB',
  'POSTMAN',
];
