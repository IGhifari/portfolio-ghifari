import { motion, useReducedMotion } from 'framer-motion';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiPrisma,
  SiLaravel,
  SiPhp,
  SiPython,
  SiGit,
  SiGithub,
  SiPostman,
  SiVite,
  SiHtml5,
  SiBruno,
  SiGooglegemini,
  SiDocker,
  SiVercel,
  SiSupabase,
  SiRedis,
  SiCloudflare,
  SiVitest,
  SiZod,
  SiGithubactions,
  SiNpm,
} from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { GrMysql } from 'react-icons/gr';
import { VscVscode, VscSparkle } from 'react-icons/vsc';
import { TbTablePlus } from 'react-icons/tb';
import { FiCpu, FiPackage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { techCategoriesData } from '../data/skills';
import LogoLoop from './reactbits/LogoLoop';
import '../styles/Skill.css';


const techLogos = [
  { node: <SiReact size={22} />, title: 'React', hoverColor: '#61dafb' },
  { node: <SiTypescript size={22} />, title: 'TypeScript', hoverColor: '#3178c6' },
  { node: <SiNextdotjs size={22} />, title: 'Next.js', hoverColor: '#0070f3' },
  { node: <SiNodedotjs size={22} />, title: 'Node.js', hoverColor: '#68a063' },
  { node: <BiLogoPostgresql size={24} />, title: 'PostgreSQL', hoverColor: '#336791' },
  { node: <SiTailwindcss size={22} />, title: 'Tailwind CSS', hoverColor: '#38bdf8' },
  { node: <SiPrisma size={22} />, title: 'Prisma', hoverColor: '#5a67d8' },
  { node: <SiExpress size={22} />, title: 'Express', hoverColor: '#22c55e' },
  { node: <SiGooglegemini size={22} />, title: 'Gemini API', hoverColor: '#4285f4' },
  { node: <SiSupabase size={22} />, title: 'Supabase', hoverColor: '#3ecf8e' },
  { node: <SiRedis size={22} />, title: 'Redis', hoverColor: '#dc382d' },
  { node: <SiDocker size={22} />, title: 'Docker', hoverColor: '#2496ed' },
  { node: <SiVercel size={22} />, title: 'Vercel', hoverColor: '#0070f3' },
  { node: <SiCloudflare size={22} />, title: 'Cloudflare', hoverColor: '#f38020' },
  { node: <SiVite size={22} />, title: 'Vite', hoverColor: '#646cff' },
  { node: <SiLaravel size={22} />, title: 'Laravel', hoverColor: '#ff2d20' },
  { node: <SiPhp size={22} />, title: 'PHP', hoverColor: '#777bb4' },
  { node: <SiPython size={22} />, title: 'Python', hoverColor: '#3776ab' },
  { node: <GrMysql size={22} />, title: 'MySQL', hoverColor: '#4479a1' },
  { node: <SiGit size={22} />, title: 'Git', hoverColor: '#f05032' },
  { node: <SiGithub size={22} />, title: 'GitHub', hoverColor: '#a855f7' },
  { node: <SiVitest size={22} />, title: 'Vitest', hoverColor: '#6e9f18' },
  { node: <SiZod size={22} />, title: 'Zod', hoverColor: '#3068b7' },
  { node: <SiGithubactions size={22} />, title: 'GitHub Actions', hoverColor: '#2088ff' },
  { node: <SiPostman size={22} />, title: 'Postman', hoverColor: '#ff6c37' },
];

const skillIconsByName = {
  // Programming Languages
  TypeScript: <SiTypescript size={18} />,
  JavaScript: <SiJavascript size={18} />,
  PHP: <SiPhp size={18} />,
  Python: <SiPython size={18} />,
  'HTML5 & CSS3': <SiHtml5 size={18} />,

  // Frontend
  React: <SiReact size={18} />,
  'Next.js': <SiNextdotjs size={18} />,
  'Tailwind CSS': <SiTailwindcss size={18} />,
  Vite: <SiVite size={18} />,

  // Backend
  'Node.js': <SiNodedotjs size={18} />,
  Express: <SiExpress size={18} />,
  Laravel: <SiLaravel size={18} />,
  Zod: <SiZod size={18} />,

  // Database & ORM
  PostgreSQL: <BiLogoPostgresql size={20} />,
  'Prisma ORM': <SiPrisma size={18} />,
  MySQL: <GrMysql size={18} />,
  Supabase: <SiSupabase size={18} />,
  Redis: <SiRedis size={18} />,

  // AI & LLM Integration
  'Gemini API': <SiGooglegemini size={18} />,
  'Prompt Grounding': <VscSparkle size={18} />,
  'BullMQ Job Queues': <FiCpu size={18} />,

  // DevOps & Deployment
  Vercel: <SiVercel size={18} />,
  'Cloudflare Pages': <SiCloudflare size={18} />,
  'GitHub Actions': <SiGithubactions size={18} />,
  Docker: <SiDocker size={18} />,
  npm: <SiNpm size={18} />,

  // Developer Tools
  Git: <SiGit size={18} />,
  GitHub: <SiGithub size={18} />,
  Postman: <SiPostman size={18} />,
  Bruno: <SiBruno size={18} />,
  TablePlus: <TbTablePlus size={18} />,
  Vitest: <SiVitest size={18} />,
  tsup: <FiPackage size={18} />,
  'VS Code': <VscVscode size={18} />,
};

const techCategories = techCategoriesData.map((category) => ({
  ...category,
  skills: category.skills.map((skill) => ({
    ...skill,
    icon: skillIconsByName[skill.name] || <VscSparkle size={18} />,
  })),
}));

const Skills = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  return (
    <div className="w-full text-[var(--text-primary)]">
      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        {/* ==================================================
            SECTION HEADER: 05 / TECH STACK
            ================================================== */}
        <motion.div {...getFadeMotion(0)} className="mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
              {t('stack.sectionTag')}
            </span>
            <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
          </div>
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
            {t('stack.heading')}<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
            {t('stack.intro')}
          </p>
        </motion.div>

        {/* ==================================================
            CATEGORIZED TECH STACK GRID (7 Structured Domains)
            ================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {techCategories.map((category, index) => (
            <motion.div
              key={category.id}
              {...getFadeMotion(index * 0.05)}
              className="tech-card rounded-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Subtle ambient card glow */}
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-0"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                    <h3 className="font-grotesk font-black text-xs sm:text-sm text-[var(--text-primary)] tracking-wide uppercase">
                      {t(`stack.categories.${category.id}.title`, category.title)}
                    </h3>
                    <span className="font-mono text-[10px] text-[var(--accent)] px-2.5 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border-subtle)] font-semibold tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                      {category.badge}
                    </span>
                  </div>

                  {/* Category Brief */}
                  <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed mt-3 mb-5">
                    {t(`stack.categories.${category.id}.description`, category.description)}
                  </p>

                  {/* Technology List - Editorial Rows */}
                  <ul className="space-y-1 list-none p-0 m-0">
                    {category.skills.map((skill) => (
                      <li
                        key={skill.name}
                        className="tech-item group/item cursor-default"
                      >
                        <span className="text-[var(--text-muted)] group-hover/item:text-[var(--accent)] transition-colors flex items-center justify-center flex-shrink-0 text-base">
                          {skill.icon}
                        </span>
                        <span className="font-mono text-xs text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)] transition-colors flex-1 tracking-wide font-medium">
                          {skill.name}
                        </span>
                        {skill.highlight && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--accent)]/30 animate-pulse"
                            title={t('stack.coreTech')}
                            aria-hidden="true"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ==================================================
          SECONDARY VISUAL: INFINITE LOGO / TECH STRIP (React Bits LogoLoop)
          ================================================== */}
      <div className="w-full border-y border-[var(--border-subtle)] bg-[var(--surface-alt)] py-3.5 overflow-hidden select-none relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <LogoLoop
          logos={techLogos}
          speed={55}
          direction="left"
          logoHeight={22}
          gap={44}
          hoverSpeed={0}
          scaleOnHover
          labels="inline"
          fadeOut
          fadeOutWidth={0.1}
          draggable
          ariaLabel={t('stack.heading') || 'Technology stack'}
        />
      </div>
    </div>
  );
};

export default Skills;
