import React from 'react';
import TypeIt from "typeit-react";
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import '../styles/Project.css';

const Project = () => {
    const projects = [
        {
            title: "Portfolio Website",
            description: "Personal portfolio website built with React and Tailwind CSS",
            image: "portfolio.png",
            tags: ["ReactJS", "Tailwind CSS"],
            github: "https://github.com/IGhifari/Portfolio-ghifari",
            live: window.location.href
        },
        {
            title: "Game Ecovoyage-PulauHarapan",
            description: "An interactive educational game developed collaboratively with friends, exploring the beauty and environmental sustainability of Pulau Harapan.",
            image: "pulauharapan.png",
            tags: ["HTML", "Javascript", "CSS"],
            github: "https://github.com/IGhifari/EcoVoyage-PulauHarapan",
            live: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html"
        },
        {
            title: "Internship Journal Siswa",
            description: "A web-based internship journal system designed to help students record, manage, and track their internship activities efficiently.",
            image: "internship.png",
            tags: ["ReactJS", "Laravel", "MySQL", "Tailwind CSS"],
            github: "https://github.com/IGhifari/internship-journal",
            live: "https://your-internship-journal.com"
        },
        {
            title: "A Day At Home",
            description: "A web-based game created with my friend, designed specifically for deaf children. It aims to support learning through engaging visual interactions.",
            image: "seharidirumah.png",
            tags: ["ReactJS", "Tailwind CSS"],
            github: "https://github.com/IGhifari/Project-Game-Clevio-SLB",
            live: "https://bendaditempatku.netlify.app/"
        },
        {
            title: "Desaku",
            description: "A web-based platform specifically designed for village administration. Helps manage family data and village information digitally.",
            image: "desaku.png",
            tags: ["ReactJS", "ExpressJS", "Prisma", "Tailwind CSS", "MySQL"],
            github: "https://github.com/IGhifari/Website-DesaKita",
            live: "https://desaku.com"
        },
        {
            title: "Food",
            description: "A modern web-based e-commerce platform for fruits and vegetables. Features product catalogs, cart, checkout, customer reviews, and user-admin chat.",
            image: "food.png",
            tags: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL"],
            github: "https://github.com/IGhifari/web-food",
            live: "https://food-liart-one.vercel.app"
        }
    ];

    return (
        <div className='container mx-auto px-6 py-16'>
            {/* Section header */}
            <div className="mb-12 flex flex-col items-center">
                <h1
                    className="text-4xl md:text-5xl font-black font-grotesk text-center"
                    style={{
                        background: 'var(--nb-yellow)',
                        border: 'var(--nb-border)',
                        boxShadow: 'var(--nb-shadow)',
                        display: 'inline-block',
                        padding: '8px 24px',
                        color: 'var(--nb-black)',
                    }}
                >
                    <TypeIt
                        options={{ loop: true, loopDelay: 2000, speed: 100 }}
                        getBeforeInit={(instance) => {
                            instance
                                .type("MY PROJECTS")
                                .pause(750)
                                .delete(11)
                                .pause(700)
                                .type("プロジェクト")
                            return instance;
                        }}
                    />
                </h1>
                <div style={{ width: '100%', height: '3px', background: 'var(--nb-black)', marginTop: '4px', maxWidth: '220px' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="project-card"
                    >
                        {/* Image + hover overlay */}
                        <div className="relative group" style={{ borderBottom: 'var(--nb-border)' }}>
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-48 object-cover"
                            />
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4"
                                style={{ background: 'rgba(255, 229, 0, 0.88)' }}
                            >
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 flex items-center justify-center font-bold transition-all duration-150"
                                    style={{
                                        background: 'var(--nb-black)',
                                        border: 'var(--nb-border)',
                                        boxShadow: 'var(--nb-shadow-hover)',
                                        color: 'var(--nb-yellow)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow-hover)'; }}
                                >
                                    <FaGithub size={20} />
                                </a>
                                <a
                                    href={project.live}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 flex items-center justify-center font-bold transition-all duration-150"
                                    style={{
                                        background: 'var(--nb-red)',
                                        border: 'var(--nb-border)',
                                        boxShadow: 'var(--nb-shadow-hover)',
                                        color: 'white',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow-hover)'; }}
                                >
                                    <FaExternalLinkAlt size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5">
                            <h3
                                className="text-lg font-black font-grotesk mb-2"
                                style={{ color: 'var(--nb-black)' }}
                            >
                                {project.title}
                            </h3>
                            <p
                                className="text-sm mb-4 leading-relaxed"
                                style={{ color: '#333' }}
                            >
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="nb-tag"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Project;
