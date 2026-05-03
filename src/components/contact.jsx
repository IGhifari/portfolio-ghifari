import React from 'react';
import TypeIt from "typeit-react";
import { FaDiscord } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { IoLogoGithub } from "react-icons/io";
import { FaTiktok } from "react-icons/fa";
import '../styles/Components.css';

const contactItems = [
    {
        icon: <MdEmail size={24} />,
        label: 'Email',
        desc: 'I always check up on my email daily — primary contact method',
        url: 'mailto:ighifarii05@gmail.com',
        color: 'var(--nb-red)',
    },
    {
        icon: <FaDiscord size={24} />,
        label: 'Discord',
        desc: 'Add me for real-time conversation — ghifari#7471',
        url: 'https://discord.com/channels/@ghifari#7471',
        color: 'var(--nb-black)',
        textColor: 'var(--nb-yellow)',
    },
    {
        icon: <FaInstagram size={24} />,
        label: 'Instagram',
        desc: 'Follow me to see my daily life!',
        url: 'https://www.instagram.com/ghfrriii/',
        color: 'var(--nb-yellow)',
    },
    {
        icon: <FaLinkedin size={24} />,
        label: 'LinkedIn',
        desc: 'Learn more about my professional career background',
        url: 'https://www.linkedin.com/in/ighifari/',
        color: 'var(--nb-red)',
    },
    {
        icon: <IoLogoGithub size={24} />,
        label: 'GitHub',
        desc: 'Find all my personal public project source code here',
        url: 'https://github.com/IGhifari',
        color: 'var(--nb-black)',
        textColor: 'var(--nb-yellow)',
    },
    {
        icon: <FaTiktok size={24} />,
        label: 'TikTok',
        desc: 'Follow my TikTok to see the content I upload',
        url: 'https://www.tiktok.com/@ghrfiii?',
        color: 'var(--nb-yellow)',
    },
];

const Contact = () => {
    return (
        <div className='container mx-auto px-6 py-16 contact-me'>
            {/* Section header */}
            <div className="mb-12 flex flex-col items-center">
                <h1
                    className="text-4xl md:text-5xl font-black font-grotesk text-center"
                    style={{
                        background: 'var(--nb-black)',
                        border: 'var(--nb-border)',
                        boxShadow: 'var(--nb-shadow)',
                        display: 'inline-block',
                        padding: '8px 24px',
                        color: 'var(--nb-yellow)',
                    }}
                >
                    <TypeIt
                        options={{ loop: true, loopDelay: 2000, speed: 100 }}
                        getBeforeInit={(instance) => {
                            instance
                                .type("CONTACT INFO")
                                .pause(750)
                                .delete(12)
                                .pause(700)
                                .type("INFORMASI KONTAK")
                                .pause(750)
                                .delete(16)
                                .pause(700)
                                .type("れんらくせん")
                            return instance;
                        }}
                    />
                </h1>
                <div style={{ width: '100%', height: '3px', background: 'var(--nb-black)', marginTop: '4px', maxWidth: '220px' }} />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                {contactItems.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nb-contact-item flex items-start gap-4 no-underline group"
                    >
                        {/* Icon box */}
                        <div
                            className="nb-icon-box flex-shrink-0"
                            style={{
                                background: item.color,
                                color: item.textColor || 'var(--nb-black)',
                            }}
                        >
                            {item.icon}
                        </div>

                        {/* Text */}
                        <div>
                            <h3 className="font-black font-grotesk text-base mb-1" style={{ color: 'var(--nb-black)' }}>
                                {item.label.toUpperCase()}
                            </h3>
                            <p className="text-xs font-grotesk leading-relaxed" style={{ color: '#444' }}>
                                {item.desc}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Contact;
