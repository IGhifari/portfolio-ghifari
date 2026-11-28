import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiX } from 'react-icons/fi';

import { directEmail, contactChannelsData } from '@/data/contact';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import V2SeasonDrawerPicker from '../../theme/ThemeControls';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Reusable Nakula Slide-Over Right Menu Drawer shared by Home & V2 Subpages.
 */
export default function V2MenuDrawer({
  isOpen,
  onClose,
  items,
  shouldReduceMotion = false,
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="v2-menu-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.56, ease: NAKULA_EASE }}
          className="fixed inset-0 z-[130] flex justify-end bg-black/75 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={t('v2.common.menuAria')}
          onClick={onClose}
        >
          <motion.div
            key="v2-menu-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: '0%' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.78, ease: NAKULA_EASE }}
            className="flex h-full w-full max-w-[460px] flex-col justify-between overflow-y-auto border-l border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-7 py-6 sm:px-9 sm:py-7 will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--v2-border-strong)] pb-5">
              <div className="flex items-center gap-2.5 text-[13px] font-medium uppercase tracking-[-0.02em] text-[var(--v2-text-muted)]">
                <span className="inline-block h-1.5 w-1.5 bg-[var(--v2-accent)]" aria-hidden="true" />
                <span>MENU</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('v2.common.closeMenuAria')}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-text-dim)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
              >
                <FiX
                  size={17}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
              </button>
            </div>

            <nav className="my-auto py-4" aria-label="Portfolio V2 Navigation">
              <ul className="divide-y divide-[var(--v2-border)]">
                {items.map((item, idx) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.button
                      type="button"
                      initial={shouldReduceMotion ? false : { y: 28, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.62,
                        delay: 0.16 + idx * 0.08,
                        ease: NAKULA_EASE,
                      }}
                      onClick={item.action}
                      className="v2-drawer-nav-btn group flex w-full items-center py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                    >
                      <span className="v2-drawer-nav-item">
                        <span className="v2-drawer-nav-label v2-display-heading text-[48px] sm:text-[54px] text-[var(--v2-text)] group-hover:text-[var(--v2-text-bright)] transition-colors duration-300">
                          {item.label}
                        </span>
                        {item.active && (
                          <span
                            className="inline-block h-2 w-2 bg-[var(--v2-accent)] self-center"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.4, ease: NAKULA_EASE }}
              className="space-y-5 pt-4"
            >
              <V2SeasonDrawerPicker />

              <div>
                <p className="mb-1.5 text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                  (EMAIL)
                </p>
                <a
                  href={`mailto:${directEmail}`}
                  className="inline-block text-[26px] sm:text-[30px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-accent)] hover:opacity-85 transition-opacity break-all"
                >
                  {directEmail}
                </a>
              </div>

              <div>
                <p className="mb-2.5 text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                  (SOCIALS)
                </p>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-[17px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                  {contactChannelsData.map((ch) => (
                    <a
                      key={ch.key}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                    >
                      <span>{ch.name}</span>
                      <FiArrowUpRight size={14} className="text-[var(--v2-text-dim)]" />
                    </a>
                  ))}
                  <RouterLink
                    to="/recruiter"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                  >
                    <span>{t('v2.common.recruiter')}</span>
                    <FiArrowUpRight size={14} className="text-[var(--v2-text-dim)]" />
                  </RouterLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

V2MenuDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      active: PropTypes.bool,
      action: PropTypes.func.isRequired,
    })
  ).isRequired,
  shouldReduceMotion: PropTypes.bool,
};
