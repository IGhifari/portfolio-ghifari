import React from 'react';
import TypeIt from "typeit-react";
import '../styles/Components.css';

const Timeline = () => {
  const event = {
    date: "July 2023 – June 2026 (Expected)",
    title: "Vocational High School — SMKN 1 Cibinong",
    place: "Cibinong, Bogor Regency, West Java, Indonesia",
    description: (
      <>
        Majoring in <strong>Software Engineering (RPL)</strong>, learning both frontend and backend web development.
        Built multiple projects such as <strong>Project Food</strong> and <strong>Desaku</strong> using React, Tailwind, Express, Prisma, and MySQL.{" "}
        Experienced in version control (Git/GitHub), API design, and testing workflows.
        <ul className="list-disc pl-5 mt-3 space-y-1 font-grotesk" style={{ color: 'var(--nb-ink)' }}>
          <li>Implemented JWT authentication, React Query, and React Hook Form for scalable form handling.</li>
          <li>Next goals: deepen <strong>Node.js</strong> & start <strong>TypeScript</strong>.</li>
        </ul>
        <div className="mt-4 text-sm flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-bold font-mono" style={{ color: 'var(--nb-muted)' }}>Links:</span>
          {[
            { href: "https://food-liart-one.vercel.app/", label: "Project Food" },
            { href: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html", label: "EcoVoyage" },
            { href: "https://github.com/IGhifari/Website-DesaKita", label: "Desaku GitHub" },
            { href: "https://bendaditempatku.netlify.app/", label: "A Day At Home" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-bold text-xs px-2 py-1 transition-all duration-150"
              style={{
                background: 'var(--nb-yellow)',
                border: '2px solid var(--nb-line)',
                color: 'var(--nb-black)',
                textDecoration: 'none',
                boxShadow: '2px 2px 0px var(--nb-shadow-color)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--nb-shadow-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px var(--nb-shadow-color)'; }}
            >
              {label} ↗
            </a>
          ))}
        </div>
      </>
    ),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-16 pt-16 lg:pt-20">
      {/* Section header */}
      <div className="flex flex-col items-center mb-12">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black font-grotesk text-center"
          style={{
            background: 'var(--nb-yellow)',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow)',
            display: 'inline-block',
            padding: '8px 24px',
            color: 'var(--nb-black)',
          }}
        >
          <TypeIt
            options={{ loop: false, speed: 100 }}
            getBeforeInit={(instance) => {
              instance
                .type("ACADEMIC BACKGROUND")
                .pause(700)
                .type(" · EDUCATION");
              return instance;
            }}
          />
        </h1>
        <div style={{ width: '100%', height: '3px', background: 'var(--nb-line)', marginTop: '4px', maxWidth: '260px' }} />
      </div>

      <div className="flex justify-center">
        <div className="relative max-w-2xl w-full">
          {/* Timeline vertical line */}
          <div
            className="absolute top-0 h-full"
            style={{
              left: '20px',
              width: '4px',
              background: 'var(--nb-line)',
            }}
          />

          <div className="mb-8 pl-14 relative">
            {/* Bullet */}
            <div
              className="absolute flex items-center justify-center font-black font-mono text-xs"
              style={{
                left: '8px',
                top: '0',
                width: '28px',
                height: '28px',
                background: 'var(--nb-yellow)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-hover)',
                color: 'var(--nb-black)',
              }}
            >
              1
            </div>

            {/* Card */}
            <div
              className="p-5"
              style={{
                background: 'var(--nb-white)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-lg)',
              }}
            >
              <h2
                className="text-lg sm:text-xl font-black font-grotesk mb-1"
                style={{ color: 'var(--nb-ink)' }}
              >
                {event.title}
              </h2>
              <p className="font-mono text-xs italic mb-1" style={{ color: 'var(--nb-muted)' }}>{event.place}</p>
              <span
                className="inline-block font-mono text-xs font-bold px-2 py-1 mb-4"
                style={{ background: 'var(--nb-red)', color: 'white', border: '2px solid var(--nb-line)' }}
              >
                {event.date}
              </span>

              <div className="text-sm leading-relaxed font-grotesk" style={{ color: 'var(--nb-ink)' }}>
                {event.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
