import React, { useState } from 'react';
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoLogoGithub, IoMenu, IoClose } from "react-icons/io5";
import { Link } from 'react-scroll';
import '../styles/Components.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full h-16 flex justify-between items-center z-50"
      style={{
        background: 'var(--nb-yellow)',
        borderBottom: 'var(--nb-border)',
        boxShadow: '0 4px 0px #0a0a0a',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-0">
        <div
          className="px-4 h-16 flex items-center"
          style={{ borderRight: 'var(--nb-border)' }}
        >
          <img src="logo1.png" alt="Ghifari logo" className="w-8 h-8" style={{ filter: 'invert(1) grayscale(1) contrast(2)' }} />
        </div>
        <div className="px-4 h-16 flex flex-col justify-center" style={{ borderRight: 'var(--nb-border)' }}>
          <span className="font-grotesk font-black text-base leading-tight" style={{ color: 'var(--nb-black)' }}>GHIFARI</span>
          <span className="font-mono text-xs" style={{ color: 'var(--nb-black)', opacity: 0.7 }}>WEB DEV</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex h-16">
          {['profile', 'projects', 'AcademicBackground', 'contact'].map((section, i) => (
            <Link
              key={section}
              to={section}
              smooth={true}
              duration={700}
              className="h-16 px-5 flex items-center font-grotesk font-bold text-sm cursor-pointer transition-all duration-150"
              style={{
                color: 'var(--nb-black)',
                borderRight: 'var(--nb-border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--nb-black)';
                e.currentTarget.style.color = 'var(--nb-yellow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--nb-black)';
              }}
            >
              {section === 'AcademicBackground' ? 'ACADEMIC' : section.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Social icons — desktop */}
      <div className="hidden md:flex items-center h-16 social">
        {[
          { href: 'https://www.instagram.com/ghfrriii/', icon: <FaInstagram size={20} /> },
          { href: 'https://github.com/IGhifari', icon: <IoLogoGithub size={20} /> },
          { href: 'https://www.linkedin.com/in/ighifari/', icon: <FaLinkedin size={20} /> },
        ].map(({ href, icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-16 flex items-center justify-center transition-all duration-150"
            style={{ borderLeft: 'var(--nb-border)', color: 'var(--nb-black)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--nb-black)';
              e.currentTarget.style.color = 'var(--nb-yellow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--nb-black)';
            }}
          >
            {icon}
          </a>
        ))}
      </div>

      {/* Hamburger — mobile */}
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
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
            style={{ padding: '8px' }}
          />
        </button>
      </div>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed top-0 right-0 w-full h-screen flex flex-col transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-all duration-400 ease-in-out`}
        style={{ background: 'var(--nb-yellow)', borderLeft: 'var(--nb-border)', zIndex: 100 }}
      >
        <div className="p-5 flex justify-between items-center" style={{ borderBottom: 'var(--nb-border)' }}>
          <div className="flex items-center gap-3">
            <img src="logo1.png" alt="" className="w-8" style={{ filter: 'invert(1) grayscale(1) contrast(2)' }} />
            <div>
              <p className="font-grotesk font-black" style={{ color: 'var(--nb-black)' }}>GHIFARI</p>
              <p className="font-mono text-xs" style={{ color: 'var(--nb-black)', opacity: 0.7 }}>WEB DEVELOPER</p>
            </div>
          </div>
          <button onClick={toggleMenu} style={{ color: 'var(--nb-black)' }}>
            <IoClose size={32} />
          </button>
        </div>

        <ul className="flex flex-col mt-8">
          {[
            { to: 'profile', label: 'PROFILE' },
            { to: 'projects', label: 'PROJECTS' },
            { to: 'AcademicBackground', label: 'ACADEMIC' },
            { to: 'contact', label: 'CONTACT' },
          ].map(({ to, label }) => (
            <li key={to} style={{ borderBottom: '2px solid var(--nb-black)' }}>
              <Link
                to={to}
                smooth={true}
                duration={700}
                onClick={toggleMenu}
                className="block py-5 px-8 font-grotesk font-black text-2xl cursor-pointer transition-all duration-150"
                style={{ color: 'var(--nb-black)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--nb-black)'; e.currentTarget.style.color = 'var(--nb-yellow)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nb-black)'; }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex justify-center gap-6 mt-auto mb-10">
          {[
            { href: 'https://www.instagram.com/ghfrriii/', icon: <FaInstagram size={28} /> },
            { href: 'https://github.com/IGhifari', icon: <IoLogoGithub size={28} /> },
            { href: 'https://www.linkedin.com/in/ighifari/', icon: <FaLinkedin size={28} /> },
          ].map(({ href, icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center"
              style={{ border: 'var(--nb-border)', background: 'var(--nb-white)', boxShadow: 'var(--nb-shadow)', color: 'var(--nb-black)' }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
