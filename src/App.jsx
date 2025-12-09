import React from 'react';
import './styles/App.css';
import './styles/Components.css';
import Navbar from './components/Navbar';
import Home from './components/Profile';
import Project from './components/Project';
import Certificate from './components/Certificate';
import AcademicBackground from './components/AcademicBackground';
import Contact from './components/Contact';
import Skills from './components/Skill';
import Story from './components/Story';
import ParticlesBackground from './components/ParticlesBackground';
import LastUpdated from './components/LastUpdated';
import ContactMe from './components/ContactMe';
import SoundButton from './components/SoundButton';
const App = () => {
    return (
        <div className='tampilan'>
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <ParticlesBackground />
            </div>

            <LastUpdated />
            <SoundButton />
            <Navbar />
            <section id="profile" className="h-full text-white">
                <Home/>
            </section>
            <section id="projects" className="h-full text-white">
                <Project/>
            </section>
            <section id="certificates" className="h-full text-white">
                <Certificate/>
            </section>
            <section className="text-white pb-48 min-h-[700px]">
                <div className="mt-72 md:mt-10">
                    <div className="flex items-center pl-14">
                        <div className="w-12 border-b-2 border-white" />
                        <h3 className="pl-3 text-xl">Skills</h3>
                    </div>
                    <div>
                        <Skills/>
                    </div>
                </div>
            </section>
            <section className="h-screen text-white flex text-center justify-center mt-44">
                <Story/>
            </section>
            <section id="AcademicBackground" className="h-full mt-80 text-white flex items-center justify-center academic-background">
                <AcademicBackground/>
            </section>
            <section id="contact2" className="h-full text-white mt-20">
                <ContactMe />
            </section>
            <section id="contact" className="h-full text-white mt-80">
                <Contact/>
            </section>

            {/* Footer */}
            <footer className="text-white h-20 mt-36 footer text-sm">
                <div className="text-center space-y-1">
                    <h1 className="font-montserrat text-base">Ghifari</h1>
                    <h1 className="text-base">Web Developer</h1>
                    <p>Copyright &#169; {new Date().getFullYear()} Ghifari. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
