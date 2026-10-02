/**
 * Project data structure for portfolio showcase.
 * Separated into Featured Selected Works and Secondary Projects.
 */

export const selectedProjects = [
  {
    id: "akseskita",
    number: "01",
    category: "WEB PLATFORM / ACCESSIBILITY",
    title: "AksesKita",
    subtitle: "Public Accessibility Discovery System",
    description: "An accessibility-focused web application designed to help individuals with disabilities discover and evaluate public spaces in urban areas based on verified accessibility facilities, ramps, elevators, and inclusive amenities.",
    image: "/akseskita.png",
    tags: ["React", "TypeScript", "Express", "PostgreSQL", "Prisma"],
    github: "https://github.com/IGhifari",
    live: null,
  },
  {
    id: "project-management",
    number: "02",
    category: "ENTERPRISE / FULL-STACK",
    title: "Project Management System",
    subtitle: "Team Collaboration & Task Tracking",
    description: "A comprehensive project management platform built to streamline agile task tracking, sprint management, and cross-functional team collaboration through intuitive kanban and workflow tooling.",
    image: "/project_management.png",
    tags: ["React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Express"],
    // Omit fake "user/project-management-system" placeholder link
    github: null,
    live: null,
  },
  {
    id: "food-ecommerce",
    number: "03",
    category: "E-COMMERCE / FULL-STACK",
    title: "Food Marketplace",
    subtitle: "Agricultural Produce Platform",
    description: "A modern web-based e-commerce platform for fresh agricultural produce, featuring comprehensive product catalogs, cart state management, checkout workflows, verified customer reviews, and direct user-admin messaging.",
    image: "/food.png",
    tags: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL"],
    github: "https://github.com/IGhifari/web-food",
    live: "https://food-liart-one.vercel.app",
  },
  {
    id: "internship-journal",
    number: "04",
    category: "MANAGEMENT / WEB APP",
    title: "Internship Journal Siswa",
    subtitle: "Student Activity & Log Management",
    description: "A web-based reporting system created to help vocational students log daily internship activities, submit progress documentation, and facilitate structured mentor reviews and performance evaluations.",
    image: "/internship.png",
    tags: ["React", "Laravel", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/internship-journal",
    // Omit placeholder "https://your-internship-journal.com"
    live: null,
  },
];

export const otherProjects = [
  {
    id: "ecovoyage",
    title: "Game EcoVoyage - Pulau Harapan",
    description: "An interactive educational web game built to educate players on marine ecosystem sustainability and environmental conservation around Pulau Harapan.",
    image: "/pulauharapan.png",
    tags: ["HTML5", "JavaScript", "CSS3"],
    github: "https://github.com/IGhifari/EcoVoyage-PulauHarapan",
    live: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html",
  },
  {
    id: "a-day-at-home",
    title: "A Day At Home",
    description: "A visual educational web game created specifically for deaf children, leveraging interactive storytelling and visual cues to enhance cognitive engagement.",
    image: "/seharidirumah.png",
    tags: ["React", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Project-Game-Clevio-SLB",
    live: "https://bendaditempatku.netlify.app/",
  },
  {
    id: "desaku",
    title: "Desaku",
    description: "A digital administrative portal designed to modernize village governance, manage family registry records, and distribute public community announcements.",
    image: "/desaku.png",
    tags: ["React", "Express", "Prisma", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Website-DesaKita",
    // Omit generic placeholder "desaku.com"
    live: null,
  },
  {
    id: "portfolio-ghifari",
    title: "Portfolio Website",
    description: "Personal developer portfolio designed with modern dark editorial aesthetics, tactile micro-interactions, responsive typography, and WebGL accents.",
    image: "/portfolio.png",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/IGhifari/Portfolio-ghifari",
    live: null,
  },
];
