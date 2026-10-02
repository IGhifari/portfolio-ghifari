import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * ReactBits TiltedCard
 * Provides a very subtle 3D tilt and gentle glare highlight on hover.
 * Strictly limited to ±3 degrees and scale 1.015 for premium editorial feel.
 * Automatically disabled on touch devices, small screens, and prefers-reduced-motion.
 */
const TiltedCard = ({
  children,
  className = '',
  maxTilt = 3,
  scale = 1.015,
  showGlare = true,
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrSmall, setIsTouchOrSmall] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const checkEnvironment = () => {
      const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isSmall = typeof window !== 'undefined' && window.innerWidth < 1024;
      setIsTouchOrSmall(isTouch || isSmall);
    };

    checkEnvironment();
    window.addEventListener('resize', checkEnvironment);
    return () => window.removeEventListener('resize', checkEnvironment);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 25 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  // Subtle glare coordinates
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], [15, 85]);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], [15, 85]);

  const handleMouseMove = (e) => {
    if (isTouchOrSmall || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseEnter = () => {
    if (!isTouchOrSmall && !shouldReduceMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // If mobile, tablet, or reduced motion, render clean static container
  if (isTouchOrSmall || shouldReduceMotion) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ perspective: '1000px' }}
      className="w-full flex items-center justify-center"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-lg will-change-transform ${className}`}
      >
        {children}

        {/* Subtle, non-intrusive glare highlight */}
        {showGlare && (
          <motion.div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.12 : 0,
              background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(250, 204, 21, 0.25) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 65%)`,
            }}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </div>
  );
};

TiltedCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxTilt: PropTypes.number,
  scale: PropTypes.number,
  showGlare: PropTypes.bool,
};

export default TiltedCard;
