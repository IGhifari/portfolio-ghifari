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
    <nav className="fixed top-0 left-0 w-full h-20 flex justify-between items-center bg-black/5 text-white pt-5 shadow-lg z-50 backdrop-blur-sm pb-5">
      <div className="flex gap-5">
        <div className="pr-5 pl-5 flex logo">
          <div>
            <img src="logo1.png" alt="" className='w-10' />
          </div>
          <div className="pl-3">
            <div className='img1'>
              <h2 className="font-urbanist text-lg font-semibold tracking-wide">Ghifari</h2>
            </div>
            <div>
              <h1 className="font-poppins text-sm text-gray-300">Web Developer</h1>
            </div>
          </div>
        </div>
        <div className="gap-8 flex items-center navbar text-sm hidden md:flex border-l-2 border-white/20 pl-5">
          <Link to="profile" smooth={true} duration={700} className="font-outfit hover:text-cyan-400 transition-all hover:tracking-wider cursor-pointer">PROFILE</Link>
          <Link to="projects" smooth={true} duration={700} className="font-outfit hover:text-cyan-400 transition-all hover:tracking-wider cursor-pointer">PROJECTS</Link>
          <Link to="AcademicBackground" smooth={true} duration={700} className="font-outfit hover:text-cyan-400 transition-all hover:tracking-wider cursor-pointer">ACADEMIC</Link>
          <Link to="contact" smooth={true} duration={700} className="font-outfit hover:text-cyan-400 transition-all hover:tracking-wider cursor-pointer">CONTACT</Link>
        </div>
      </div>

      <div className="flex gap-5 pr-5 social">
        <a href="https://www.instagram.com/ghfrriii/">
          <FaInstagram size={22} />
        </a>
        <a href="https://github.com/IGhifari">
          <IoLogoGithub size={22} />
        </a>
        <a href="https://www.linkedin.com/in/ighifari/">
          <FaLinkedin size={22} />
        </a>
      </div>

      <div className='md:hidden pr-5'>
        <button 
          className={`menu-button ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <IoMenu size={33} className={`transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
          <IoClose size={33} className={`absolute top-0 left-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`} />
        </button>
      </div>

      <div className={`fixed top-0 right-0 w-full h-screen bg-black/90 backdrop-blur-sm text-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-all duration-500 ease-in-out flex flex-col`}>
        <div className='p-5 flex justify-between'>
          <div className="pl-3 flex">
            <div>
              <img src="logo1.png" alt="" className='w-10' />
            </div>
            <div>
              <h1>Ghifari</h1>
              <h1>Web Developer</h1>
            </div>
          </div>
          <IoClose size={35} onClick={toggleMenu} className="cursor-pointer" />
        </div>

        <ul className="flex flex-col items-center gap-6 mt-28">
          <li>
            <Link to="profile" smooth={true} duration={700} onClick={toggleMenu} className="hover:text-cyan-400 cursor-pointer">PROFILE</Link>
          </li>
          <li>
            <Link to="projects" smooth={true} duration={700} onClick={toggleMenu} className="hover:text-cyan-400 cursor-pointer">PROJECTS</Link>
          </li>
          <li>
            <Link to="AcademicBackground" smooth={true} duration={700} onClick={toggleMenu} className="hover:text-cyan-400 cursor-pointer">ACADEMIC BACKGROUND</Link>
          </li>
          <li>
            <Link to="contact" smooth={true} duration={700} onClick={toggleMenu} className="hover:text-cyan-400 cursor-pointer">CONTACT</Link>
          </li>
        </ul>

        <div className='flex justify-center gap-10 mb-5 mt-auto'>
          <a href="https://www.instagram.com/ghfrriii/">
            <FaInstagram size={30} />
          </a>
          <a href="https://github.com/IGhifari">
            <IoLogoGithub size={30} />
          </a>
          <a href="https://www.linkedin.com/in/ighifari/">
            <FaLinkedin size={30} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
