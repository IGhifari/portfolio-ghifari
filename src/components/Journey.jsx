import { useRef } from 'react';
import { motion, useScroll, useReducedMotion } from 'framer-motion';

const milestones = [
  {
    number: '01',
    stage: 'FOUNDATION',
    focus: 'Vocational Software Engineering & Core Web',
    description:
      'Started the development path by mastering fundamental programming principles and web technologies—HTML5, CSS3, JavaScript, and PHP—during vocational software engineering studies at SMKN 1 Cibinong. Established structured version control workflows with Git and built initial interactive web applications.',
    highlights: ['Semantic HTML & CSS', 'JavaScript Fundamentals', 'PHP & Relational DBs', 'Git & GitHub'],
  },
  {
    number: '02',
    stage: 'FULL-STACK TRANSITION',
    focus: 'Modern Component Architecture & REST APIs',
    description:
      'Advanced from traditional multi-page sites into modern single-page applications and modular backend systems. Adopted React and Tailwind CSS for scalable UI engineering, paired with Express.js, Prisma ORM, and MySQL/PostgreSQL to build robust RESTful backends with JWT authentication.',
    highlights: ['React & Component Systems', 'Tailwind CSS', 'Express & REST APIs', 'Prisma ORM & PostgreSQL'],
  },
  {
    number: '03',
    stage: 'SYSTEM & PRODUCT DEVELOPMENT',
    focus: 'Scalable Applications & Inclusive Platforms',
    description:
      'Engineered substantial, end-to-end applications including the AksesKita accessibility discovery platform, a full-stack Project Management System, and the Food e-commerce marketplace. Focused on reliable state management, structured schema design, form validation, and accessible UI ergonomics.',
    highlights: ['AksesKita Platform', 'Project Management System', 'Food Marketplace', 'Accessibility (a11y)'],
  },
  {
    number: '04',
    stage: 'CURRENT DIRECTION',
    focus: 'TypeScript, Architecture & Product Engineering',
    description:
      'Continuing to advance engineering rigor through TypeScript adoption across full-stack applications, scalable backend architectural patterns, frontend performance optimization, and refined interface craftsmanship.',
    highlights: ['TypeScript Adoption', 'Scalable System Architecture', 'Performance Optimization', 'Clean Code & Testing'],
  },
];

const Journey = () => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 60%'],
  });

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
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.25 },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 03 / JOURNEY
          ================================================== */}
      <motion.div {...getFadeMotion(0)} className="mb-16 md:mb-24">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
            03 / JOURNEY
          </span>
          <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
        </div>
        <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
          DEVELOPMENT JOURNEY<span className="text-[var(--accent)]">.</span>
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
          A chronological progression from core fundamentals to full-stack application development.
        </p>
      </motion.div>

      {/* ==================================================
          CHRONOLOGICAL TIMELINE WITH ACCENT SCROLL PROGRESS
          ================================================== */}
      <div ref={containerRef} className="relative max-w-4xl mx-auto">
        {/* Background Rail Line */}
        <div
          className="absolute left-3.5 sm:left-7 top-4 bottom-4 w-[2px] bg-[var(--border)]"
          aria-hidden="true"
        />

        {/* Dynamic Scroll Progress Line */}
        <motion.div
          className="absolute left-3.5 sm:left-7 top-4 bottom-4 w-[2px] bg-[var(--accent)] origin-top"
          style={{
            scaleY: shouldReduceMotion ? 1 : scrollYProgress,
          }}
          aria-hidden="true"
        />

        {/* Timeline Milestones */}
        <ol className="relative space-y-14 sm:space-y-20 list-none p-0 m-0">
          {milestones.map((item, index) => (
            <motion.li
              key={item.number}
              {...getFadeMotion(index * 0.05)}
              className="relative pl-10 sm:pl-20 group"
            >
              {/* Timeline Node Indicator */}
              <div
                className="absolute left-3.5 sm:left-7 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-colors flex items-center justify-center z-10"
                aria-hidden="true"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              </div>

              {/* Milestone Content */}
              <div className="space-y-2">
                {/* Stage Number & Focus Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-[var(--accent)] tracking-[0.2em]">
                    {item.number}
                  </span>
                  <span className="text-[var(--border)]" aria-hidden="true">/</span>
                  <span className="font-mono text-[11px] sm:text-xs text-[var(--text-secondary)] tracking-wider uppercase font-semibold">
                    {item.focus}
                  </span>
                </div>

                {/* Stage Title */}
                <h3 className="font-grotesk font-black text-xl sm:text-2xl md:text-3xl text-[var(--text-primary)] uppercase tracking-tight leading-tight">
                  {item.stage}
                </h3>

                {/* Narrative Description */}
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal pt-1">
                  {item.description}
                </p>

                {/* Technical Highlights / Tags */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {item.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-mono text-[var(--tag-text)] bg-[var(--tag-bg)] border border-[var(--tag-border)] rounded tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Journey;
