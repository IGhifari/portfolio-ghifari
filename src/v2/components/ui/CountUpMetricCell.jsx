import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { animate, motion } from 'framer-motion';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Reusable Staggered-Rise + Ease-Out Integer Count-Up Metric Cell
 * Shared by "NUMBERS DON'T LIE" and "GITHUB ACTIVITY" sections.
 */
export default function CountUpMetricCell({
  target,
  suffix = '',
  label,
  sub = '',
  index = 0,
  isTriggered = true,
  shouldReduceMotion = false,
  locale,
  className = '',
}) {
  const numericTarget = Number(target) || 0;
  const [count, setCount] = useState(() => (shouldReduceMotion ? numericTarget : 0));
  const currentCountRef = useRef(shouldReduceMotion ? numericTarget : 0);
  const hasAnimatedOnceRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      currentCountRef.current = numericTarget;
      setCount(numericTarget);
      return undefined;
    }
    if (!isTriggered) return undefined;

    const fromValue = hasAnimatedOnceRef.current ? currentCountRef.current : 0;
    const delay = hasAnimatedOnceRef.current ? 0 : index * 0.12;
    hasAnimatedOnceRef.current = true;

    const controls = animate(fromValue, numericTarget, {
      duration: 1.75,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        currentCountRef.current = rounded;
        setCount(rounded);
      },
    });

    return () => controls.stop();
  }, [index, isTriggered, numericTarget, shouldReduceMotion]);

  const formattedCount = locale ? count.toLocaleString(locale) : String(count);
  const formattedTarget = locale ? numericTarget.toLocaleString(locale) : String(numericTarget);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 52 }}
      animate={
        shouldReduceMotion || isTriggered ? { opacity: 1, y: 0 } : { opacity: 0, y: 52 }
      }
      transition={{
        duration: 0.72,
        delay: index * 0.12,
        ease: NAKULA_EASE,
      }}
      className={`v2-metric-cell will-change-transform ${className}`}
    >
      <div className="v2-metric-ticks" aria-hidden="true" />

      <div className="flex items-baseline" aria-label={`${formattedTarget}${suffix}`}>
        <span className="text-[48px] sm:text-[72px] xl:text-[80px] font-semibold tracking-[-0.07em] leading-none text-[var(--v2-text)]">
          {formattedCount}
        </span>
        <span className="text-[40px] sm:text-[60px] xl:text-[68px] font-semibold tracking-[-0.06em] leading-none text-[var(--v2-accent)]">
          {suffix}
        </span>
      </div>

      {sub ? (
        <div className="mt-10 space-y-1">
          <p className="text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] leading-[1.25] text-[var(--v2-text)]">
            {label}
          </p>
          <p className="text-[13px] tracking-[-0.015em] text-[var(--v2-text-dim)]">
            {sub}
          </p>
        </div>
      ) : (
        <p className="mt-12 max-w-[185px] text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] leading-[1.3] text-[var(--v2-text-muted)]">
          {label}
        </p>
      )}
    </motion.div>
  );
}

CountUpMetricCell.propTypes = {
  target: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  suffix: PropTypes.string,
  label: PropTypes.string.isRequired,
  sub: PropTypes.string,
  index: PropTypes.number,
  isTriggered: PropTypes.bool,
  shouldReduceMotion: PropTypes.bool,
  locale: PropTypes.string,
  className: PropTypes.string,
};
