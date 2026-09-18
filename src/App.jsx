import './styles/Index.css';
import './styles/Components.css';

import Navbar from './components/Navbar';
import Profile from './components/profile';
import Project from './components/project';
import Certificate from './components/Certificate';
import AcademicBackground from './components/AcademicBackground';
import Contact from './components/Contact';
import Skills from './components/Skill';
import Story from './components/Story';
import LastUpdated from './components/LastUpdated';
import ContactMe from './components/contactMe';
import SoundButton from './components/SoundButton';

const App = () => {
    return (
        <div className='tampilan' style={{ background: 'var(--nb-cream)', minHeight: '100vh' }}>

            <LastUpdated />
            <SoundButton />
            <Navbar />

            {/* Hero */}
            <section id="profile" className="min-h-screen">
                <Profile/>
            </section>

            {/* Projects */}
            <section id="projects" className="py-16 nb-dot-pattern">
                <Project/>
            </section>

            {/* Certificates */}
            <section id="certificates" className="py-16" style={{ background: 'var(--nb-cream)' }}>
                <Certificate/>
            </section>

            {/* Skills */}
            <section className="py-16 nb-dot-pattern">
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

            {/* Story / Career Path */}
            <section className="min-h-screen flex text-center justify-center" style={{ background: 'var(--nb-cream)' }}>
                <Story/>
            </section>

            {/* Academic Background */}
            <section id="AcademicBackground" className="min-h-screen flex items-center justify-center academic-background nb-dot-pattern">
                <AcademicBackground/>
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
            <footer className="nb-footer h-24 flex items-center justify-center">
                <div className="text-center space-y-1">
                    <h1 className="font-grotesk font-bold text-lg" style={{ color: 'var(--nb-yellow)' }}>GHIFARI</h1>
                    <p className="font-mono text-sm" style={{ color: 'var(--nb-yellow)' }}>Web Developer</p>
                    <p className="font-mono text-xs opacity-60" style={{ color: 'var(--nb-yellow)' }}>
                        © {new Date().getFullYear()} Ghifari. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;
