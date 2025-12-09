import React from 'react';
import TypeIt from "typeit-react";
import '../styles/Components.css';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-scroll';
const Home = () => {

  
    return (
        <div className='min-h-screen w-full relative flex items-center justify-center'>
            <div className='text-white profile z-10 max-w-4xl mx-auto px-4 py-16'>
                <div className='space-y-6'>
                    <div className='space-y-2'>
                        <h3 className='text-cyan-400 text-xl'>Hello, I'm</h3>
                        <h3 className='text-4xl font-bold tracking-wider'>M.Ghifari Bima Khadafi</h3>
                        <h1 className='text-3xl font-montserrat text-gray-300'>
                            <TypeIt  
                                options={{ loop: true, loopDelay: 2000, speed: 100 }} 
                                getBeforeInit={(instance) => {
                                    instance
                                        .type("Web Developer") 
                                        .pause(750)
                                        .delete(19)
                                        .pause(700)
                                        .type("Student")
                                    return instance;
                                }}
                            /> 
                        </h1>
                    </div>
                    
                    <p className='text-lg text-gray-300 max-w-2xl leading-relaxed'>
                        A passionate beginer web developer focused on creating beautiful, 
                        responsive websites. Currently exploring new technologies 
                        and expanding my skillset.
                    </p>

                    <div className='flex gap-6 pt-4'>
                        <button className='px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all duration-300'>
                            Download CV
                        </button>
                        <Link 
                            to="contact2" 
                            smooth={true} 
                            duration={500} 
                            className='px-6 py-3 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white rounded-lg transition-all duration-300 cursor-pointer'
                        >
                            Contact Me
                        </Link>
                    </div>

                    <div className='flex gap-4 pt-6'>
                        <a href="https://github.com/IGhifari" target="_blank" rel="noopener noreferrer"
                           className='text-gray-400 hover:text-white transition-colors duration-300'>
                            <FaGithub size={24} />
                        </a>
                        <a href="https://www.linkedin.com/in/ighifari/" target="_blank" rel="noopener noreferrer"
                           className='text-gray-400 hover:text-white transition-colors duration-300'>
                            <FaLinkedin size={24} />
                        </a>
                        <a href="https://www.instagram.com/ghfrriii/" target="_blank" rel="noopener noreferrer"
                           className='text-gray-400 hover:text-white transition-colors duration-300'>
                            <FaInstagram size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
