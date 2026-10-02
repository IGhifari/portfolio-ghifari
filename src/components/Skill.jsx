import { motion, useReducedMotion } from 'framer-motion';
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiPrisma,
  SiLaravel,
  SiPhp,
  SiGit,
  SiGithub,
  SiPostman,
  SiVite,
  SiHtml5,
} from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { GrMysql } from 'react-icons/gr';
import { VscVscode } from 'react-icons/vsc';
import '../styles/Skill.css';

const techCategories = [
  {
    id: 'frontend',
    title: 'FRONTEND',
    badge: '// 01',
    description: 'Modern component architectures, fluid user interfaces, and typed client systems.',
    skills: [
      { name: 'React', icon: <SiReact size={18} />, highlight: true },
      { name: 'TypeScript', icon: <SiTypescript size={18} />, highlight: true },
      { name: 'JavaScript', icon: <SiJavascript size={18} /> },
      { name: 'Tailwind CSS', icon: <SiTailwindcss size={18} />, highlight: true },
      { name: 'Vite', icon: <SiVite size={18} /> },
      { name: 'HTML5 & CSS3', icon: <SiHtml5 size={18} /> },
    ],
  },
  {
    id: 'backend',
    title: 'BACKEND',
    badge: '// 02',
    description: 'Scalable RESTful services, server middleware, schema validation, and authentication.',
    skills: [
      { name: 'Node.js', icon: <SiNodedotjs size={18} />, highlight: true },
      { name: 'Express', icon: <SiExpress size={18} />, highlight: true },
      { name: 'Prisma ORM', icon: <SiPrisma size={18} />, highlight: true },
      { name: 'Laravel', icon: <SiLaravel size={18} /> },
      { name: 'PHP', icon: <SiPhp size={18} /> },
    ],
  },
  {
    id: 'database',
    title: 'DATABASE',
    badge: '// 03',
    description: 'Relational database schemas, normalization, query optimizations, and migrations.',
    skills: [
      { name: 'PostgreSQL', icon: <BiLogoPostgresql size={20} />, highlight: true },
      { name: 'MySQL', icon: <GrMysql size={18} /> },
    ],
  },
  {
    id: 'tools',
    title: 'TOOLS & WORKFLOW',
    badge: '// 04',
    description: 'Version control, API testing workflows, developer environments, and deployment tooling.',
    skills: [
      { name: 'Git', icon: <SiGit size={18} /> },
      { name: 'GitHub', icon: <SiGithub size={18} />, highlight: true },
      { name: 'VS Code', icon: <VscVscode size={18} /> },
      { name: 'Postman', icon: <SiPostman size={18} /> },
    ],
  },
];

const marqueeTechnologies = [
  'REACT',
  'TYPESCRIPT',
  'NODE.JS',
  'POSTGRESQL',
  'PRISMA',
  'TAILWIND CSS',
  'EXPRESS',
  'VITE',
  'MYSQL',
  'GIT',
  'GITHUB',
  'POSTMAN',
];

const Skills = () => {
  const shouldReduceMotion = useReducedMotion();

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
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  return (
    <div className="w-full text-[var(--text-primary)]">
      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        {/* ==================================================
            SECTION HEADER: 04 / TECH STACK
            ================================================== */}
        <motion.div {...getFadeMotion(0)} className="mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
              04 / TECH STACK
            </span>
            <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
          </div>
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
            TOOLS I WORK WITH<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
            A practical stack for designing, building, and deploying modern web applications from interface to database.
          </p>
        </motion.div>

        {/* ==================================================
            CATEGORIZED TECH STACK GRID
            ================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techCategories.map((category, index) => (
            <motion.div
              key={category.id}
              {...getFadeMotion(index * 0.08)}
              className="tech-card rounded-lg p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <h3 className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)] tracking-wider uppercase">
                    {category.title}
                  </h3>
                  <span className="font-mono text-[10px] text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] tracking-wider">
                    {category.badge}
                  </span>
                </div>

                {/* Category Brief */}
                <p className="font-mono text-[11px] text-[var(--text-muted)] leading-relaxed mt-2.5 mb-4">
                  {category.description}
                </p>

                {/* Technology List */}
                <ul className="space-y-2 list-none p-0 m-0">
                  {category.skills.map((skill) => (
                    <li
                      key={skill.name}
                      className="tech-item group cursor-default"
                    >
                      <span className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:scale-110 transition-all duration-150 flex items-center justify-center flex-shrink-0">
                        {skill.icon}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex-1 tracking-wide">
                        {skill.name}
                      </span>
                      {skill.highlight && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Core Technology"
                          aria-label="Core Technology"
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
