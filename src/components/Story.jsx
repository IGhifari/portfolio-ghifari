import { useRef, useMemo, useEffect } from 'react';
import TypeIt from 'typeit-react';
import { FaUserGraduate, FaCode, FaLaptopCode, FaRocket } from 'react-icons/fa';
import '../styles/Components.css';

function calcAge(birth = '2007-06-05') {
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

const iconColors = ['var(--nb-yellow)', 'var(--nb-red)', 'var(--nb-black)', 'var(--nb-yellow)'];

const Story = () => {
  const timelineRef = useRef(null);

  const items = useMemo(
    () => [
      {
        key: 'about',
        icon: <FaUserGraduate aria-hidden="true" />,
        title: 'About Me',
        content: (
          <>
            I&apos;m <strong>M. Ghifari Bima Khadafi</strong> ({calcAge()} y.o.), a Web Developer
            focusing on building responsive and accessible interfaces with <strong>React</strong> and
            robust backends using <strong>Express + Prisma</strong>. Passionate about clean UI,
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
            <strong>SMKN 1 Cibinong</strong>. Built first projects that sparked an interest in
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
            <strong>Project Food</strong> — a menu planning and recipe management app using React,
            Tailwind, Express, Prisma, and MySQL. Also contributed to{' '}
            <strong>Desaku</strong>, a village administration platform improving CRUD workflows and UX clarity.
          </>
        ),
      },
      {
        key: 'goals',
        icon: <FaRocket aria-hidden="true" />,
        title: 'Next Goals',
        content: (
          <>
            Deepen expertise in <strong>Node.js</strong> by exploring scalable architecture patterns,
            performance optimization, and advanced API design. Begin mastering{' '}
            <strong>TypeScript</strong> to enhance type safety and code clarity across projects.
          </>
        ),
      },
    ],
    []
  );

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
      className="container mx-auto px-4 py-16 story-container w-full"
      aria-labelledby="story-title"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="glowing-title mb-16 text-center">
          <h1
            id="story-title"
            className="text-4xl md:text-5xl font-black font-grotesk inline-block"
            style={{
              background: 'var(--nb-black)',
              color: 'var(--nb-yellow)',
              border: 'var(--nb-border)',
              boxShadow: 'var(--nb-shadow)',
              padding: '8px 24px',
            }}
            aria-live="polite"
          >
            <TypeIt
              options={{ loop: false, speed: 100 }}
              getBeforeInit={(instance) => {
                instance.type('CAREER PATH').pause(500).type(' · JOURNEY');
                return instance;
              }}
            />
          </h1>
        </header>

        <ol className="timeline-container" ref={timelineRef}>
          {items.map((item, idx) => (
            <li
              key={item.key}
              className="timeline-item group"
            >
              {/* Icon bubble */}
              <div
                className="timeline-icon"
                style={{ background: iconColors[idx], color: idx === 2 ? 'var(--nb-yellow)' : 'var(--nb-black)' }}
              >
                <div className="text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
              </div>

              {/* Content card */}
              <article className="timeline-content">
                <h3
                  className="text-lg font-black font-grotesk mb-2"
                  style={{
                    background: iconColors[idx],
                    color: idx === 2 ? 'var(--nb-yellow)' : 'var(--nb-black)',
                    display: 'inline-block',
                    padding: '2px 10px',
                    border: '2px solid var(--nb-line)',
                  }}
                >
                  {item.title.toUpperCase()}
                </h3>
                <p className="text-sm leading-relaxed font-grotesk mt-3" style={{ color: 'var(--nb-ink)' }}>
                  {item.content}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Story;
