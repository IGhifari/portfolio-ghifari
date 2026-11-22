import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';

/**
 * ReactBits SpotlightCard (restrained edition)
 * Subtle cursor-tracked radial light sheen for dark editorial cards.
 * Disabled automatically on coarse/touch pointers and when prefers-reduced-motion is active.
 */
const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.065)',
  radius = 360,
}) => {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const [canHover, setCanHover] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const enabled = canHover && !shouldReduceMotion;

  const handlePointerMove = (e) => {
    if (!enabled || !cardRef.current || !overlayRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    overlayRef.current.style.background = `radial-gradient(${radius}px circle at ${x}px ${y}px, ${spotlightColor}, transparent 70%)`;
  };

  const handlePointerEnter = () => {
    if (!enabled || !overlayRef.current) return;
    overlayRef.current.style.opacity = '1';
  };

  const handlePointerLeave = () => {
    if (!overlayRef.current) return;
    overlayRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={enabled ? handlePointerMove : undefined}
      onPointerEnter={enabled ? handlePointerEnter : undefined}
      onPointerLeave={enabled ? handlePointerLeave : undefined}
      className={`relative overflow-hidden ${className}`}
    >
      {enabled && (
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
        />
      )}
      {children}
    </div>
  );
};

SpotlightCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  spotlightColor: PropTypes.string,
  radius: PropTypes.number,
};

export default SpotlightCard;
