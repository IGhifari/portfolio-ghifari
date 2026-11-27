import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import emailjs from '@emailjs/browser';
import { FiAlertCircle, FiArrowUpRight, FiCheck } from 'react-icons/fi';

import { useLanguage } from '../../context/LanguageContext';
import { directEmail } from '../../data/contact';
import { siteConfig } from '../../config/site';
import { CONTACT_LIMITS, validateContactForm } from '../../utils/contactValidation';
import RolloverLabel from '../components/ui/RolloverLabel';

const COOLDOWN_MS = 60000;

const SUBJECT_PRESETS = {
  en: ['Frontend Role', 'Web Project', 'Collaboration'],
  id: ['Peluang Kerja', 'Proyek Web', 'Kolaborasi'],
};

/**
 * Portfolio V2 Architectural Inquiry Form
 * Open-canvas Nakula editorial layout: numbered `01.`–`04.` hairline rows,
 * frameless large-scale typography, animated left-to-right accent focus rule,
 * bordered V2 topic pills, and `SEND MESSAGE ↗` rollover CTA.
 */
function ContactFormSection({ isEn: isEnProp }) {
  const { t, language } = useLanguage();
  const isEn = typeof isEnProp === 'boolean' ? isEnProp : language !== 'id';

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const [formData, setFormData] = useState({
    emailto: siteConfig.shortName || 'Ghifari',
    name: '',
    email: '',
    subject: '',
    message: '',
    bot_field: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const lastSubmitTimeRef = useRef(0);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handlePresetClick = useCallback((preset) => {
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject === preset ? '' : preset,
    }));
    setErrors((prev) => {
      if (!prev.subject) return prev;
      const next = { ...prev };
      delete next.subject;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.bot_field && formData.bot_field.trim().length > 0) {
        setStatusNotice({
          type: 'success',
          title: t('contact.successTitle'),
          body: t('contact.successBody'),
        });
        return;
      }

      const now = Date.now();
      if (now - lastSubmitTimeRef.current < COOLDOWN_MS) {
        setStatusNotice({
          type: 'warning',
          title: isEn ? 'Please wait a moment' : 'Tunggu sebentar',
          body: t('contact.toastCooldown'),
        });
        return;
      }

      setIsSubmitting(true);
      setErrors({});
      setStatusNotice(null);

      const validation = validateContactForm(formData, t);
      if (!validation.success) {
        const fieldErrors = {};
        validation.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      try {
        if (!serviceId || !templateId || !publicKey) {
          setStatusNotice({
            type: 'error',
            title: t('contact.errorTitle'),
            body: t('contact.toastOffline'),
            showDirectFallback: true,
          });
          setIsSubmitting(false);
          return;
        }

        const payload = {
          emailto: formData.emailto,
          name: validation.data.name,
          email: validation.data.email,
          subject: validation.data.subject,
          message: validation.data.message,
        };

        await emailjs.send(serviceId, templateId, payload, publicKey);
        lastSubmitTimeRef.current = Date.now();

        setStatusNotice({
          type: 'success',
          title: t('contact.successTitle'),
          body: t('contact.successBody'),
        });

        setFormData({
          emailto: siteConfig.shortName || 'Ghifari',
          name: '',
          email: '',
          subject: '',
          message: '',
          bot_field: '',
        });
      } catch (err) {
        console.error('EmailJS submission failure:', err);
        setStatusNotice({
          type: 'error',
          title: t('contact.errorTitle'),
          body: t('contact.errorBody'),
          showDirectFallback: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEn, publicKey, serviceId, t, templateId]
  );

  const presets = isEn ? SUBJECT_PRESETS.en : SUBJECT_PRESETS.id;

  return (
    <div className="w-full">
      {statusNotice && (
        <div
          role={statusNotice.type === 'success' ? 'status' : 'alert'}
          aria-live="polite"
          className={`mb-8 border-l-2 pl-5 py-2 space-y-1 ${
            statusNotice.type === 'success'
              ? 'border-[#47c554]'
              : statusNotice.type === 'warning'
                ? 'border-[var(--v2-accent)]'
                : 'border-rose-500'
          }`}
        >
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-[var(--v2-text-bright)]">
            {statusNotice.type === 'success' ? (
              <FiCheck size={16} className="text-[#47c554] shrink-0" aria-hidden="true" />
            ) : (
              <FiAlertCircle
                size={16}
                className={
                  statusNotice.type === 'warning'
                    ? 'text-[var(--v2-accent)] shrink-0'
                    : 'text-rose-400 shrink-0'
                }
                aria-hidden="true"
              />
            )}
            <span>{statusNotice.title}</span>
          </div>
          <p className="text-[14px] leading-[1.45] tracking-[-0.01em] text-[var(--v2-text-muted)]">
            {statusNotice.body}
            {statusNotice.showDirectFallback && (
              <>
                {' '}
                <a
                  href={`mailto:${directEmail}`}
                  className="font-medium text-[var(--v2-accent)] hover:underline"
                >
                  {directEmail}
                </a>
                .
              </>
            )}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="border-t border-[var(--v2-border-strong)]"
      >
        {/* Honeypot anti-bot field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="v2-bot-field">Leave this empty</label>
          <input
            type="text"
            id="v2-bot-field"
            name="bot_field"
            value={formData.bot_field}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Row 01 & 02: 2-Column Architectural Hairline Split on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-[var(--v2-border-strong)]">
          <div className={`v2-inquiry-row md:pr-8 ${errors.name ? 'v2-inquiry-row--error' : ''}`}>
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="v2-inquiry-num pt-1 shrink-0" aria-hidden="true">
                01<span className="text-[var(--v2-accent)]">.</span>
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                <label
                  htmlFor="v2-contact-name"
                  className="block text-[15px] font-medium tracking-[-0.025em] text-[var(--v2-text-muted)]"
                >
                  {isEn ? "What's your name?" : 'Siapa nama Anda?'}
                </label>
                <input
                  type="text"
                  id="v2-contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={isEn ? 'John Doe *' : 'Nama lengkap Anda *'}
                  disabled={isSubmitting}
                  maxLength={CONTACT_LIMITS.NAME_MAX}
                  className="v2-inquiry-input w-full bg-transparent border-0 p-0 focus:outline-none"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'v2-name-error' : undefined}
                />
                {errors.name && (
                  <p
                    id="v2-name-error"
                    role="alert"
                    className="pt-1 text-[13px] font-medium tracking-[-0.01em] text-rose-400"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={`v2-inquiry-row md:pl-8 ${errors.email ? 'v2-inquiry-row--error' : ''}`}>
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="v2-inquiry-num pt-1 shrink-0" aria-hidden="true">
                02<span className="text-[var(--v2-accent)]">.</span>
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                <label
                  htmlFor="v2-contact-email"
                  className="block text-[15px] font-medium tracking-[-0.025em] text-[var(--v2-text-muted)]"
                >
                  {isEn ? "What's your email?" : 'Apa alamat email Anda?'}
                </label>
                <input
                  type="email"
                  id="v2-contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com *"
                  disabled={isSubmitting}
                  maxLength={CONTACT_LIMITS.EMAIL_MAX}
                  className="v2-inquiry-input w-full bg-transparent border-0 p-0 focus:outline-none"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'v2-email-error' : undefined}
                />
                {errors.email && (
                  <p
                    id="v2-email-error"
                    role="alert"
                    className="pt-1 text-[13px] font-medium tracking-[-0.01em] text-rose-400"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 03: Topic / Subject + Bordered Studio Topic Pills */}
        <div className={`v2-inquiry-row ${errors.subject ? 'v2-inquiry-row--error' : ''}`}>
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="v2-inquiry-num pt-1 shrink-0" aria-hidden="true">
              03<span className="text-[var(--v2-accent)]">.</span>
            </span>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <label
                  htmlFor="v2-contact-subject"
                  className="block text-[15px] font-medium tracking-[-0.025em] text-[var(--v2-text-muted)]"
                >
                  {isEn ? 'What are we discussing?' : 'Topik apa yang ingin dibahas?'}
                </label>

                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label={isEn ? 'Quick topics' : 'Pilihan topik'}
                >
                  {presets.map((preset) => {
                    const isSelected = formData.subject === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        disabled={isSubmitting}
                        aria-pressed={isSelected}
                        className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] ${
                          isSelected
                            ? 'border-[var(--v2-accent)] bg-[var(--v2-accent)] text-[var(--v2-accent-ink)]'
                            : 'border-[var(--v2-border-strong)] bg-transparent text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)]'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                id="v2-contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={
                  isEn
                    ? 'Frontend Engineer role, web platform, etc. (Optional)'
                    : 'Posisi Frontend Engineer, proyek web, dll. (Opsional)'
                }
                disabled={isSubmitting}
                maxLength={CONTACT_LIMITS.SUBJECT_MAX}
                className="v2-inquiry-input w-full bg-transparent border-0 p-0 focus:outline-none"
                aria-invalid={errors.subject ? 'true' : 'false'}
                aria-describedby={errors.subject ? 'v2-subject-error' : undefined}
              />
              {errors.subject && (
                <p
                  id="v2-subject-error"
                  role="alert"
                  className="pt-1 text-[13px] font-medium tracking-[-0.01em] text-rose-400"
                >
                  {errors.subject}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Row 04: Message */}
        <div className={`v2-inquiry-row ${errors.message ? 'v2-inquiry-row--error' : ''}`}>
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="v2-inquiry-num pt-1 shrink-0" aria-hidden="true">
              04<span className="text-[var(--v2-accent)]">.</span>
            </span>
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="v2-contact-message"
                  className="block text-[15px] font-medium tracking-[-0.025em] text-[var(--v2-text-muted)]"
                >
                  {isEn ? 'Tell me about your project or role' : 'Ceritakan detail proyek atau peran'}
                </label>
                {formData.message.length > 4000 && (
                  <span className="text-[11px] tabular-nums text-[var(--v2-text-dim)]">
                    {formData.message.length}/{CONTACT_LIMITS.MESSAGE_MAX}
                  </span>
                )}
              </div>

              <textarea
                id="v2-contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                placeholder={
                  isEn
                    ? 'Scope, timeline, goals, or team context... *'
                    : 'Ruang lingkup, timeline, tujuan, atau konteks tim... *'
                }
                disabled={isSubmitting}
                maxLength={CONTACT_LIMITS.MESSAGE_MAX}
                className="v2-inquiry-input w-full bg-transparent border-0 p-0 resize-y min-h-[92px] focus:outline-none"
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'v2-message-error' : undefined}
              />
              {errors.message && (
                <p
                  id="v2-message-error"
                  role="alert"
                  className="pt-1 text-[13px] font-medium tracking-[-0.01em] text-rose-400"
                >
                  {errors.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Editorial Action Row */}
        <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="v2-pill-btn v2-pill-btn--accent !h-[60px] !px-8 !text-[15px] w-full sm:w-auto sm:min-w-[235px] justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span>{isEn ? 'SENDING...' : 'MENGIRIM...'}</span>
                <span
                  className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                <RolloverLabel text={isEn ? 'SEND MESSAGE' : 'KIRIM PESAN'} />
                <FiArrowUpRight size={20} aria-hidden="true" />
              </>
            )}
          </button>

          <p className="text-[14px] tracking-[-0.02em] text-[var(--v2-text-dim)]">
            {isEn ? 'Usually responds within 24 hours.' : 'Biasanya membalas dalam 24 jam.'}
          </p>
        </div>
      </form>
    </div>
  );
}

ContactFormSection.propTypes = {
  isEn: PropTypes.bool,
};

export default ContactFormSection;
