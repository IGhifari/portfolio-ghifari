import PropTypes from 'prop-types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

import { profileData } from '@/data/profile';
import { useLanguage } from '@/context/LanguageContext';
import RolloverLabel from '../components/ui/RolloverLabel';

const NAKULA_EASE = [0.22, 1, 0.36, 1];
const HEADLINE_META = [
  { highlight: false, delay: 0.1 },
  { highlight: false, delay: 0.2 },
  { highlight: true, delay: 0.32 },
  { highlight: true, delay: 0.44 },
];

const TRUSTED_TRACK_BRANDS = [
  'PT. AMA Salam Indonesia',
  'Universitas Gunadarma',
  'SMKN 1 Cibinong',
  '@ghifari29/id-kit',
  '509+ Vitest Suite',
];

/**
 * Portfolio V2 Sticky Hero Section (`#v2-top`)
 * Scales `1 -> 0.9`, lifts `0 -> -100px`, and fades `1 -> 0` while About rises over it.
 */
export default function HeroSection({
  jakartaTime,
  heroIntroComplete,
  isHeroExited,
  isTabletUp,
  shouldReduceMotion,
  onScrollToSection,
}) {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [49, 500], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [49, 500], [0, -100]);
  const heroScale = useTransform(scrollY, [49, 500], [1, 0.9]);

  const useHeroScrollExit = isTabletUp && !shouldReduceMotion;
  const headlineTexts = t('v2.hero.headlineLines');
  const headlineLines = (Array.isArray(headlineTexts) ? headlineTexts : []).map((text, idx) => ({
    text,
    ...(HEADLINE_META[idx] || { highlight: true, delay: 0.1 + idx * 0.1 }),
  }));

  return (
    <motion.section
      id="v2-top"
      style={
        useHeroScrollExit
          ? {
              opacity: heroOpacity,
              y: heroTranslateY,
              scale: heroScale,
              pointerEvents: isHeroExited ? 'none' : 'auto',
            }
          : undefined
      }
      className="v2-hero-sticky z-[1] min-h-[680px] md:h-screen md:min-h-[700px] w-full flex flex-col justify-between pt-[84px] pb-24 md:pt-40 lg:pt-28 overflow-hidden bg-[var(--v2-bg)] origin-center will-change-transform"
    >
      {/* Center Diagonal Cobalt-Blue Spotlight Slit Portrait (Original Profile Photo) */}
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, scale: 1.06, filter: 'blur(10px)' }
        }
        animate={
          heroIntroComplete || shouldReduceMotion
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, scale: 1.06, filter: 'blur(10px)' }
        }
        transition={{ duration: 0.95, delay: 0.05, ease: NAKULA_EASE }}
        className="v2-hero-diagonal-wrap"
        aria-hidden="true"
      >
        <div className="v2-hero-diagonal-mask">
          <img
            src={profileData.avatarImage}
            alt=""
            className="v2-hero-diagonal-img"
            loading="eager"
          />
        </div>
      </motion.div>

      {/* Mobile & Tablet Availability & Clock Row directly below fixed navbar */}
      <div className="v2-container relative z-10 flex lg:hidden items-start justify-between gap-4 pb-4">
        <div className="flex flex-col leading-[1.3]">
          <div className="flex items-center gap-2 text-[14px] font-bold tracking-[-0.03em] text-[var(--v2-text)]">
            <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
            <span>{t('v2.common.availableForProject')}</span>
          </div>
          <span className="pl-4 text-[12px] uppercase text-[var(--v2-text-muted)]">
            {t('v2.common.openForRoles')}
          </span>
        </div>
        <div className="flex flex-col text-right leading-[1.3]">
          <span className="text-[14px] font-bold tracking-[-0.03em] text-[var(--v2-text)]">
            {jakartaTime}
          </span>
          <span className="text-[12px] text-[var(--v2-text-muted)]">(GMT+7)</span>
        </div>
      </div>

      {/* Right-Aligned Stacked Display Headline ("Beyond / Visuals. / Built with / Vision.") */}
      <div className="v2-container relative z-10 my-auto flex justify-end pt-4 md:pt-8">
        <h1 className="text-right text-[clamp(2.65rem,3.9vw,3.5rem)] font-semibold tracking-[-0.06em] leading-[1.0] max-w-[300px] sm:max-w-[340px]">
          {headlineLines.map((line) => (
            <span key={line.text} className="block py-[0.02em]">
              <motion.span
                initial={
                  shouldReduceMotion
                    ? false
                    : { y: 14, opacity: 0, filter: 'blur(12px)' }
                }
                animate={
                  heroIntroComplete || shouldReduceMotion
                    ? { y: 0, opacity: 1, filter: 'blur(0px)' }
                    : { y: 14, opacity: 0, filter: 'blur(12px)' }
                }
                transition={{ duration: 0.78, delay: line.delay, ease: NAKULA_EASE }}
                className={`block will-change-transform ${
                  line.highlight ? 'text-[var(--v2-text)]' : 'text-[var(--v2-text-muted)]'
                }`}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      {/* Bottom Section: Blur-Revealed Two-Tone Statement + Infinite Track Marquee & Outlined Blue Pill CTA */}
      <div className="v2-container relative z-10 space-y-8 md:space-y-12 pt-16 md:pt-0">
        <div className="max-w-[470px]">
          <p className="text-[24px] md:text-[32px] font-semibold tracking-[-0.05em] leading-[1.06] indent-8 md:indent-12">
            <motion.span
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 14, filter: 'blur(14px)' }
              }
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 14, filter: 'blur(14px)' }
              }
              transition={{ duration: 0.86, delay: 0.26, ease: NAKULA_EASE }}
              className="text-[var(--v2-text)] inline"
            >
              {t('v2.hero.statementLead')}
            </motion.span>
            <motion.span
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 14, filter: 'blur(14px)' }
              }
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 14, filter: 'blur(14px)' }
              }
              transition={{ duration: 0.9, delay: 0.4, ease: NAKULA_EASE }}
              className="text-[var(--v2-text-dim)] inline"
            >
              {t('v2.hero.statementTail')}
            </motion.span>
          </p>
        </div>

        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 14, filter: 'blur(10px)' }
          }
          animate={
            heroIntroComplete || shouldReduceMotion
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 14, filter: 'blur(10px)' }
          }
          transition={{ duration: 0.84, delay: 0.38, ease: NAKULA_EASE }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="flex w-full lg:w-auto items-center gap-5 min-w-0">
            <span className="shrink-0 text-[12px] font-medium uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
              {t('v2.hero.trustedTrack')}
            </span>
            <div className="v2-hero-marquee-mask w-full max-w-[500px]">
              <div className="v2-hero-marquee-track">
                {[0, 1].map((dupIdx) => (
                  <div
                    key={dupIdx}
                    aria-hidden={dupIdx === 1 ? 'true' : undefined}
                    className="flex items-center gap-10 pr-10"
                  >
                    {TRUSTED_TRACK_BRANDS.map((brand) => (
                      <span
                        key={`${dupIdx}-${brand}`}
                        className="inline-flex items-center gap-2 whitespace-nowrap text-[14px] sm:text-[15px] font-semibold tracking-[-0.03em] text-[var(--v2-text-muted)]"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)]/75"
                          aria-hidden="true"
                        />
                        <span>{brand}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href="#v2-work"
            onClick={(e) => {
              e.preventDefault();
              onScrollToSection('v2-work');
            }}
            className="v2-pill-btn v2-pill-btn--accent w-full lg:w-auto lg:min-w-[310px] !h-[60px] md:!h-[64px] justify-between !px-7 !text-[18px] md:!text-[22px] !font-semibold !tracking-[-0.04em]"
          >
            <RolloverLabel text={t('v2.hero.cta')} />
            <FiArrowUpRight size={24} />
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}

HeroSection.propTypes = {
  jakartaTime: PropTypes.string.isRequired,
  heroIntroComplete: PropTypes.bool.isRequired,
  isHeroExited: PropTypes.bool.isRequired,
  isTabletUp: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool.isRequired,
  onScrollToSection: PropTypes.func.isRequired,
};
