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
} from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { GrMysql } from 'react-icons/gr';
import { VscVscode, VscSparkle } from 'react-icons/vsc';
import { TbTablePlus } from 'react-icons/tb';
import { FiCpu } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { techCategoriesData, marqueeTechnologies } from '../data/skills';
import '../styles/Skill.css';

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
  Docker: <SiDocker size={18} />,

  // Developer Tools
  Git: <SiGit size={18} />,
  GitHub: <SiGithub size={18} />,
  Postman: <SiPostman size={18} />,
  Bruno: <SiBruno size={18} />,
  TablePlus: <TbTablePlus size={18} />,
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
              className="tech-card rounded-lg p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <h3 className="font-grotesk font-bold text-xs sm:text-sm text-[var(--text-primary)] tracking-wider uppercase">
                    {t(`stack.categories.${category.id}.title`, category.title)}
                  </h3>
                  <span className="font-mono text-[10px] text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] tracking-wider">
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
                      className="tech-item group cursor-default"
                    >
                      <span className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex items-center justify-center flex-shrink-0">
                        {skill.icon}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex-1 tracking-wide">
                        {skill.name}
                      </span>
                      {skill.highlight && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity"
                          title={t('stack.coreTech')}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ==================================================
          SECONDARY VISUAL: INFINITE LOGO / TECH STRIP
          ================================================== */}
      <div className="w-full border-y border-[var(--border-subtle)] bg-[var(--surface-alt)] py-3.5 overflow-hidden select-none">
        <div className="relative w-full overflow-hidden flex">
          {/* Subtle horizontal gradient vignettes */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--surface-alt)] to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--surface-alt)] to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />

          {/* Marquee Content track duplicated for seamless continuous loop */}
          <div className="animate-tech-marquee items-center gap-8 md:gap-12">
            {[...marqueeTechnologies, ...marqueeTechnologies].map((tech, idx) => (
              <div
                key={`${tech}-${idx}`}
                className="flex items-center gap-8 md:gap-12 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <span className="font-mono text-xs md:text-sm font-bold tracking-[0.2em] whitespace-nowrap">
                  {tech}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
