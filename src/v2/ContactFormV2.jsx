import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import emailjs from '@emailjs/browser';
import { FiAlertCircle, FiCheckCircle, FiSend } from 'react-icons/fi';

import { useLanguage } from '../context/LanguageContext';
import { directEmail } from '../data/contact';
import { siteConfig } from '../config/site';
import { CONTACT_LIMITS, validateContactForm } from '../utils/contactValidation';
import { V2RolloverLabel } from './V2Chrome';

const COOLDOWN_MS = 60000;

/**
 * Portfolio V2 Editorial Contact Form ("Send a Message")
 * Reuses the exact EmailJS + pure-JS validation + honeypot + 60s cooldown pipeline
 * from V1 Contact.jsx, styled to match Portfolio V2's Nakula & seasonal design tokens.
 */
function ContactFormV2({ isEn: isEnProp }) {
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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Honeypot check: silently accept automated bot fills without sending
      if (formData.bot_field && formData.bot_field.trim().length > 0) {
        setStatusNotice({
          type: 'success',
          title: t('contact.successTitle'),
          body: t('contact.successBody'),
        });
        return;
      }

      // 60-second client-side cooldown to prevent duplicate spam submissions
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

  return (
    <div className="rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg-elevated)]/95 backdrop-blur-md p-6 sm:p-8 lg:p-10">
      {/* Form Top Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-7 border-b border-[var(--v2-border)]">
        <div className="space-y-1.5">
          <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--v2-accent)]">
            ({isEn ? 'SEND A MESSAGE' : 'KIRIM PESAN'})
          </span>
          <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.045em] leading-[1.08] text-[var(--v2-text)]">
            {t('contact.formTitle')}
          </h3>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--v2-text-dim)]">
          {t('contact.requiredHint')}
        </span>
      </div>

      {/* Inline Status Feedback Banner */}
      {statusNotice && (
        <div
          role={statusNotice.type === 'success' ? 'status' : 'alert'}
          aria-live="polite"
          className={`mb-7 rounded-[10px] border p-4 flex items-start gap-3 text-[13px] sm:text-[14px] leading-[1.45] ${
            statusNotice.type === 'success'
              ? 'border-[#47c554]/40 bg-[#47c554]/10 text-[var(--v2-text)]'
              : statusNotice.type === 'warning'
                ? 'border-[var(--v2-accent)]/45 bg-[var(--v2-accent)]/10 text-[var(--v2-text)]'
                : 'border-rose-500/40 bg-rose-500/10 text-[var(--v2-text)]'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <FiCheckCircle size={18} className="mt-0.5 shrink-0 text-[#47c554]" aria-hidden="true" />
          ) : (
            <FiAlertCircle
              size={18}
              className={`mt-0.5 shrink-0 ${
                statusNotice.type === 'warning' ? 'text-[var(--v2-accent)]' : 'text-rose-400'
              }`}
              aria-hidden="true"
            />
          )}
          <div className="space-y-1">
            <strong className="block font-semibold text-[var(--v2-text-bright)]">
              {statusNotice.title}
            </strong>
            <p className="text-[var(--v2-text-muted)]">
              {statusNotice.body}
              {statusNotice.showDirectFallback && (
                <>
                  {' '}
                  <a
                    href={`mailto:${directEmail}`}
                    className="underline font-mono text-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors"
                  >
                    {directEmail}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label
              htmlFor="v2-contact-name"
              className="block font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--v2-text-muted)] mb-2"
            >
              {t('contact.nameLabel')} <span className="text-[var(--v2-accent)]">*</span>
            </label>
            <input
              type="text"
              id="v2-contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('contact.namePlaceholder')}
              disabled={isSubmitting}
              maxLength={CONTACT_LIMITS.NAME_MAX}
              className={`v2-form-field ${errors.name ? 'v2-form-field--error' : ''}`}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'v2-name-error' : undefined}
            />
            {errors.name && (
              <p
                id="v2-name-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400"
              >
                <FiAlertCircle size={12} aria-hidden="true" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="v2-contact-email"
              className="block font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--v2-text-muted)] mb-2"
            >
              {t('contact.emailLabel')} <span className="text-[var(--v2-accent)]">*</span>
            </label>
            <input
              type="email"
              id="v2-contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('contact.emailPlaceholder')}
              disabled={isSubmitting}
              maxLength={CONTACT_LIMITS.EMAIL_MAX}
              className={`v2-form-field ${errors.email ? 'v2-form-field--error' : ''}`}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'v2-email-error' : undefined}
            />
            {errors.email && (
              <p
                id="v2-email-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400"
              >
                <FiAlertCircle size={12} aria-hidden="true" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Subject (Optional) */}
        <div>
          <label
            htmlFor="v2-contact-subject"
            className="block font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--v2-text-muted)] mb-2"
          >
            {t('contact.subjectLabel')}{' '}
            <span className="text-[var(--v2-text-dim)] text-[10px] normal-case tracking-normal">
              {t('contact.subjectOptional')}
            </span>
          </label>
          <input
            type="text"
            id="v2-contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder={t('contact.subjectPlaceholder')}
            disabled={isSubmitting}
            maxLength={CONTACT_LIMITS.SUBJECT_MAX}
            className={`v2-form-field ${errors.subject ? 'v2-form-field--error' : ''}`}
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'v2-subject-error' : undefined}
          />
          {errors.subject && (
            <p
              id="v2-subject-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400"
            >
              <FiAlertCircle size={12} aria-hidden="true" />
              <span>{errors.subject}</span>
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="v2-contact-message"
              className="block font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--v2-text-muted)]"
            >
              {t('contact.messageLabel')} <span className="text-[var(--v2-accent)]">*</span>
            </label>
            <span className="font-mono text-[10px] text-[var(--v2-text-dim)] tabular-nums">
              {formData.message.length}/{CONTACT_LIMITS.MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="v2-contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder={t('contact.messagePlaceholder')}
            disabled={isSubmitting}
            maxLength={CONTACT_LIMITS.MESSAGE_MAX}
            className={`v2-form-field resize-y min-h-[124px] ${errors.message ? 'v2-form-field--error' : ''}`}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'v2-message-error' : undefined}
          />
          {errors.message && (
            <p
              id="v2-message-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400"
            >
              <FiAlertCircle size={12} aria-hidden="true" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Submit Row */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="v2-pill-btn v2-pill-btn--accent !h-[54px] !px-8 !text-[14px] w-full sm:w-auto justify-between sm:justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t('contact.submittingBtn')}</span>
              </>
            ) : (
              <>
                <V2RolloverLabel text={isEn ? 'SEND MESSAGE' : 'KIRIM PESAN'} />
                <FiSend size={14} aria-hidden="true" />
              </>
            )}
          </button>

          <p className="font-mono text-[11px] text-[var(--v2-text-dim)]">
            {isEn ? 'Direct delivery · Reply < 24h' : 'Kirim langsung · Respon < 24 jam'}
          </p>
        </div>
      </form>
    </div>
  );
}

ContactFormV2.propTypes = {
  isEn: PropTypes.bool,
};

export default ContactFormV2;
