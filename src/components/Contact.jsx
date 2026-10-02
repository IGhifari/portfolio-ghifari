import { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiMail,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';
import { IoLogoGithub } from 'react-icons/io';
import { FaLinkedin, FaInstagram, FaDiscord, FaTiktok } from 'react-icons/fa';
import '../styles/Contact.css';

const contactChannels = [
  {
    name: 'GitHub',
    handle: '@IGhifari',
    desc: 'Public code, project repositories & contributions',
    url: 'https://github.com/IGhifari',
    icon: <IoLogoGithub size={18} aria-hidden="true" />,
  },
  {
    name: 'LinkedIn',
    handle: 'in/ighifari',
    desc: 'Professional network, career background & credentials',
    url: 'https://www.linkedin.com/in/ighifari/',
    icon: <FaLinkedin size={18} aria-hidden="true" />,
  },
  {
    name: 'Instagram',
    handle: '@ghfrriii',
    desc: 'Personal activities, design experiments & updates',
    url: 'https://www.instagram.com/ghfrriii/',
    icon: <FaInstagram size={18} aria-hidden="true" />,
  },
  {
    name: 'Discord',
    handle: 'ghifari#7471',
    desc: 'Real-time developer chat and collaboration',
    url: 'https://discord.com/channels/@ghifari#7471',
    icon: <FaDiscord size={18} aria-hidden="true" />,
  },
  {
    name: 'TikTok',
    handle: '@ghrfiii',
    desc: 'Short-form coding clips and creative uploads',
    url: 'https://www.tiktok.com/@ghrfiii?',
    icon: <FaTiktok size={18} aria-hidden="true" />,
  },
];

const formSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
});

const Contact = () => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const [formData, setFormData] = useState({
    emailto: 'Ghifari',
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const directEmail = 'ighifarii05@gmail.com';

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(directEmail).then(() => {
      setCopiedEmail(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopiedEmail(false), 2500);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus(null);

    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (!serviceId || !templateId || !publicKey) {
        setSubmitStatus('error');
        toast.error('Email service is temporarily offline. Please write to ighifarii05@gmail.com directly.');
        setIsSubmitting(false);
        return;
      }

      await emailjs.send(serviceId, templateId, formData, publicKey);
      setSubmitStatus('success');
      toast.success('Message delivered successfully! 🎉');
      setFormData({
        emailto: 'Ghifari',
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('EmailJS submission failure:', error);
      setSubmitStatus('error');
      toast.error('Failed to send message. Please reach out directly via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 lg:py-24 text-[var(--text-primary)]">
      <ToastContainer position="bottom-right" autoClose={4000} />

      {/* Section Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 md:mb-16"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
            07 / CONTACT
          </span>
          <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
            GET IN TOUCH
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] uppercase">
            LET&apos;S BUILD SOMETHING USEFUL<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Have a project, opportunity, or collaboration in mind? Feel free to send a message directly or connect via my channels.
          </p>
        </div>
      </motion.header>

      {/* Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 cols): Functional Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8"
        >
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-[var(--border-subtle)]">
            <div>
              <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider block">
                Direct Dispatch
              </span>
              <h3 className="font-grotesk font-bold text-xl text-[var(--text-primary)]">
                Send a Message
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              * Required fields
            </span>
          </div>

          {/* Success Banner */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-start gap-3">
              <FiCheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="font-semibold block text-[var(--text-primary)] mb-0.5">Message dispatched successfully!</strong>
                Thank you for reaching out. I have received your note and will reply as soon as possible.
              </div>
            </div>
          )}

          {/* Error Banner */}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-400 flex items-start gap-3">
              <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="font-semibold block text-[var(--text-primary)] mb-0.5">Unable to send via automated dispatch</strong>
                Please feel free to email me directly at{' '}
                <a href={`mailto:${directEmail}`} className="underline font-mono text-[var(--text-primary)]">
                  {directEmail}
                </a>.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2"
                >
                  Your Name <span className="text-[var(--accent)]">*</span>
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  disabled={isSubmitting}
                  className={`dark-form-input ${errors.name ? 'has-error' : ''}`}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="font-mono text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <FiAlertCircle size={12} aria-hidden="true" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2"
                >
                  Your Email <span className="text-[var(--accent)]">*</span>
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@example.com"
                  disabled={isSubmitting}
                  className={`dark-form-input ${errors.email ? 'has-error' : ''}`}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="font-mono text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <FiAlertCircle size={12} aria-hidden="true" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Subject (Optional) */}
            <div>
              <label
                htmlFor="contact-subject"
                className="block font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2"
              >
                Subject <span className="text-[var(--text-muted)] text-[10px] normal-case">(optional)</span>
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Project inquiry / Full-stack collaboration"
                disabled={isSubmitting}
                className="dark-form-input"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="contact-message"
                className="block font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2"
              >
                Message <span className="text-[var(--accent)]">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell me about your project, timeline, or idea..."
                disabled={isSubmitting}
                className={`dark-form-input resize-y min-h-[120px] ${errors.message ? 'has-error' : ''}`}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && (
                <p id="message-error" className="font-mono text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                  <FiAlertCircle size={12} aria-hidden="true" /> {errors.message}
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="contact-submit-btn"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-grotesk font-black text-sm tracking-wide transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>SENDING MESSAGE...</span>
                  </>
                ) : (
                  <>
                    <span>SEND MESSAGE</span>
                    <FiSend size={14} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Column (5 cols): Direct Info & Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Quick Direct Email Card */}
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider">
                Primary Channel
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AVAILABLE FOR HIRE
              </span>
            </div>

            <div>
              <h4 className="font-grotesk font-bold text-lg text-[var(--text-primary)] mb-1">
                Direct Email
              </h4>
              <p className="font-sans text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                For contract inquiries, freelance work, software roles, or casual developer chats.
              </p>

              <div className="flex items-center gap-2 p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)]">
                <FiMail size={16} className="text-[var(--accent)] shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${directEmail}`}
                  className="font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate flex-1 focus-visible:outline-none"
                >
                  {directEmail}
                </a>
                <button
                  type="button"
                  onClick={copyEmailToClipboard}
                  className="p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)] border border-[var(--border)] transition-colors cursor-pointer shrink-0 focus-visible:outline-none"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copiedEmail ? (
                    <FiCheck size={14} className="text-emerald-500" />
                  ) : (
                    <FiCopy size={14} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3 font-mono text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <FiMapPin size={12} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                <span>Bogor, Indonesia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiClock size={12} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                <span>UTC+7 (WIB)</span>
              </div>
            </div>
          </div>

          {/* Social & Developer Channels */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] px-1">
              Verified Profiles & Networks
            </h4>

            <div className="space-y-2">
              {contactChannels.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-channel-item p-3.5 rounded-lg flex items-center justify-between group no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-grotesk font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {item.handle}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[var(--text-secondary)] truncate">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <FiExternalLink
                    size={14}
                    className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0 ml-2"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
