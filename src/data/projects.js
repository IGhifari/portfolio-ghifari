/**
 * Project data structure for portfolio showcase with bilingual support.
 * Separated into Featured Selected Works and Secondary Projects.
 */

export const selectedProjects = [
  {
    id: "akseskita",
    number: "01",
    category: {
      id: "PLATFORM WEB / AKSESIBILITAS",
      en: "WEB PLATFORM / ACCESSIBILITY",
    },
    title: "AksesKita",
    subtitle: {
      id: "Sistem Penjelajahan Aksesibilitas Publik",
      en: "Public Accessibility Discovery System",
    },
    description: {
      id: "Aplikasi web berfokus aksesibilitas yang dirancang untuk membantu penyandang disabilitas menemukan dan mengevaluasi ruang publik di area perkotaan berdasarkan fasilitas aksesibilitas terverifikasi, ramp, lift, dan fasilitas inklusif.",
      en: "An accessibility-focused web application designed to help individuals with disabilities discover and evaluate public spaces in urban areas based on verified accessibility facilities, ramps, elevators, and inclusive amenities.",
    },
    image: "/akseskita.png",
    tags: ["React", "TypeScript", "Express", "PostgreSQL", "Prisma"],
    github: "https://github.com/IGhifari/akses-kita",
    live: "https://akses-kita.vercel.app",
  },
  {
    id: "project-management",
    number: "02",
    category: {
      id: "ENTERPRISE / FULL-STACK",
      en: "ENTERPRISE / FULL-STACK",
    },
    title: "Project Management System",
    subtitle: {
      id: "Kolaborasi Tim & Pelacakan Tugas",
      en: "Team Collaboration & Task Tracking",
    },
    description: {
      id: "Platform manajemen proyek komprehensif yang dibangun untuk menyederhanakan pelacakan tugas agile, manajemen sprint, dan kolaborasi tim lintas fungsi melalui kanban dan alur kerja yang intuitif.",
      en: "A comprehensive project management platform built to streamline agile task tracking, sprint management, and cross-functional team collaboration through intuitive kanban and workflow tooling.",
    },
    image: "/project_management.png",
    tags: ["React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Express"],
    github: null,
    live: null,
  },
  {
    id: "food-ecommerce",
    number: "03",
    category: {
      id: "E-COMMERCE / FULL-STACK",
      en: "E-COMMERCE / FULL-STACK",
    },
    title: "Food Marketplace",
    subtitle: {
      id: "Platform Produk Pertanian Segar",
      en: "Agricultural Produce Platform",
    },
    description: {
      id: "Platform e-commerce berbasis web modern untuk produk pertanian segar, menampilkan katalog produk lengkap, manajemen keranjang belanja, alur checkout, ulasan terverifikasi, dan pesan langsung pengguna-admin.",
      en: "A modern web-based e-commerce platform for fresh agricultural produce, featuring comprehensive product catalogs, cart state management, checkout workflows, verified customer reviews, and direct user-admin messaging.",
    },
    image: "/food.png",
    tags: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL"],
    github: "https://github.com/IGhifari/web-food",
    live: "https://food-liart-one.vercel.app",
  },
  {
    id: "internship-journal",
    number: "04",
    category: {
      id: "MANAJEMEN / APLIKASI WEB",
      en: "MANAGEMENT / WEB APP",
    },
    title: "Internship Journal Siswa",
    subtitle: {
      id: "Manajemen Aktivitas & Log Siswa",
      en: "Student Activity & Log Management",
    },
    description: {
      id: "Sistem pelaporan berbasis web yang dibuat untuk membantu siswa kejuruan mencatat aktivitas magang harian, mengirimkan dokumentasi progres, serta memfasilitasi tinjauan terstruktur dan evaluasi performa dari mentor.",
      en: "A web-based reporting system created to help vocational students log daily internship activities, submit progress documentation, and facilitate structured mentor reviews and performance evaluations.",
    },
    image: "/internship.png",
    tags: ["React", "Laravel", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/internship-journal",
    live: null,
  },
];

export const otherProjects = [
  {
    id: "class-1ia08",
    title: "Class 1IA08 Website",
    category: {
      id: "Aplikasi Web",
      en: "Web Application",
    },
    description: {
      id: "Website informasi kelas untuk mengelola dan menampilkan pengumuman, tugas, mata kuliah, serta informasi akademik Class 1IA08.",
      en: "A class information website for managing and displaying announcements, assignments, courses, and academic information for Class 1IA08.",
    },
    image: "/class1ia08.png",
    tags: ["React", "Vite", "JavaScript", "Tailwind CSS", "shadcn/ui", "Supabase", "React Router", "Framer Motion"],
    github: "https://github.com/ikmalz/class-1IA08",
    live: "https://class-gokilll.vercel.app/",
  },
  {
    id: "ecovoyage",
    title: "Game EcoVoyage - Pulau Harapan",
    description: {
      id: "Game web edukasi interaktif yang dibangun untuk mengedukasi pemain tentang keberlanjutan ekosistem laut dan konservasi lingkungan di sekitar Pulau Harapan.",
      en: "An interactive educational web game built to educate players on marine ecosystem sustainability and environmental conservation around Pulau Harapan.",
    },
    image: "/pulauharapan.png",
    tags: ["HTML5", "JavaScript", "CSS3"],
    github: "https://github.com/IGhifari/EcoVoyage-PulauHarapan",
    live: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html",
  },
  {
    id: "a-day-at-home",
    title: "A Day At Home",
    description: {
      id: "Game web visual edukatif yang dibuat khusus untuk anak-anak tunarungu, memanfaatkan penceritaan interaktif dan isyarat visual untuk meningkatkan keterlibatan kognitif.",
      en: "A visual educational web game created specifically for deaf children, leveraging interactive storytelling and visual cues to enhance cognitive engagement.",
    },
    image: "/seharidirumah.png",
    tags: ["React", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Project-Game-Clevio-SLB",
    live: "https://bendaditempatku.netlify.app/",
  },
  {
    id: "desaku",
    title: "Desaku",
    description: {
      id: "Portal administrasi digital yang dirancang untuk memodernisasi tata kelola desa, mengelola data kartu keluarga, dan mendistribusikan pengumuman komunitas publik.",
      en: "A digital administrative portal designed to modernize village governance, manage family registry records, and distribute public community announcements.",
    },
    image: "/desaku.png",
    tags: ["React", "Express", "Prisma", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Website-DesaKita",
    live: null,
  },
  {
    id: "portfolio-ghifari",
    title: "Portfolio Website",
    description: {
      id: "Website portofolio pengembang pribadi yang dirancang dengan estetika editorial gelap modern, mikro-interaksi taktil, tipografi responsif, dan aksen WebGL.",
      en: "Personal developer portfolio designed with modern dark editorial aesthetics, tactile micro-interactions, responsive typography, and WebGL accents.",
    },
    image: "/portfolio.png",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/IGhifari/Portfolio-ghifari",
    live: "https://portfolio-ghifari.vercel.app",
  },
];
