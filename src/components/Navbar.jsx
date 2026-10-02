import { useState, useEffect } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { FiSun, FiMoon } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';
import '../styles/Components.css';

const NAV_ITEMS = [
  { to: 'projects', label: 'WORK' },
  { to: 'about', label: 'ABOUT' },
  { to: 'skills', label: 'STACK' },
  { to: 'journey', label: 'JOURNEY' },
  { to: 'contact', label: 'CONTACT' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`dark-navbar ${
        isScrolled ? 'dark-navbar-scrolled shadow-sm' : 'dark-navbar-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="profile"
          smooth={true}
          duration={600}
          offset={-80}
          className="cursor-pointer font-grotesk font-black text-lg md:text-xl tracking-tight text-[#F5F5F5] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
          aria-label="Ghifari - Home"
        >
          GHIFARI<span className="text-[#FACC15]">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8" aria-label="Main Navigation">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              smooth={true}
              duration={600}
              offset={-70}
              spy={true}
              activeClass="!text-[#FACC15]"
              className="dark-nav-link cursor-pointer uppercase py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Controls (Theme Toggle) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-[#FACC15] bg-[#101012]/60 hover:bg-[#18181B] border border-[#27272A]/70 hover:border-[#3F3F46] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </div>

        {/* Mobile Actions: Theme Toggle + Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-[#FACC15] bg-[#101012]/60 hover:bg-[#18181B] border border-[#27272A]/70 transition-all focus-visible:outline-none"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#F5F5F5] hover:text-[#FACC15] bg-[#101012]/60 hover:bg-[#18181B] border border-[#27272A]/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
          >
            {isMenuOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay / Drawer */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bg-[#080808]/98 backdrop-blur-xl border-b border-[#27272A] transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'h-[calc(100vh-4rem)] opacity-100 py-6' : 'h-0 opacity-0 py-0'
        }`}
        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-6 flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              smooth={true}
              duration={600}
              offset={-70}
              onClick={closeMenu}
              spy={true}
              activeClass="!text-[#FACC15] !bg-[#141417]"
              className="py-3 px-4 text-[#A1A1AA] hover:text-[#FACC15] hover:bg-[#141417] rounded-md font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
