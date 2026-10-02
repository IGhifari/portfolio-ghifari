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
import SoundButton from './components/SoundButton';
import Footer from './components/Footer';

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

            {/* Tech Stack */}
            <section id="stack" className="bg-[#080808] border-t border-[#1C1C20]">
                <div id="skills" aria-hidden="true" />
                <Skills/>
            </section>

            {/* Certificates */}
            <section id="certificates" className="bg-[#080808] border-t border-[#1C1C20]">
                <Certificate/>
            </section>

            {/* Academic Background / Education */}
            <section id="education" className="bg-[#080808] border-t border-[#1C1C20]">
                <div id="academic" aria-hidden="true" />
                <div id="AcademicBackground" aria-hidden="true" />
                <AcademicBackground/>
            </section>

            {/* Contact */}
            <section id="contact" className="bg-[#080808] border-t border-[#1C1C20]">
                <div id="contact2" aria-hidden="true" />
                <Contact/>
            </section>

            {/* Footer */}
            <Footer />
        </div>
        </ThemeProvider>
    );
};

export default App;
