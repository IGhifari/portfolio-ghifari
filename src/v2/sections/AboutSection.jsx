import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMotionValueEvent, useScroll } from 'framer-motion';

/**
 * Threshold-switched About word with `transition: color 0.22s ease-out`.
 * Only updates React state when crossing its threshold (zero scroll jank).
 */
function AboutThresholdWord({ word, progress, threshold }) {
  const [isLit, setIsLit] = useState(false);

  useMotionValueEvent(progress, 'change', (latest) => {
    const nextLit = latest >= threshold;
    setIsLit((prev) => (prev !== nextLit ? nextLit : prev));
  });

  return (
    <span
      className="v2-about-word"
      style={{ color: isLit ? 'var(--v2-text)' : 'var(--v2-about-unlit)' }}
    >
      {word}
    </span>
  );
}

AboutThresholdWord.propTypes = {
  word: PropTypes.string.isRequired,
  progress: PropTypes.object.isRequired,
  threshold: PropTypes.number.isRequired,
};

/**
 * Sticky Scroll-Lit Manifesto Section (`height: 200vh`, `z-index: 2`).
 */
export default function AboutSection({ text, tag = '(ABOUT)' }) {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 40%', 'end end'],
  });

  const words = text.split(' ');

  return (
    <section
      id="v2-about"
      ref={trackRef}
      className="relative z-[2] h-[200vh] w-full bg-[var(--v2-bg)]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center px-4 sm:px-12 lg:px-[150px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col lg:flex-row items-start gap-6 lg:gap-[56px]">
          <div className="shrink-0 lg:pt-3">
            <span className="v2-section-tag">{tag}</span>
          </div>
          <p className="text-[clamp(2rem,3.88vw,3.5rem)] font-semibold tracking-[-0.06em] leading-[1.1] text-[var(--v2-text-dim)]">
            {words.map((word, index) => {
              const threshold = (index / words.length) * 0.78;
              return (
                <AboutThresholdWord
                  key={`${word}-${index}`}
                  word={word}
                  progress={scrollYProgress}
                  threshold={threshold}
                />
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

AboutSection.propTypes = {
  text: PropTypes.string.isRequired,
  tag: PropTypes.string,
};
