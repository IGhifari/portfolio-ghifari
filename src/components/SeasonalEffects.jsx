import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ENABLE_SEASONAL_THEMES } from '../config/site';
import '../styles/SeasonalEffects.css';

/**
 * Minimalist geometric SVG glyphs strictly for the 6 single-month seasonal events.
 */
const ParticleGlyph = ({ type, size, color, variant = 0 }) => {
  switch (type) {
    case 'fireworks':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill={color} />
        </svg>
      );
    case 'hearts':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 13.4s-5.2-3.2-5.2-6.6A3 3 0 0 1 8 4.6a3 3 0 0 1 5.2 2.2c0 3.4-5.2 6.6-5.2 6.6Z"
            stroke={color}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'easter':
      if (variant % 2 === 1) {
        return (
          <svg width={size} height={size * 1.1} viewBox="0 0 16 18" fill="none" aria-hidden="true">
            <path
              d="M5.5 8.2C4.9 4.5 5 1.8 6.2 1.8s1.5 2.7 1.2 6.2M10.5 8.2c.6-3.7.5-6.4-.7-6.4s-1.5 2.7-1.2 6.2M4.3 11.4a3.7 3.7 0 0 1 7.4 0c0 2-1.6 3.6-3.7 3.6s-3.7-1.6-3.7-3.6Z"
              stroke={color}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
      return (
        <svg width={size} height={size * 1.15} viewBox="0 0 16 18" fill="none" aria-hidden="true">
          <path
            d="M8 1.6C10.8 1.6 13.2 6 13.2 10.2C13.2 13.8 10.9 16.4 8 16.4C5.1 16.4 2.8 13.8 2.8 10.2C2.8 6 5.2 1.6 8 1.6Z"
            stroke={color}
            strokeWidth="1.25"
          />
          <path
            d="M3.4 9.6L5.7 7.9L8 9.6L10.3 7.9L12.6 9.6"
            stroke={color}
            strokeWidth="1.05"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'halloween':
      return (
        <svg width={size * 1.45} height={size * 0.9} viewBox="0 0 24 14" fill="none" aria-hidden="true">
          <path
            d="M12 7.5C10.5 5 6.5 2 1 4.5c2 2.2 2.8 4.2 3 6.5 2.2-1.2 4.5-1 6 .8l2 1.7 2-1.7c1.5-1.8 3.8-2 6-.8.2-2.3 1-4.3 3-6.5-5.5-2.5-9.5.5-11 3Z"
            fill={color}
            fillOpacity="0.52"
          />
        </svg>
      );
    case 'winter':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1v14M1.94 4.5l12.12 7M14.06 4.5L1.94 11.5"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

ParticleGlyph.propTypes = {
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  variant: PropTypes.number,
};

const SeasonalEffects = () => {
  const { season, seasonalEnabled } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isHidden, setIsHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden);
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const effect = season?.effect;
  const particleDescriptors = useMemo(() => {
    if (!effect || !season?.isSeasonalActive || shouldReduceMotion) return [];
    const baseCount = effect.count || 0;
    const count = isMobile ? Math.max(4, Math.ceil(baseCount * 0.6)) : baseCount;
    const speedMult = effect.speedMultiplier || 1;

    return Array.from({ length: count }, (_, idx) => {
      const seedA = ((idx * 37 + 13) % 100) / 100;
      const seedB = ((idx * 53 + 29) % 100) / 100;
      const seedC = ((idx * 71 + 7) % 100) / 100;
      const color = idx % 3 === 2 && effect.tertiaryColor
        ? effect.tertiaryColor
        : idx % 3 === 0
        ? effect.secondaryColor
        : effect.primaryColor;
      const size = effect.type === 'warmLight'
        ? Math.round(90 + seedA * 90)
        : Math.round(9 + seedA * 6);

      const durationSec = (
        effect.type === 'warmLight'
          ? 12 + seedB * 8
          : effect.type === 'halloween'
          ? 16 + seedB * 10
          : effect.type === 'fireworks'
          ? 2.8 + seedB * 2.2
          : 11 + seedB * 9
      ) / speedMult;

      const opacity = effect.type === 'warmLight'
        ? 0.09 + seedC * 0.05
        : effect.type === 'hearts'
        ? 0.16 + seedC * 0.12
        : effect.type === 'winter'
        ? 0.25 + seedC * 0.2
        : effect.type === 'fireworks'
        ? 0.34 + seedC * 0.22
        : 0.24 + seedC * 0.14;

      return {
        id: `${season.id}-${idx}`,
        variant: idx,
        leftPct: `${Math.round(5 + seedA * 90)}%`,
        topPct: `${Math.round(8 + seedB * 76)}%`,
        yVh: `${Math.round(12 + seedB * 28)}vh`,
        delaySec: `-${(seedC * durationSec).toFixed(2)}s`,
        durationSec: `${durationSec.toFixed(2)}s`,
        driftPx: `${Math.round((seedC - 0.5) * 48)}px`,
        opacity: opacity.toFixed(2),
        size,
        color,
      };
    });
  }, [effect, isMobile, season?.id, season?.isSeasonalActive, shouldReduceMotion]);

  // Render zero DOM elements during default/inactive months (3, 5, 7, 8, 9, 11) or when disabled
  if (!ENABLE_SEASONAL_THEMES || !seasonalEnabled || !season?.isSeasonalActive || !effect) {
    return null;
  }

  const getParticleClass = () => {
    switch (effect.type) {
      case 'hearts':
        return 'seasonal-particle seasonal-particle--rise';
      case 'warmLight':
        return 'seasonal-particle seasonal-particle--orb';
      case 'fireworks':
        return 'seasonal-particle seasonal-particle--twinkle';
      case 'halloween':
        return 'seasonal-particle seasonal-particle--glide';
      default:
        return 'seasonal-particle seasonal-particle--fall';
    }
  };

  // January distant firework burst rings (strictly upper sky backdrop, never cluttered)
  const fireworkBursts = effect.type === 'fireworks' && !shouldReduceMotion
    ? [
        { left: '16%', top: '18%', size: 68, color: '#FBBF24', delay: '0s' },
        { left: '78%', top: '14%', size: 84, color: '#CBD5E1', delay: '1.8s' },
        { left: '54%', top: '26%', size: 58, color: '#FBBF24', delay: '3.4s' },
      ].slice(0, isMobile ? 2 : 3)
    : [];

  return (
    <div className={isHidden ? 'seasonal-paused' : ''} aria-hidden="true">
      <div className="seasonal-ambient-wash" />

      {effect.hasSunshine && <div className="seasonal-sunshine-glow" />}

      {effect.hasFog && !shouldReduceMotion && <div className="seasonal-fog-layer" />}

      {!shouldReduceMotion && (
        <div className="seasonal-effects-layer">
          {fireworkBursts.map((b, idx) => (
            <span
              key={`fw-${idx}`}
              className="seasonal-firework-burst"
              style={{
                left: b.left,
                top: b.top,
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderColor: b.color,
                animationDelay: b.delay,
              }}
            />
          ))}

          {effect.hasPumpkins && (
            <>
              <svg
                className="seasonal-halloween-pumpkin seasonal-halloween-pumpkin--left"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 4v2M10 6.2c-3.8 0-6.8 2.8-6.8 6.4 0 3.7 3 6.4 6.8 6.4h4c3.8 0 6.8-2.7 6.8-6.4 0-3.6-3-6.4-6.8-6.4h-4Z"
                  stroke="#F97316"
                  strokeWidth="1.25"
                />
                <path
                  d="M12 6.2c-1.8 1.5-2.6 3.9-2.6 6.4s.8 4.9 2.6 6.4M12 6.2c1.8 1.5 2.6 3.9 2.6 6.4s-.8 4.9-2.6 6.4"
                  stroke="#F97316"
                  strokeWidth="1.1"
                />
              </svg>
              {!isMobile && (
                <svg
                  className="seasonal-halloween-pumpkin seasonal-halloween-pumpkin--right"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 4v2M10 6.2c-3.8 0-6.8 2.8-6.8 6.4 0 3.7 3 6.4 6.8 6.4h4c3.8 0 6.8-2.7 6.8-6.4 0-3.6-3-6.4-6.8-6.4h-4Z"
                    stroke="#A855F7"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M12 6.2c-1.8 1.5-2.6 3.9-2.6 6.4s.8 4.9 2.6 6.4M12 6.2c1.8 1.5 2.6 3.9 2.6 6.4s-.8 4.9-2.6 6.4"
                    stroke="#A855F7"
                    strokeWidth="1.1"
                  />
                </svg>
              )}
            </>
          )}

          {particleDescriptors.map((p) => {
            const style = {
              left: effect.type === 'halloween' ? undefined : p.leftPct,
              top: effect.type === 'warmLight' || effect.type === 'fireworks' ? p.topPct : undefined,
              width: effect.type === 'warmLight' ? `${p.size}px` : undefined,
              height: effect.type === 'warmLight' ? `${p.size}px` : undefined,
              backgroundColor: effect.type === 'warmLight' ? p.color : undefined,
              animationDuration: p.durationSec,
              animationDelay: p.delaySec,
              '--p-opacity': p.opacity,
              '--p-drift': p.driftPx,
              '--p-y': p.yVh,
            };
            if (effect.type === 'warmLight') {
              style.opacity = p.opacity;
            }
            return (
              <span key={p.id} className={getParticleClass()} style={style}>
                {effect.type !== 'warmLight' && (
                  <ParticleGlyph type={effect.type} size={p.size} color={p.color} variant={p.variant} />
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeasonalEffects;
