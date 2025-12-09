import React, { useState } from 'react';
import TypeIt from "typeit-react";
import { FaAward, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import '../styles/Certificate.css';
import { div } from 'framer-motion/client';

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
        }
    ];

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    return (
        <div className="container mx-auto px-4 py-16 relative">
            <h1 className="text-4xl font-bold text-center mb-12 hover:text-cyan-400 duration-500 transition-all ease-in-out">
                <TypeIt
                    options={{ loop: true, loopDelay: 2000, speed: 100 }}
                    getBeforeInit={(instance) => {
                        instance
                            .type("Certificates")
                            .pause(750)
                            .delete(12)
                            .pause(700)
                            .type("Sertifikat")
                            .pause(750)
                            .delete(10)
                            .pause(700)
                            .type("証明書")
                        return instance;
                    }}
                />
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert, index) => (
                    <div
                        key={index}
                        className="certificate-card bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-cyan-500/20"
                    >
                        <div className="relative group">
                            <img
                                src={cert.image}
                                alt={cert.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                    onClick={() => handleImageClick(cert.image)}
                                    className="bg-black/70 p-3 rounded-full hover:bg-cyan-500 transition-colors duration-300"
                                >
                                    <FaExternalLinkAlt className="text-white text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <FaAward className="text-cyan-400" />
                                <h3 className="text-xl font-semibold text-cyan-400">
                                    {cert.title}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-2">{cert.issuer}</p>
                            <p className="text-gray-400 text-sm mb-4">{cert.date}</p>
                            <div className="flex flex-wrap gap-2">
                                {cert.skills.map((skill, skillIndex) => (
                                    <span
                                        key={skillIndex}
                                        className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for displaying full certificate */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl w-full mx-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Certificate"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificate;
