    import React, { useEffect, useRef } from 'react';
    import { Swiper, SwiperSlide, } from 'swiper/react';
    import 'swiper/css';
    import 'swiper/css/effect-cards';
    import { EffectCards } from 'swiper/modules';
    import { IoLogoGithub } from "react-icons/io";
    import './skill.css'
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
    const Skills = () =>{
        return(
            <div className='mt-10'>
                <div className='text-sm font-montserrat text-center'>
                    <h1>LIST OF MY SKILL SET</h1>
                </div>
                <Swiper
                    effect={'cards'}
                    grabCursor={true}
                    modules={[EffectCards]}
                    className="mySwiper mt-7"
                    >
                    <SwiperSlide className=' '>
                        <div className='w-full'>
                            <div className='mt-7 mb-7'>
                                <div className=' w-full flex justify-center items-center '>
                                    <h1 className='font-bold text-3xl'>Frontend</h1>
                                </div>
                                <div style={{fontSize:'0.5rem'}} className='w-full flex justify-center text-sm font-montserrat text-yellow-400'>
                                    <h1>SCROLL LIST TO SEE MORE</h1>
                                </div>
                            </div>
                            <div className=' m-2 h-60 overflow-y-auto text-sm'>
                                <div className=" h-56 overflow-y-auto  border-yellow-300 text-sm ">
                                <ul className="space-y-4 border-t-2 border-b-2 border-yellow-300 scroll-smooth duration-200">
                                    <li  className="flex items-center space-x-2 mt-5  justify-center">
                                        <FaHtml5 size={27}/>
                                        <h1 className='text-1xl'>HTML</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <FaCss3Alt size={27}/>
                                        <h1 className='text-1xl'>CSS</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <FaJs size={27}/>
                                        <h1 className='text-1xl'>Java Script</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <FaReact size={27}/>
                                        <h1 className='text-1xl'>React</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <RiTailwindCssFill size={27}/>
                                        <h1 className='text-1xl'>Tailwind CSS</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <SiPhp size={25}/>
                                    <h1 className='text-1xl'>PHP</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 pb-5 justify-center">
                                        <FaLaravel size={25}/>
                                        <h1 className='text-1xl'>Laravel</h1>
                                    </li>
                                </ul>
                                </div>
                            </div>
                            <div style={{fontSize:'0.6rem'}} className='text-start pl-3 pr-1'>
                                The frontend of the application is responsible for creating the user interface (UI) and providing a seamless user experience (UX). It involves technologies like HTML, CSS, JavaScript, and frameworks such as React or Vue.js to render dynamic and responsive content.
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                    <div className='w-full'>
                            <div className='mt-7 mb-7'>
                                <div className=' w-full flex justify-center items-center '>
                                    <h1 className='font-bold text-3xl'>Backend</h1>
                                </div>
                                <div style={{fontSize:'0.5rem'}} className='w-full flex justify-center text-sm font-montserrat text-yellow-400'>
                                    <h1>SCROLL LIST TO SEE MORE</h1>
                                </div>
                            </div>
                            <div className=' m-2 h-60 overflow-y-auto text-sm'>
                                <div className=" h-56 overflow-y-auto  border-yellow-300 text-sm ">
                                <ul className="space-y-4  border-t-2 border-b-2 border-yellow-300 scroll-smooth duration-500">
                                
                                <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <TbBrandMysql size={25}/>
                                    <h1 className='text-1xl'>MySQL</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <SiExpress size={25}/>
                                    <h1 className='text-1xl'>Express.JS</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <FaNode size={25}/>
                                    <h1 className='text-1xl'>Node.JS</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <BiLogoPostgresql size={25}/>
                                    <h1 className='text-1xl'>PostgreSQL</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <FaLaravel size={25}/>
                                    <h1 className='text-1xl'>Laravel</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 pb-5 justify-center">
                                    <FaQuestion size={25}/>
                                    <h1 className='text-1xl'>Soon</h1>
                                    </li>
                                    
                                </ul>
                                </div>
                            </div>
                            <div style={{fontSize:'0.7rem'}} className='text-start pl-3 pr-1'>
                                The backend handles the server-side logic and database interactions, ensuring data is processed and stored securely.
                            </div>

                    </div>
                    </SwiperSlide>
                    <SwiperSlide>
                    <div className='w-full'>
                            <div className='mt-7 mb-7'>
                                <div className=' w-full flex justify-center items-center '>
                                    <h1 className='font-bold text-3xl'>Utilities</h1>
                                </div>
                                <div style={{fontSize:'0.5rem'}} className='w-full flex justify-center text-sm font-montserrat text-yellow-400'>
                                    <h1>SCROLL LIST TO SEE MORE</h1>
                                </div>
                            </div>
                            <div className=' m-2 h-64 overflow-y-auto text-sm'>
                                <div className=" h-60 overflow-y-auto  border-yellow-300 text-sm ">
                                <ul className="space-y-4  border-t-2 border-yellow-300 border-b-2 scroll-smooth duration-200">
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <AiFillOpenAI size={27}/>
                                        <h1 className='text-1xl'>Open AI</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <DiVisualstudio size={27}/>
                                        <h1 className='text-1xl'>Visual Studio Code</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                        <IoLogoGithub size={27}/>
                                        <h1 className='text-1xl'>Github</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <SiPostman size={25}/>
                                    <h1 className='text-1xl'>Postman</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 justify-center">
                                    <FaQuestion size={25}/>
                                    <h1 className='text-1xl'>Soon</h1>
                                    </li>
                                    <li  className="flex items-center space-x-2 mt-5 pb-5 justify-center">
                                    <FaQuestion size={25}/>
                                    <h1 className='text-1xl'>Soon</h1>
                                    </li>
                                </ul>
                                </div>
                            </div>
                            <div style={{fontSize:'0.7rem'}} className='text-start pl-3 pr-1'>
                                    Utilities provide helpful tools and libraries that assist in managing common tasks such as formatting data, caching, logging, and testing.
                            </div>

                    </div>
                    </SwiperSlide>
                    </Swiper>
                </div>
        )
    }

    export default Skills