import React from 'react';
import TypeIt from "typeit-react";
import '../styles/Components.css';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-scroll';

const Home = () => {
    return (
        <div className='min-h-screen w-full flex items-center' style={{ paddingTop: '64px' }}>
            <div className='profile z-10 w-full max-w-5xl mx-auto px-6 md:px-12 py-16'>
                <div className='space-y-6'>

                    <div>
                        <span className="nb-hero-badge">
                            Hello, I'm
                        </span>
                    </div>

                    <div>
                        <h1 className="nb-hero-name">
                            M.Ghifari<br/>Bima Khadafi
                        </h1>
                    </div>

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

                    <p className='nb-hero-copy text-lg max-w-2xl leading-relaxed font-grotesk'>
                        A passionate beginner web developer focused on creating beautiful,
                        responsive websites. Currently exploring new technologies
                        and expanding my skillset.
                    </p>

                    <div className='flex flex-wrap gap-4 pt-2'>
                        <a
                            href="/cv.pdf"
                            download
                            className="nb-btn px-6 py-3 font-grotesk font-bold text-sm"
                            style={{ background: 'var(--nb-white)', color: 'var(--nb-ink)' }}
                        >
                            ↓ Download CV
                        </a>
                        <Link
                            to="contact2"
                            smooth={true}
                            duration={500}
                            className='nb-btn px-6 py-3 font-grotesk font-bold text-sm cursor-pointer'
                            style={{ background: 'var(--nb-yellow)', color: 'var(--nb-nav-hover-text)' }}
                        >
                            Contact Me →
                        </Link>
                    </div>

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
                                className="nb-social-btn w-10 h-10 flex items-center justify-center"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div style={{ width: '48px', height: '6px', background: 'var(--nb-red)', border: '2px solid var(--nb-line)' }} />
                        <div style={{ width: '24px', height: '6px', background: 'var(--nb-yellow)', border: '2px solid var(--nb-line)' }} />
                        <div style={{ width: '12px', height: '6px', background: 'var(--nb-line)' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
