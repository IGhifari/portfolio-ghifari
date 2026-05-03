import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { IoLogoGithub } from "react-icons/io";
import '../styles/Skill.css';
import { FaHtml5, FaNode } from "react-icons/fa";
import { FaCss3Alt } from "react-icons/fa";
import { FaJs } from "react-icons/fa";
import { FaReact } from "react-icons/fa";
import { TbBrandMysql } from "react-icons/tb";
import { RiTailwindCssFill } from "react-icons/ri";
import { AiFillOpenAI } from "react-icons/ai";
import { FaQuestion } from "react-icons/fa";
import { DiVisualstudio } from "react-icons/di";
import { FaLaravel } from "react-icons/fa";
import { SiPhp } from "react-icons/si";
import { SiPostman } from "react-icons/si";
import { SiExpress } from "react-icons/si";
import { FaNodeJs } from "react-icons/fa";
import { BiLogoPostgresql } from "react-icons/bi";

const sliderHeaderStyle = {
    background: 'var(--nb-yellow)',
    border: 'var(--nb-border)',
    boxShadow: 'var(--nb-shadow-hover)',
    display: 'inline-block',
    padding: '4px 16px',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 800,
    fontSize: '1.5rem',
    color: 'var(--nb-black)',
};

const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '2px solid var(--nb-black)',
    color: 'var(--nb-black)',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 600,
};

const Skills = () => {
    const slides = [
        {
            title: 'Frontend',
            color: 'var(--nb-yellow)',
            items: [
                { icon: <FaHtml5 size={24} />, name: 'HTML' },
                { icon: <FaCss3Alt size={24} />, name: 'CSS' },
                { icon: <FaJs size={24} />, name: 'JavaScript' },
                { icon: <FaReact size={24} />, name: 'React' },
                { icon: <RiTailwindCssFill size={24} />, name: 'Tailwind CSS' },
                { icon: <SiPhp size={23} />, name: 'PHP' },
                { icon: <FaLaravel size={23} />, name: 'Laravel' },
            ],
            description: 'Building responsive UIs with modern frameworks and tools.',
        },
        {
            title: 'Backend',
            color: 'var(--nb-red)',
            items: [
                { icon: <TbBrandMysql size={24} />, name: 'MySQL' },
                { icon: <SiExpress size={24} />, name: 'Express.JS' },
                { icon: <FaNode size={24} />, name: 'Node.JS' },
                { icon: <BiLogoPostgresql size={24} />, name: 'PostgreSQL' },
                { icon: <FaLaravel size={24} />, name: 'Laravel' },
                { icon: <FaQuestion size={24} />, name: 'Soon...' },
            ],
            description: 'Handling server-side logic and database interactions securely.',
        },
        {
            title: 'Utilities',
            color: 'var(--nb-black)',
            textColor: 'var(--nb-yellow)',
            items: [
                { icon: <AiFillOpenAI size={24} />, name: 'Open AI' },
                { icon: <DiVisualstudio size={24} />, name: 'VS Code' },
                { icon: <IoLogoGithub size={24} />, name: 'GitHub' },
                { icon: <SiPostman size={24} />, name: 'Postman' },
                { icon: <FaQuestion size={24} />, name: 'Soon...' },
                { icon: <FaQuestion size={24} />, name: 'Soon...' },
            ],
            description: 'Tools and utilities for efficient development workflows.',
        },
    ];

    return (
        <div className='mt-6 flex flex-col items-center'>
            <p className='text-xs font-mono font-bold text-center mb-6' style={{ color: 'var(--nb-black)', letterSpacing: '0.1em' }}>
                — SWIPE CARDS TO SEE MORE —
            </p>
            <Swiper
                effect={'cards'}
                grabCursor={true}
                modules={[EffectCards]}
                className="mySwiper"
            >
                {slides.map((slide, idx) => (
                    <SwiperSlide key={idx}>
                        <div className='w-full h-full flex flex-col' style={{ background: 'var(--nb-white)' }}>
                            {/* Card header */}
                            <div
                                className='flex items-center justify-center py-5'
                                style={{ background: slide.color, borderBottom: 'var(--nb-border)' }}
                            >
                                <h2
                                    className='font-black text-2xl font-grotesk'
                                    style={{ color: slide.textColor || 'var(--nb-black)' }}
                                >
                                    {slide.title.toUpperCase()}
                                </h2>
                            </div>

                            {/* Skill list */}
                            <div className='flex-1 overflow-y-auto px-5 py-2'>
                                <ul>
                                    {slide.items.map((item, i) => (
                                        <li key={i} style={listItemStyle}>
                                            <span style={{ color: slide.color === 'var(--nb-black)' ? 'var(--nb-yellow)' : slide.color }}>
                                                {item.icon}
                                            </span>
                                            <span style={{ color: 'var(--nb-black)' }}>{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Description */}
                            <div
                                className='px-4 py-3 font-mono text-xs'
                                style={{ borderTop: 'var(--nb-border)', color: '#444', background: '#f8f8f0' }}
                            >
                                {slide.description}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Skills;
