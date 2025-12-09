import React, { useEffect, useMemo, useRef } from 'react';
import TypeIt from 'typeit-react';
import { FaUserGraduate, FaCode, FaLaptopCode, FaRocket, FaStar } from 'react-icons/fa';
import '../styles/Components.css';

/** Hitung umur agar selalu up-to-date */
function calcAge(birth = '2007-06-05') {
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

const Story = () => {
  const timelineRef = useRef(null);

  /** Data timeline versi profesional */
  const items = useMemo(
    () => [
      {
        key: 'about',
        icon: <FaUserGraduate aria-hidden="true" />,
        title: 'About Me',
        content: (
          <>
            I’m <span className="text-cyan-400">M. Ghifari Bima Khadafi</span> ({calcAge()} y.o.), a Web Developer
            focusing on building responsive and accessible interfaces with <span className="text-cyan-400">React</span> and
            robust backends using <span className="text-cyan-400">Express + Prisma</span>. Passionate about clean UI,
            predictable state, and developer-friendly environments.
          </>
        ),
      },
      {
        key: 'foundation',
        icon: <FaCode aria-hidden="true" />,
        title: 'Foundation',
        content: (
          <>
            Developed core skills in HTML, CSS, JavaScript, and PHP during vocational school at{' '}
            <span className="text-cyan-400">SMKN 1 Cibinong</span>. Built first projects that sparked an interest in
            full-stack development and problem-solving.
          </>
        ),
      },
      {
        key: 'projects',
        icon: <FaLaptopCode aria-hidden="true" />,
        title: 'Recent Work',
        content: (
          <>
            <span className="text-cyan-400">Project Food</span> — a menu planning and recipe management app using React,
            Tailwind, Express, Prisma, and MySQL. Implemented authentication (JWT), React Query for server-state, and
            form handling with React Hook Form. Also contributed to{' '}
            <span className="text-cyan-400">Desaku</span>, a village administration platform improving CRUD workflows and
            UX clarity.
          </>
        ),
      },
      {
        key: 'goals',
        icon: <FaRocket aria-hidden="true" />,
        title: 'Next Goals',
        content: (
          <>
            Deepen expertise in <span className="text-cyan-400">Node.js</span> by exploring scalable architecture patterns,
            performance optimization, and advanced API design. Begin mastering{' '}
            <span className="text-cyan-400">TypeScript</span> to enhance type safety, maintainability, and code clarity
            across both frontend and backend projects.
          </>
        ),
      },
    ],
    []
  );

  /** Intersection Observer untuk animasi scroll masuk */
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('animate-timeline');
        }
      },
      { threshold: 0.12, root: null, rootMargin: '0px 0px -10% 0px' }
    );

    const root = timelineRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.timeline-item');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="container mx-auto px-4 py-16 story-container bg-gradient-to-b from-transparent to-black/30"
      aria-labelledby="story-title"
    >
      <div className="max-w-4xl mx-auto">
        <header className="glowing-title mb-12 text-center">
          <h1
            id="story-title"
            className="text-4xl md:text-5xl font-bold mb-2 hover:text-cyan-400 duration-500 transition-colors ease-in-out"
            aria-live="polite"
          >
            <TypeIt
              options={{ loop: false, speed: 100 }}
              getBeforeInit={(instance) => {
                instance.type('Career Path').pause(500).type(' · ').type('Development Journey');
                return instance;
              }}
            />
          </h1>
          <FaStar className="inline-block text-cyan-400 animate-pulse" aria-hidden="true" />
        </header>

        <ol className="timeline-container" ref={timelineRef}>
          {items.map((item) => (
            <li
              key={item.key}
              className="timeline-item group focus-within:ring-2 focus-within:ring-cyan-400 rounded-lg outline-none"
            >
              <div className="timeline-icon">
                <div className="text-cyan-400 text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                  {item.icon}
                </div>
              </div>

              <article className="timeline-content backdrop-blur-sm/30 bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.content}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Story;
