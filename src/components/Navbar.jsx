import { useState } from 'react';
import { IoMenu, IoClose } from "react-icons/io5";
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';
import '../styles/Components.css';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="nb-navbar fixed top-0 left-0 w-full h-16 flex justify-between items-center z-50">
      <div className="flex items-center gap-0">
        <div className="px-4 h-16 flex items-center" style={{ borderRight: 'var(--nb-border)' }}>
          <img
            src="logo1.png"
            alt="Ghifari logo"
            className="nb-logo w-8 h-8"
          />
        </div>
        <div className="px-4 h-16 flex flex-col justify-center" style={{ borderRight: 'var(--nb-border)' }}>
          <span className="font-grotesk font-black text-base leading-tight nb-ink">
            GHIFARI
          </span>
          <span className="font-mono text-xs nb-muted">
            WEB DEV
          </span>
        </div>

        <div className="hidden md:flex h-16">
          {[
            { to: 'profile', label: 'PROFILE' },
            { to: 'projects', label: 'PROJECTS' },
            { to: 'AcademicBackground', label: 'ACADEMIC' },
            { to: 'contact', label: 'CONTACT' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              smooth={true}
              duration={700}
              className="nb-nav-link h-16 px-5 flex items-center font-grotesk font-bold text-sm cursor-pointer transition-all duration-150"
              style={{ borderRight: 'var(--nb-border)' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center h-16">
        <button
          id="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="nb-theme-toggle h-16 px-5 flex items-center gap-2 font-mono font-bold text-xs cursor-pointer transition-all duration-150"
          style={{ borderLeft: 'var(--nb-border)' }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span>{isDark ? 'LIGHT' : 'DARK'}</span>
        </button>
      </div>

      <div className="md:hidden pr-4">
        <button
          className="menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <IoMenu
            size={24}
            className={`transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
          />
          <IoClose
            size={24}
            style={{ padding: '8px' }}
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
          />
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 w-full h-screen flex flex-col transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-all duration-400 ease-in-out`}
        style={{ background: 'var(--nb-nav-bg)', borderLeft: 'var(--nb-border)', zIndex: 100 }}
      >
        <div className="p-5 flex justify-between items-center" style={{ borderBottom: 'var(--nb-border)' }}>
          <div className="flex items-center gap-3">
            <img
              src="logo1.png"
              alt=""
              className="nb-logo w-8"
            />
            <div>
              <p className="font-grotesk font-black nb-ink">GHIFARI</p>
              <p className="font-mono text-xs nb-muted">WEB DEVELOPER</p>
            </div>
          </div>
          <button onClick={toggleMenu} className="nb-ink">
            <IoClose size={32} />
          </button>
        </div>

        <ul className="flex flex-col mt-4">
          {[
            { to: 'profile', label: 'PROFILE' },
            { to: 'projects', label: 'PROJECTS' },
            { to: 'AcademicBackground', label: 'ACADEMIC' },
            { to: 'contact', label: 'CONTACT' },
          ].map(({ to, label }) => (
            <li key={to} style={{ borderBottom: '2px solid var(--nb-line)' }}>
              <Link
                to={to}
                smooth={true}
                duration={700}
                onClick={toggleMenu}
                className="nb-nav-link block py-5 px-8 font-grotesk font-black text-2xl cursor-pointer transition-all duration-150"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={toggleTheme}
          className="nb-theme-toggle flex items-center gap-3 py-5 px-8 font-grotesk font-black text-xl cursor-pointer transition-all duration-150 mt-auto"
          style={{ borderTop: 'var(--nb-border)' }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          {isDark ? 'LIGHT MODE' : 'DARK MODE'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
