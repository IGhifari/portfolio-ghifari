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
    <footer className="bg-[#080808] border-t border-[#1C1C20] py-12 lg:py-16 text-[#A1A1AA]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 space-y-10">
        {/* Top Tier: Identity & Back to Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#1C1C20]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-grotesk font-black text-2xl tracking-tight text-[#F5F5F5]">
                GHIFARI<span className="text-[#FACC15]">.</span>
              </span>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
              Web Developer · Software Engineer
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#101012] border border-[#27272A] hover:border-[#3F3F46] text-xs font-mono text-[#D4D4D8] hover:text-[#FACC15] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
              aria-label="Scroll back to top of the page"
            >
              <span>BACK TO TOP</span>
              <FiArrowUp size={13} className="text-[#FACC15] group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
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
                className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#FACC15] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15] py-1 rounded"
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <p className="text-[#71717A] text-xs">
            Engineered with <span className="text-[#D4D4D8]">React 18</span>, <span className="text-[#D4D4D8]">Vite</span> &amp; <span className="text-[#D4D4D8]">Tailwind CSS</span>
          </p>
        </div>

        {/* Bottom Tier: Copyright & Last Updated */}
        <div className="pt-6 border-t border-[#141418] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#71717A]">
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
