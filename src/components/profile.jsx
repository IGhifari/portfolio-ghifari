import React from 'react';
import TypeIt from "typeit-react";
import '../styles/Components.css';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const { isDark } = useTheme();
    return (
        <div className='min-h-screen w-full flex items-center' style={{ paddingTop: '64px' }}>
            <div className='profile z-10 w-full max-w-5xl mx-auto px-6 md:px-12 py-16'>
                <div className='space-y-6'>

                    {/* Badge */}
                    <div>
                        <span className="nb-hero-badge">
                            👋 Hello, I'm
                        </span>
                    </div>

                    {/* Name */}
                    <div>
                        <h1 className="nb-hero-name">
                            M.Ghifari<br/>Bima Khadafi
                        </h1>
                    </div>

                    {/* TypeIt Role */}
                    <div>
                        <div className="nb-typeit-wrapper inline-block">
                            <TypeIt
                                options={{ loop: true, loopDelay: 2000, speed: 100 }}
                                getBeforeInit={(instance) => {
                                    instance
                                        .type("Web Developer")
                                        .pause(750)
                                        .delete(13)
                                        .pause(700)
                                        .type("Student")
                                    return instance;
                                }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <p
                        className='text-lg max-w-2xl leading-relaxed font-grotesk'
                        style={{
                            color: isDark ? '#E0E0E0' : 'var(--nb-black)',
                            borderLeft: isDark ? '4px solid #E0E0E0' : '4px solid var(--nb-black)',
                            paddingLeft: '16px',
                            marginTop: '8px',
                        }}
                    >
                        A passionate beginner web developer focused on creating beautiful,
                        responsive websites. Currently exploring new technologies
                        and expanding my skillset.
                    </p>

                    {/* CTA Buttons */}
                    <div className='flex flex-wrap gap-4 pt-2'>
                        <a
                            href="/cv.pdf"
                            download
                            className="nb-btn px-6 py-3 font-grotesk font-bold text-sm"
                            style={{ background: 'var(--nb-black)', color: 'var(--nb-yellow)' }}
                        >
                            ↓ Download CV
                        </a>
                        <Link
                            to="contact2"
                            smooth={true}
                            duration={500}
                            className='nb-btn px-6 py-3 font-grotesk font-bold text-sm cursor-pointer'
                            style={{ background: 'var(--nb-yellow)', color: 'var(--nb-black)' }}
                        >
                            Contact Me →
                        </Link>
                    </div>

                    {/* Social Icons */}
                    <div className='flex gap-3 pt-4'>
                        {[
                            { href: "https://github.com/IGhifari", icon: <FaGithub size={20} />, label: "GitHub" },
                            { href: "https://www.linkedin.com/in/ighifari/", icon: <FaLinkedin size={20} />, label: "LinkedIn" },
                            { href: "https://www.instagram.com/ghfrriii/", icon: <FaInstagram size={20} />, label: "Instagram" },
                        ].map(({ href, icon, label }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="w-10 h-10 flex items-center justify-center transition-all duration-150"
                                style={{
                                    border: isDark ? '3px solid #E0E0E0' : 'var(--nb-border)',
                                    background: isDark ? '#1C1C1C' : 'var(--nb-white)',
                                    boxShadow: isDark ? '2px 2px 0px #CC0000' : 'var(--nb-shadow-hover)',
                                    color: isDark ? '#E0E0E0' : 'var(--nb-black)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = isDark ? '#CC0000' : 'var(--nb-black)';
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                    e.currentTarget.style.boxShadow = isDark ? '4px 4px 0px #CC0000' : 'var(--nb-shadow)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = isDark ? '#1C1C1C' : 'var(--nb-white)';
                                    e.currentTarget.style.color = isDark ? '#E0E0E0' : 'var(--nb-black)';
                                    e.currentTarget.style.transform = 'translate(0,0)';
                                    e.currentTarget.style.boxShadow = isDark ? '2px 2px 0px #CC0000' : 'var(--nb-shadow-hover)';
                                }}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    {/* Decorative block */}
                    <div className="flex items-center gap-4 pt-4">
                        <div style={{ width: '48px', height: '6px', background: 'var(--nb-red)', border: '2px solid var(--nb-black)' }} />
                        <div style={{ width: '24px', height: '6px', background: 'var(--nb-yellow)', border: '2px solid var(--nb-black)' }} />
                        <div style={{ width: '12px', height: '6px', background: 'var(--nb-black)' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
