import { useState } from 'react';
import PropTypes from 'prop-types';

import { directEmail } from '@/data/contact';
import { useLanguage } from '@/context/LanguageContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';

/**
 * Portfolio V2 FAQ Accordion Section (`#v2-faq`)
 * 2-column editorial layout with Nakula morphing FAQ cards.
 */
export default function FaqSection({ shouldReduceMotion }) {
  const { t } = useLanguage();
  const [openFaqIdx, setOpenFaqIdx] = useState(-1);

  const translatedItems = t('v2.faq.items');
  const faqItems = Array.isArray(translatedItems) ? translatedItems : [];

  return (
    <section
      id="v2-faq"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
    >
      <div className="v2-container">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-20">
          <div className="lg:w-[220px] shrink-0 space-y-4">
            <MaskedDisplayHeading
              lines={['FAQ']}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
            <div className="text-[16px] leading-[1.35] tracking-[-0.02em]">
              <p className="text-[var(--v2-text)]">
                {t('v2.faq.prompt')}
              </p>
              <a
                href={`mailto:${directEmail}`}
                className="font-medium text-[var(--v2-accent)] hover:underline"
              >
                {t('v2.faq.contactCta')}
              </a>
            </div>
          </div>

          <div className="w-full lg:max-w-[800px] space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              const panelId = `v2-faq-panel-${idx}`;
              return (
                <div
                  key={item.q}
                  data-open={isOpen ? 'true' : 'false'}
                  className="v2-faq-card"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-6 p-6 sm:px-8 sm:py-7 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-[12px]"
                  >
                    <span className="text-[22px] sm:text-[30px] font-semibold tracking-[-0.045em] leading-[1.1] text-[var(--v2-text)]">
                      {item.q}
                    </span>
                    <span className="v2-faq-icon" aria-hidden="true">
                      <span className="v2-faq-bar v2-faq-bar--h" />
                      <span className="v2-faq-bar v2-faq-bar--v" />
                    </span>
                  </button>

                  <div
                    id={panelId}
                    aria-hidden={!isOpen}
                    className="v2-faq-panel"
                  >
                    <div className="v2-faq-panel-inner">
                      <div className="v2-faq-answer px-6 pb-6 sm:px-8 sm:pb-8 sm:pr-14 -mt-1">
                        <p className="text-[15px] sm:text-[16px] leading-[1.48] tracking-[-0.015em] text-[var(--v2-text-muted)]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

FaqSection.propTypes = {
  shouldReduceMotion: PropTypes.bool.isRequired,
};
