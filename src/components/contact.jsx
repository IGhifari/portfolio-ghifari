import React, { useEffect, useRef,useState } from 'react';
import TypeIt from "typeit-react";
import { FaDiscord } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { IoLogoGithub } from "react-icons/io";
import { FaTiktok } from "react-icons/fa";
import '../styles/Components.css';
const Contact = () => {
  
    const Igclick = () =>{
        window.open("https://www.instagram.com/ghfrriii/", '_blank', 'noopener,noreferrer');
    }
    const Gitclick = () =>{
        window.open("https://github.com/IGhifari", '_blank', 'noopener,noreferrer');
    }
    const Tiktokclick = () => {
        window.open("https://www.tiktok.com/@ghrfiii?", '_blank', 'noopener,noreferrer');
    }
    const Discordclick = () => {
        window.open("https://discord.com/channels/@ghifari#7471", '_blank', 'noopener,noreferrer');
    }
    const Linclick = () => {
        window.open("https://www.linkedin.com/in/ighifari/", '_blank', 'noopener,noreferrer');
    }
    const Emailclick = () => {
        window.open("mailto:ighifarii05@gmail.com", '_blank', 'noopener,noreferrer');
    }
    return(

        <div className=' contact-me'>
            <h1 className="text-4xl font-bold text-center mb-10 hover:text-cyan-400 duration-500 transition-all ease-in-out ">
                        <TypeIt  
                        options={{ loop: true, loopDelay: 2000, speed: 100 }} // Loop dan pengaturan delay
                                                getBeforeInit={(instance) => {
                                                    instance
                                                        .type("Contact Information") // Warna biru hanya untuk teks ini
                                                        .pause(750)
                                                        .delete(19)
                                                        .pause(700)
                                                        .type("Informasi Kontak")
                                                        .pause(750)
                                                        .delete(23)
                                                        .pause(700)
                                                        .type("れんらくせん")
                                                    return instance;
                                                }}
                                /> 
            </h1>

            <div className='mt-16 data-contact  '>
                <div className='flex items-center justify-evenly contact'>
                    <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                        <MdEmail className='h-12 w-12  rounded-2xl' onClick={Emailclick} />
                        </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Emailclick}>Email</h1>
                            <p className='text-sm pr-5'>I always check up on my email
                                daily, this is my primary
                                contact method
                            </p> 
                        </div>
                    </div>
                    <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                        <FaDiscord className='h-12 w-12  rounded-2xl' onClick={Discordclick} />
                        </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Discordclick}>Discord</h1>
                            <p className='text-sm pr-3'>I use this daily for multi
                                purposes,add me if you need real-time conversation
                            </p> 
                        </div>
                    </div>
                    <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                            <FaInstagram className='h-12 w-12  rounded-2xl' onClick={Igclick}  />
                        </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Igclick}>Instagram</h1>
                            <p className='text-sm'>Follow me to see my daily life!
                            </p> 
                        </div>
                    </div>
                </div>
                <div className='flex justify-evenly contact'>
                <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                        <FaLinkedin className='h-12 w-12  rounded-2xl' onClick={Linclick} />
                    </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Linclick}>Linkedin</h1>
                            <p className='text-sm pr-5'>Learn more about my professional career background
                                on linkedin
                            </p> 
                        </div>
                </div>
                <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                        <IoLogoGithub className='h-12 w-12  rounded-2xl' onClick={Gitclick} />
                    </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Gitclick}>Github</h1>
                            <p className='text-sm'>Find all my personal public project source code and contributions
                                here
                            </p> 
                        </div>
                </div>
                <div className='flex w-80 h-48  p-5 isi'>
                    <div className='w-12 h-12 p-2 rounded-2xl bg-slate-900 flex items-center transition-all ease-in-out duration-500 hover:bg-white hover:text-black cursor-pointer'>
                        <FaTiktok className='h-12 w-12  rounded-2xl' onClick={Tiktokclick} />
                    </div>
                        <div className='pl-5'>
                            <h1 className='font-bold text-pink-500' onClick={Tiktokclick}>Tiktok</h1>
                            <p className='text-sm'>follow my tiktok to see the content I upload
                            </p> 
                        </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
