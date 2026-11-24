import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';
import { useV2TransitionState } from './v2OpeningState';

const CURTAIN_WIPE_EASE = [0.76, 0, 0.24, 1];
const LOGO_RISE_EASE = [0.22, 1, 0.36, 1];

/**
 * Persistent Portfolio V2 Page Transition Curtain (`100% -> 0% -> -100%`)
 * Mounted once at the V2 root in `App.jsx` so it smoothly covers the outgoing page
 * from bottom to top, reveals `GHIFARI®`, and lifts upward to unveil the incoming page.
 */
export default function V2PageTransition() {
  const { phase, showLogo, runId } = useV2TransitionState();

  if (phase === 'idle') {
    return null;
  }

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
      className="fixed inset-0 z-[165] flex items-center justify-center bg-[#3b82f6] select-none pointer-events-auto will-change-transform"
      aria-hidden="true"
    >
      <div className="overflow-hidden px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: '105%' }}
          animate={
            showLogo
              ? { opacity: 1, y: '0%' }
              : { opacity: 0, y: '105%' }
          }
          transition={{ duration: 0.44, ease: LOGO_RISE_EASE }}
          className="v2-display-heading !text-[#0a0a0a] text-[clamp(3.25rem,5.8vw,5.25rem)] leading-none will-change-transform"
        >
          {siteConfig.brandName}
          <span className="text-[0.34em] align-top ml-1 font-sans font-normal text-[#0a0a0a]">
            ®
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
