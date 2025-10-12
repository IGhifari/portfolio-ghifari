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
        <ul className="list-disc pl-5 mt-2 text-gray-300">
          <li>Implemented JWT authentication, React Query (server-state), and React Hook Form for scalable form handling.</li>
          <li>Next goals: deepen <strong>Node.js</strong> & start <strong>TypeScript</strong>.</li>
        </ul>
        <div className="mt-2 text-sm">
          <span className="text-gray-400">Links: </span>
          <a
            href="https://food-liart-one.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline mr-2"
          >
            Project Food 
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline mr-2 ml-2"
          >
            Game Ecovoyage-PulauHarapan 
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://github.com/IGhifari/Website-DesaKita"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline mr-2 ml-2"
          >
            Website Desaku Github
          </a>
          <span className="text-gray-500">·</span>
          <a
            href="https://bendaditempatku.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline ml-2"
          >
            Game Benda Ditempatku
          </a>
        </div>
      </>
    ),
  };

  return (
    <div className="container mx-auto my-20 pt-96">
      <h1 className="text-4xl font-bold text-center mb-12 hover:text-cyan-400 duration-500 transition-all ease-in-out">
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
        <div className="relative border-l-4 border-cyan-400 max-w-2xl">
          <div className="mb-10 pl-6 relative">
            <div className="absolute -left-4 top-0 bg-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              1
            </div>

            <h2 className="text-xl font-semibold text-cyan-400">{event.title}</h2>
            <p className="text-gray-400 text-sm italic">{event.place}</p>
            <p className="text-gray-500 text-sm">{event.date}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-200">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
