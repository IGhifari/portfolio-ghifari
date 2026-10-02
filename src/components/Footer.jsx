import { FiArrowUp, FiGithub, FiLinkedin, FiInstagram, FiMail } from 'react-icons/fi';
import LastUpdated from './LastUpdated';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const footerLinks = [
    { label: 'GitHub', href: 'https://github.com/IGhifari', icon: <FiGithub size={15} /> },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ighifari/', icon: <FiLinkedin size={15} /> },
    { label: 'Instagram', href: 'https://www.instagram.com/ghfrriii/', icon: <FiInstagram size={15} /> },
    { label: 'Email', href: 'mailto:ighifarii05@gmail.com', icon: <FiMail size={15} /> },
  ];

  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] py-12 lg:py-16 text-[var(--text-secondary)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 space-y-10">
        {/* Top Tier: Identity & Back to Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-grotesk font-black text-2xl tracking-tight text-[var(--text-primary)]">
                GHIFARI<span className="text-[var(--accent)]">.</span>
              </span>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Web Developer · Software Engineer
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              aria-label="Scroll back to top of the page"
            >
              <span>BACK TO TOP</span>
              <FiArrowUp size={13} className="text-[var(--accent)] group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Middle Tier: Social Navigation & Architecture Note */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs font-mono">
          <nav aria-label="Footer Social Links" className="flex flex-wrap items-center gap-5">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] py-1 rounded"
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <p className="text-[var(--text-muted)] text-xs">
            Engineered with <span className="text-[var(--text-primary)]">React 18</span>, <span className="text-[var(--text-primary)]">Vite</span> &amp; <span className="text-[var(--text-primary)]">Tailwind CSS</span>
          </p>
        </div>

        {/* Bottom Tier: Copyright & Last Updated */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <p>
            &copy; {currentYear} M. Ghifari Bima Khadafi. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <LastUpdated />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
