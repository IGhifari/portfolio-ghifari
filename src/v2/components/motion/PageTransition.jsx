import { motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useTheme } from '@/context/ThemeContext';
import { useV2TransitionState } from './openingState';
import { buildV2SeasonTokens } from '../../theme/seasonPalette';

const CURTAIN_WIPE_EASE = [0.76, 0, 0.24, 1];
const LOGO_RISE_EASE = [0.22, 1, 0.36, 1];

/**
 * Persistent Portfolio V2 Page Transition Curtain (`100% -> 0% -> -100%`)
 * Automatically adopts the active seasonal accent & contrast ink!
 */
export default function V2PageTransition() {
  const { phase, showLogo, runId } = useV2TransitionState();
  const { season, seasonalEnabled } = useTheme();

  if (phase === 'idle') {
    return null;
  }

  const tokens = buildV2SeasonTokens(season, seasonalEnabled);
  const curtainBg = tokens['--v2-accent'];
  const curtainInk = tokens['--v2-accent-ink'];

  const targetY =
    phase === 'covering' ? '0%' : phase === 'holding' ? '0%' : '-100%';
  const duration = phase === 'covering' ? 0.54 : phase === 'uncovering' ? 0.62 : 0;

  return (
    <motion.div
      key={`v2-curtain-run-${runId}`}
      data-v2-page-curtain={phase}
      initial={{ y: '100%' }}
      animate={{ y: targetY }}
      transition={{
        duration,
        ease: CURTAIN_WIPE_EASE,
      }}
      style={{ backgroundColor: curtainBg, color: curtainInk }}
      className="fixed inset-0 z-[165] flex items-center justify-center select-none pointer-events-auto will-change-transform"
      aria-hidden="true"
    >
      <div className="overflow-hidden px-6 py-3">
        <motion.div
          initial={{ opacity: 0, y: '108%' }}
          animate={
            showLogo
              ? { opacity: 1, y: '0%' }
              : { opacity: 0, y: '108%' }
          }
          transition={{ duration: 0.44, ease: LOGO_RISE_EASE }}
          style={{
            color: curtainInk,
            fontFamily: "'Anton', 'Space Grotesk', Impact, sans-serif",
          }}
          className="inline-flex items-start uppercase tracking-[-0.015em] text-[clamp(3.75rem,7.2vw,6.5rem)] leading-[0.86] will-change-transform"
        >
          <span>{siteConfig.brandName}</span>
          <span
            style={{
              color: curtainInk,
              fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
            className="ml-[0.14em] mt-[0.03em] text-[0.23em] font-bold leading-none"
          >
            ®
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
