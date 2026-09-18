import React, { useState } from 'react';
import TypeIt from "typeit-react";
import { FaAward, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import '../styles/Certificate.css';

const Certificate = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const certificates = [
        {
            title: "National Game Creation Competition",
            issuer: "Clevio",
            date: "26 January 2025 - 16 February 2025",
            image: "/clevio.png",
            skills: ["HTML", "CSS", "JavaScript"]
        },
        {
            title: "Basic Data Science Training",
            issuer: "Digitalent Kominfo",
            date: "2024",
            image: "digitalent.png",
            skills: ["Python"]
        },
        {
            title: "Basic Web Development Training",
            issuer: "Islamic Development Network (IDN)",
            date: "2023",
            image: "idn.jpg",
            skills: ["HTML", "CSS", "PHP"]
        },
        {
            title: "Internship - Frontend Developer",
            issuer: "PT. AMA Salam Indonesia",
            date: "1 October 2025 - 27 February 2026",
            image: "ama_salam.jpeg",
            skills: [
                "React",
                "Tailwind CSS",
                "Typescript",
                "PostgreSQL",
                "Web Development",
                "Project Management System",
                "Website Optimization",
                "Refactoring",
                "Lighthouse"
            ],
        }
    ];

    return (
        <div className="container mx-auto px-6 py-16 relative">
            {/* Section header */}
            <div className="mb-12 flex flex-col items-center">
                <h1
                    className="text-4xl md:text-5xl font-black font-grotesk text-center"
                    style={{
                        background: 'var(--nb-red)',
                        border: 'var(--nb-border)',
                        boxShadow: 'var(--nb-shadow)',
                        display: 'inline-block',
                        padding: '8px 24px',
                        color: 'white',
                    }}
                >
                    <TypeIt
                        options={{ loop: true, loopDelay: 2000, speed: 100 }}
                        getBeforeInit={(instance) => {
                            instance
                                .type("CERTIFICATES")
                                .pause(750)
                                .delete(12)
                                .pause(700)
                                .type("SERTIFIKAT")
                                .pause(750)
                                .delete(10)
                                .pause(700)
                                .type("証明書")
                            return instance;
                        }}
                    />
                </h1>
                <div style={{ width: '100%', height: '3px', background: 'var(--nb-black)', marginTop: '4px', maxWidth: '220px' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert, index) => (
                    <div key={index} className="certificate-card">
                        <div className="relative group" style={{ borderBottom: 'var(--nb-border)' }}>
                            <img
                                src={cert.image}
                                alt={cert.title}
                                className="w-full h-48 object-cover"
                                loading='lazy'
                            />
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                                style={{ background: 'color-mix(in srgb, var(--nb-red) 85%, transparent)' }}
                            >
                                <button
                                    onClick={() => setSelectedImage(cert.image)}
                                    className="w-12 h-12 flex items-center justify-center transition-all duration-200"
                                    style={{
                                        background: 'var(--nb-white)',
                                        border: 'var(--nb-border)',
                                        boxShadow: 'var(--nb-shadow-hover)',
                                        color: 'var(--nb-black)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = 'var(--nb-shadow-hover)'; }}
                                >
                                    <FaExternalLinkAlt size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-start gap-2 mb-2">
                                <FaAward size={20} style={{ color: 'var(--nb-red)', marginTop: '2px', flexShrink: 0 }} />
                                <h3 className="text-base font-black font-grotesk" style={{ color: 'var(--nb-ink)' }}>
                                    {cert.title}
                                </h3>
                            </div>
                            <p className="text-sm font-bold font-mono mb-1" style={{ color: 'inherit' }}>{cert.issuer}</p>
                            <p className="text-xs font-mono mb-4 opacity-60" style={{ color: 'inherit' }}>{cert.date}</p>
                            <div className="flex flex-wrap gap-2">
                                {cert.skills.map((skill, skillIndex) => (
                                    <span key={skillIndex} className="nb-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(10,10,10,0.85)' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full mx-4"
                        style={{ border: '4px solid var(--nb-black)', boxShadow: '8px 8px 0px var(--nb-yellow)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 flex items-center gap-2 font-mono font-bold text-sm"
                            style={{ color: 'var(--nb-yellow)' }}
                        >
                            <FaTimes size={20} /> CLOSE
                        </button>
                        <img
                            src={selectedImage}
                            alt="Certificate full view"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificate;
