import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import {
  SiBruno,
  SiCloudflare,
  SiDocker,
  SiExpress,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGooglegemini,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiNextdotjs,
  SiNodedotjs,
  SiNpm,
  SiPhp,
  SiPostman,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVitest,
  SiZod,
} from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { GrMysql } from 'react-icons/gr';
import { VscSparkle, VscVscode } from 'react-icons/vsc';
import { TbTablePlus } from 'react-icons/tb';
import { FiCpu, FiPackage } from 'react-icons/fi';

import { techCategoriesData } from '../../data/skills';
import { useLanguage } from '../../context/LanguageContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

const SKILL_ICONS = {
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  PHP: SiPhp,
  Python: SiPython,
  'HTML5 & CSS3': SiHtml5,
  React: SiReact,
  'Next.js': SiNextdotjs,
  'Tailwind CSS': SiTailwindcss,
  Vite: SiVite,
  'Node.js': SiNodedotjs,
  Express: SiExpress,
  Laravel: SiLaravel,
  Zod: SiZod,
  PostgreSQL: BiLogoPostgresql,
  'Prisma ORM': SiPrisma,
  MySQL: GrMysql,
  Supabase: SiSupabase,
  Redis: SiRedis,
  'Gemini API': SiGooglegemini,
  'Prompt Grounding': VscSparkle,
  'BullMQ Job Queues': FiCpu,
  Vercel: SiVercel,
  'Cloudflare Pages': SiCloudflare,
  'GitHub Actions': SiGithubactions,
  Docker: SiDocker,
  npm: SiNpm,
  Git: SiGit,
  GitHub: SiGithub,
  Postman: SiPostman,
  Bruno: SiBruno,
  TablePlus: TbTablePlus,
  Vitest: SiVitest,
  tsup: FiPackage,
  'VS Code': VscVscode,
};

const MARQUEE_ITEMS = [
  { name: 'React', Icon: SiReact },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'Node.js', Icon: SiNodedotjs },
  { name: 'PostgreSQL', Icon: BiLogoPostgresql },
  { name: 'Prisma', Icon: SiPrisma },
  { name: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'Express', Icon: SiExpress },
  { name: 'Gemini API', Icon: SiGooglegemini },
  { name: 'Supabase', Icon: SiSupabase },
  { name: 'Redis', Icon: SiRedis },
  { name: 'Docker', Icon: SiDocker },
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Cloudflare', Icon: SiCloudflare },
  { name: 'Laravel', Icon: SiLaravel },
  { name: 'Vitest', Icon: SiVitest },
  { name: 'Zod', Icon: SiZod },
  { name: 'GitHub Actions', Icon: SiGithubactions },
];

const DOMAIN_LABELS = {
  languages: { en: 'Programming Languages', id: 'Bahasa Pemrograman' },
  frontend: { en: 'Frontend Engineering', id: 'Rekayasa Frontend' },
  backend: { en: 'Backend Systems', id: 'Sistem Backend' },
  database: { en: 'Database & ORM', id: 'Basis Data & ORM' },
  ai: { en: 'AI & Async Pipelines', id: 'Integrasi AI & Antrean' },
  devops: { en: 'Cloud & Deployment', id: 'Cloud & Deployment' },
  tools: { en: 'Developer Tooling', id: 'Perangkat Pengembang' },
};

/**
 * Portfolio V2 Architectural Tech Stack Section
 * Open-canvas 7-domain hairline ledger (`01.`–`07.`) paired with icon-pill clusters
 * and an edge-faded monochrome technology ribbon (zero V1 Bento cards).
 */
export default function TechStackSection({ isEn: isEnProp }) {
  const { language, t } = useLanguage();
  const isEn = typeof isEnProp === 'boolean' ? isEnProp : language !== 'id';
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="v2-stack"
      aria-labelledby="v2-stack-heading"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
    >
      <div className="v2-container space-y-16 sm:space-y-24">
        {/* 1. Nakula Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({isEn ? 'TECH STACK' : 'TEKNOLOGI'})
            </p>
            <div id="v2-stack-heading">
              <MaskedDisplayHeading
                as="h2"
                lines={isEn ? ['CORE', 'ARSENAL'] : ['ARSENAL', 'TEKNIS']}
                lineClassNames={['md:pl-36 lg:pl-44', '']}
                className="v2-section-heading"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>
          </div>

          <p className="max-w-[380px] text-[20px] sm:text-[24px] font-medium tracking-[-0.045em] leading-[1.12] text-[var(--v2-text-muted)] lg:pb-2">
            {isEn
              ? 'Production-tested languages, frameworks, relational databases, and tooling across seven engineering domains.'
              : 'Bahasa, framework, basis data relasional, dan perangkat teruji produksi di tujuh domain rekayasa.'}
          </p>
        </div>

        {/* 2. Open-Canvas 7-Domain Architectural Hairline Index */}
        <div className="border-t border-[var(--v2-border-strong)] divide-y divide-[var(--v2-border-strong)]">
          {techCategoriesData.map((category, idx) => {
            const indexNum = String(idx + 1).padStart(2, '0');
            const domainTitle =
              DOMAIN_LABELS[category.id]?.[isEn ? 'en' : 'id'] ||
              t(`stack.categories.${category.id}.title`, category.title);
            const domainDesc = t(
              `stack.categories.${category.id}.description`,
              category.description
            );

            return (
              <motion.div
                key={category.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.58,
                  delay: Math.min(idx * 0.05, 0.25),
                  ease: NAKULA_EASE,
                }}
                className="group py-7 sm:py-9 transition-colors duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
                  {/* Index + Domain Title & Description */}
                  <div className="lg:col-span-5 flex items-start gap-5 sm:gap-7">
                    <span
                      className="pt-1 text-[16px] sm:text-[18px] font-semibold tracking-[-0.04em] text-[var(--v2-text-dim)] group-hover:text-[var(--v2-text-bright)] transition-colors tabular-nums shrink-0"
                      aria-hidden="true"
                    >
                      {indexNum}
                      <span className="text-[var(--v2-accent)]">.</span>
                    </span>

                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.045em] leading-[1.1] text-[var(--v2-text)] group-hover:text-[var(--v2-text-bright)] transition-colors">
                        {domainTitle}
                      </h3>
                      <p className="text-[14px] sm:text-[15px] leading-[1.4] tracking-[-0.015em] text-[var(--v2-text-dim)] max-w-[400px]">
                        {domainDesc}
                      </p>
                    </div>
                  </div>

                  {/* Technology Icon-Pill Cluster */}
                  <div className="lg:col-span-7 pl-9 sm:pl-11 lg:pl-0 flex flex-wrap items-center gap-2 sm:gap-2.5 lg:pt-1">
                    {category.skills.map((skill) => {
                      const IconComp = SKILL_ICONS[skill.name] || VscSparkle;
                      return (
                        <span
                          key={skill.name}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] sm:text-[14px] font-medium tracking-[-0.02em] transition-colors duration-300 ${
                            skill.highlight
                              ? 'border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text-bright)] hover:border-[var(--v2-accent)]'
                              : 'border-[var(--v2-border)] bg-transparent text-[var(--v2-text-muted)] hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-text)]'
                          }`}
                        >
                          <IconComp
                            size={15}
                            className={
                              skill.highlight
                                ? 'text-[var(--v2-accent)] shrink-0'
                                : 'text-[var(--v2-text-dim)] shrink-0'
                            }
                            aria-hidden="true"
                          />
                          <span>{skill.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. Edge-Faded Infinite Monochrome Ecosystem Ribbon */}
        <div className="pt-2" aria-hidden="true">
          <div className="v2-hero-marquee-mask py-2">
            <div className="v2-hero-marquee-track items-center gap-10 sm:gap-14">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
                const { Icon } = item;
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="inline-flex items-center gap-2.5 text-[var(--v2-text-dim)] hover:text-[var(--v2-text)] transition-colors select-none shrink-0"
                  >
                    <Icon size={18} />
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em]">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

TechStackSection.propTypes = {
  isEn: PropTypes.bool,
};
