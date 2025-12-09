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
            description: "An interactive educational game developed collaboratively with friends, exploring the beauty and environmental sustainability of Pulau Harapan. This game teaches players about conservation and eco-friendly practices through engaging gameplay.",
            image: "pulauharapan.png", 
            tags: ["HTML", "Javascript", "CSS"],
            github: "https://github.com/IGhifari/EcoVoyage-PulauHarapan",
            live: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html"
        },
        {
            title: "Internship Journal Siswa",
            description: "A web-based internship journal system designed to help students record, manage, and track their internship activities efficiently. Built with React JS, Laravel, and MySQL to provide a seamless and organized experience.",
            image: "internship.png", 
            tags: ["ReactJS", "Laravel", "MySQL" , "Tailwind CSS"],
            github: "https://github.com/IGhifari/internship-journal",
            live: "https://your-internship-journal.com"
        },
        {
            title: "A Day At Home",
            description: "A web-based game created with my friend, designed specifically for deaf children. It aims to support learning through engaging visual interactions and a fun, accessible experience.",
            image: "seharidirumah.png",  
            tags: ["ReactJS", "Tailwind CSS"],
            github: "https://github.com/IGhifari/Project-Game-Clevio-SLB",
            live: "https://bendaditempatku.netlify.app/"
        },
        {
            title: "Desaku",
            description: "Desaku is a web-based platform specifically designed for village administration. It helps manage and organize data on families living in the village, making population and village information easier to access and maintain digitally.",
            image: "desaku.png",  
            tags: ["ReactJS", "ExpressJS", "Prisma", "Tailwind CSS", "MySQL"],
            github: "https://github.com/IGhifari/Website-DesaKita",
            live: "https://desaku.com"
        },
        {
            title: "Food",
            description:
                "Food is a modern web-based e-commerce platform for fruits and vegetables. It features product catalogs, cart and checkout systems, customer reviews, and user-admin chat functionality. The frontend is built with React, Tailwind CSS, and shadcn/ui, while the backend uses Express, Prisma, and PostgreSQL (Neon). The entire project is deployed on Vercel for seamless performance and scalability.",
            image: "food.png",
            tags: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Express", "Prisma", "PostgreSQL", "Vercel"],
            github: "https://github.com/IGhifari/web-food", 
            live: "https://food-liart-one.vercel.app"
        }

        


        
        
    ];

    return (
        <div className='container mx-auto px-4 py-20'>
            <h1 className="text-4xl font-bold text-center mb-12 hover:text-cyan-400 duration-500 transition-all ease-in-out">
                <TypeIt
                    options={{ loop: true, loopDelay: 2000, speed: 100 }}
                    getBeforeInit={(instance) => {
                        instance
                            .type("My Projects")
                            .pause(750)
                            .delete(11)
                            .pause(700)
                            .type("プロジェクト")
                        return instance;
                    }}
                />
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="project-card bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="relative group">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex gap-4">
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-black/70 p-3 rounded-full hover:bg-cyan-500 transition-colors duration-300"
                                    >
                                        <FaGithub className="text-white text-xl" />
                                    </a>
                                    <a
                                        href={project.live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-black/70 p-3 rounded-full hover:bg-cyan-500 transition-colors duration-300"
                                    >
                                        <FaExternalLinkAlt className="text-white text-xl" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
                                {project.title}
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded-full"
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
