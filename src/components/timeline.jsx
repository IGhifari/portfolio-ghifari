import React from 'react';
import TypeIt from "typeit-react";
import './components.css';

const Timeline = () => {
  const event = {
    date: "July 2023 – June 2026 (Expected)",
    title: "Vocational High School — SMKN 1 Cibinong",
    place: "Cibinong, Bogor Regency, West Java, Indonesia",
    description: (
      <>
        Majoring in <span className="text-cyan-400">Software Engineering (RPL)</span>, learning both frontend and backend web development.
        Built multiple projects such as <strong>Project Food</strong> and <strong>Desaku</strong> using React, Tailwind, Express, Prisma, and MySQL.{" "}
        Experienced in version control (Git/GitHub), API design, and testing workflows.
        <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
          <li>Implemented JWT authentication, React Query (server-state), and React Hook Form for scalable form handling.</li>
          <li>Next goals: deepen <strong>Node.js</strong> & start <strong>TypeScript</strong>.</li>
        </ul>
        <div className="mt-3 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-gray-400">Links:</span>
          <a
            href="https://food-liart-one.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Project Food
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Game Ecovoyage-PulauHarapan
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://github.com/IGhifari/Website-DesaKita"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Website Desaku GitHub
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://bendaditempatku.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Game Benda Ditempatku
          </a>
        </div>
      </>
    ),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-16 lg:my-20 pt-96 lg:pt-96">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 hover:text-cyan-400 duration-500 transition-colors ease-in-out">
        <TypeIt
          options={{ loop: false, speed: 100 }}
          getBeforeInit={(instance) => {
            instance
              .type("Academic Background")
              .pause(700)
              .type(" · ")
              .type("Education Timeline");
            return instance;
          }}
        />
      </h1>

      <div className="flex justify-center">
        <div className="relative max-w-2xl w-full">
          {/* Garis timeline responsif */}
          <div className="absolute left-3 sm:left-4 top-0 h-full border-l-2 sm:border-l-4 border-cyan-400/80 pointer-events-none" />

          <div className="mb-8 sm:mb-10 pl-10 sm:pl-12 relative">
            {/* Bullet nomor responsif */}
            <div className="absolute left-1 sm:left-1 top-0 bg-cyan-400 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-black font-bold shadow-md">
              <span className="text-[10px] sm:text-xs">1</span>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-400">{event.title}</h2>
            <p className="text-gray-400 text-xs sm:text-sm italic">{event.place}</p>
            <p className="text-gray-500 text-xs sm:text-sm">{event.date}</p>

            {/* Jangan bungkus description dengan <p>, karena berisi elemen block */}
            <div className="mt-2 sm:mt-3 text-sm sm:text-[0.95rem] leading-relaxed text-gray-200">
              {event.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
