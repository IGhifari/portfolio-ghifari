import './styles/Index.css';
import './styles/Components.css';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
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
          <LanguageProvider>
            <div className='tampilan' style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>

            <SoundButton />
            <Navbar />

            {/* Hero */}
            <section id="profile" className="min-h-screen bg-[var(--bg-primary)]">
                <Profile/>
            </section>

            {/* Projects */}
            <section id="projects" className="bg-[var(--bg-primary)]">
                <Project/>
            </section>

            {/* About */}
            <section id="about" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <About/>
            </section>

            {/* Journey */}
            <section id="journey" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <Journey/>
            </section>

            {/* Tech Stack */}
            <section id="stack" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <div id="skills" aria-hidden="true" />
                <Skills/>
            </section>

            {/* Certificates */}
            <section id="certificates" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <Certificate/>
            </section>

            {/* Academic Background / Education */}
            <section id="education" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <div id="academic" aria-hidden="true" />
                <div id="AcademicBackground" aria-hidden="true" />
                <AcademicBackground/>
            </section>

            {/* Contact */}
            <section id="contact" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <div id="contact2" aria-hidden="true" />
                <Contact/>
            </section>

            {/* Footer */}
            <Footer />
        </div>
          </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
