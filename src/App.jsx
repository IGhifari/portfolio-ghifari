import './styles/Index.css';
import './styles/Components.css';

import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Project from './components/Project';
import Certificate from './components/Certificate';
import AcademicBackground from './components/AcademicBackground';
import Contact from './components/Contact';
import Skills from './components/Skill';
import About from './components/About';
import Journey from './components/Journey';
import LastUpdated from './components/LastUpdated';
import ContactMe from './components/ContactMe';
import SoundButton from './components/SoundButton';

const App = () => {
    return (
        <ThemeProvider>
        <div className='tampilan' style={{ background: 'var(--bg-primary, #080808)', minHeight: '100vh' }}>

            <SoundButton />
            <Navbar />

            {/* Hero */}
            <section id="profile" className="min-h-screen bg-[#080808]">
                <Profile/>
            </section>

            {/* Projects */}
            <section id="projects" className="bg-[#080808]">
                <Project/>
            </section>

            {/* About */}
            <section id="about" className="bg-[#080808] border-t border-[#1C1C20]">
                <About/>
            </section>

            {/* Journey */}
            <section id="journey" className="bg-[#080808] border-t border-[#1C1C20]">
                <Journey/>
            </section>

            {/* Skills */}
            <section id="skills" className="py-16 nb-dot-pattern">
                <div className="mt-10 md:mt-10">
                    <div className="flex items-center pl-8 md:pl-14 mb-6">
                        <div className="w-8 h-1 mr-3" style={{ background: 'var(--nb-line)' }} />
                        <h3 className="text-xl font-bold font-grotesk" style={{ color: 'var(--nb-ink)' }}>SKILLS</h3>
                    </div>
                    <div>
                        <Skills/>
                    </div>
                </div>
            </section>

            {/* Certificates */}
            <section id="certificates" className="py-16" style={{ background: 'var(--nb-cream)' }}>
                <Certificate/>
            </section>

            {/* Academic Background */}
            <section id="academic" className="min-h-screen flex items-center justify-center academic-background nb-dot-pattern">
                <div id="AcademicBackground" className="w-full flex items-center justify-center">
                    <AcademicBackground/>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact2" className="py-16" style={{ background: 'var(--nb-cream)' }}>
                <ContactMe />
            </section>

            {/* Contact Info */}
            <section id="contact" className="py-16 nb-dot-pattern">
                <Contact/>
            </section>

            {/* Footer */}
            <footer className="nb-footer py-8 flex items-center justify-center">
                <div className="text-center space-y-1.5 flex flex-col items-center">
                    <h1 className="font-grotesk font-bold text-lg" style={{ color: 'var(--nb-yellow)' }}>GHIFARI</h1>
                    <p className="font-mono text-sm" style={{ color: 'var(--nb-yellow)' }}>Web Developer</p>
                    <LastUpdated />
                    <p className="font-mono text-xs opacity-60" style={{ color: 'var(--nb-yellow)' }}>
                        © {new Date().getFullYear()} Ghifari. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
        </ThemeProvider>
    );
};

export default App;
