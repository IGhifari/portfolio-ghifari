import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Reusable Work Showcase Card with 3-phase outer scale (`0.62 -> 1 -> 0.62`),
 * inverse inner counter-scale (`1.55 -> 1 -> 1.55`), and spring frosted cursor badge.
 */
export default function WorkShowcaseCard({
  project,
  index,
  onVisible,
  isDesktop,
  shouldReduceMotion = false,
}) {
  const { t, resolve } = useLanguage();
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pillX = useSpring(mouseX, { stiffness: 340, damping: 28, mass: 0.4 });
  const pillY = useSpring(mouseY, { stiffness: 340, damping: 28, mass: 0.4 });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const outerScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.62, 1, 1, 0.62]);
  const innerCounterScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [1.55, 1, 1, 1.55]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(index);
          }
        });
      },
      { rootMargin: '-36% 0px -38% 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.jump(e.clientX - rect.left);
    mouseY.jump(e.clientY - rect.top);
    setIsHovered(true);
  };

  const subtitleText = resolve(project.subtitle);
  const descriptionText = resolve(project.description);
  const useScaleChoreography = isDesktop && !shouldReduceMotion;

  return (
    <article id={`v2-work-item-${project.id}`} ref={cardRef} className="group w-full">
      <motion.div
        style={useScaleChoreography ? { scale: outerScale } : undefined}
        className="origin-center will-change-transform"
      >
        <RouterLink
          to={`/study-case/${project.id}`}
          aria-label={`${project.title} — ${subtitleText}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-[12px]"
        >
          <div
            className="v2-work-card-frame aspect-[16/11] lg:aspect-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
          >
            {!shouldReduceMotion && (
              <motion.div
                className="v2-view-project-pill hidden lg:inline-flex"
                style={{ left: pillX, top: pillY }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.78,
                }}
                transition={{ duration: 0.18, ease: NAKULA_EASE }}
                aria-hidden="true"
              >
                <span>{t('v2.common.viewProject')}</span>
                <FiArrowUpRight size={14} />
              </motion.div>
            )}

            <motion.div
              style={useScaleChoreography ? { scale: innerCounterScale } : undefined}
              className="v2-work-card-img-wrap origin-center"
            >
              <img
                src={project.image}
                alt={project.title}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="v2-work-card-img"
              />
            </motion.div>
          </div>
        </RouterLink>
      </motion.div>

      {/* Mobile & Tablet Project Metadata */}
      <div className="lg:hidden mt-4 space-y-2">
        <h3 className="text-[32px] font-semibold tracking-[-0.05em] leading-[1.05] text-[var(--v2-text)]">
          <RouterLink
            to={`/study-case/${project.id}`}
            className="hover:text-[var(--v2-accent)] transition-colors"
          >
            {project.title}
          </RouterLink>
        </h3>
        <p className="text-[18px] font-medium tracking-[-0.035em] leading-[1.2] text-[var(--v2-text-muted)]">
          {subtitleText}
        </p>
        <p className="text-sm text-[var(--v2-text-dim)] leading-relaxed line-clamp-2">
          {descriptionText}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold uppercase tracking-[-0.02em]">
          <RouterLink
            to={`/study-case/${project.id}`}
            className="inline-flex items-center gap-1 text-[var(--v2-text)] hover:text-[var(--v2-accent)]"
          >
            <span>{t('v2.common.caseStudy')}</span>
            <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
          </RouterLink>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)]"
            >
              <span>Live</span>
              <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)]"
            >
              <span>GitHub</span>
              <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

WorkShowcaseCard.propTypes = {
  project: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onVisible: PropTypes.func.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};
