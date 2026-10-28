/**
 * Project data structure for portfolio showcase with bilingual support.
 * Separated into Featured Selected Works and Secondary Projects.
 */

export const selectedProjects = [
  {
    id: "akseskita",
    number: "01",
    categoryKey: "fullstack",
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
    details: {
      problem: {
        id: "Informasi mengenai ketersediaan fasilitas ramah disabilitas (seperti ramp, lift, dan toilet aksesibel) di ruang publik perkotaan sering kali tidak terdokumentasi secara terpusat, sehingga menyulitkan perencanaan mobilitas bagi penyandang disabilitas.",
        en: "Information regarding disability-friendly facilities (such as ramps, elevators, and accessible restrooms) in urban public spaces is rarely documented in a centralized manner, making mobility planning difficult for individuals with disabilities.",
      },
      solution: {
        id: "Membangun platform penjelajahan ruang publik berbasis web yang menyajikan informasi fasilitas aksesibilitas terverifikasi dan memungkinkan evaluasi kelayakan lokasi secara transparan.",
        en: "Built a web-based public space discovery platform that presents verified accessibility facility data and enables transparent location evaluations.",
      },
      architecture: {
        id: "Aplikasi full-stack dengan antarmuka React + TypeScript di sisi klien serta RESTful API Express.js, Prisma ORM, dan database relasional PostgreSQL di sisi server.",
        en: "Full-stack architecture pairing a React + TypeScript client interface with an Express.js RESTful API, Prisma ORM, and a PostgreSQL relational database.",
      },
      features: {
        id: [
          "Pencarian dan penjelajahan ruang publik berdasarkan kategori fasilitas aksesibilitas (ramp, lift, fasilitas inklusif)",
          "Halaman detail lokasi dengan indikator fasilitas terverifikasi dan ulasan pengguna",
          "Antarmuka responsif dengan fokus pada keterbacaan kontras dan navigasi yang ramah aksesibilitas",
        ],
        en: [
          "Search and discovery of public spaces filtered by accessibility facilities (ramps, elevators, inclusive amenities)",
          "Detailed venue views with verified facility indicators and community evaluations",
          "Responsive interface designed with high contrast readability and accessible navigation ergonomics",
        ],
      },
      contribution: {
        id: "Full-Stack Developer — merancang skema database Prisma/PostgreSQL, membangun endpoint REST API Express, serta mengimplementasikan antarmuka React + TypeScript.",
        en: "Full-Stack Developer — designed the Prisma/PostgreSQL database schema, built Express REST API endpoints, and implemented the React + TypeScript frontend.",
      },
    },
    image: "/akseskita.webp",
    tags: ["React", "TypeScript", "Express", "PostgreSQL", "Prisma"],
    github: "https://github.com/IGhifari/akses-kita",
    live: "https://akses-kita.vercel.app",
  },
  {
    id: "project-management",
    number: "02",
    categoryKey: "fullstack",
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
    details: {
      problem: {
        id: "Tim pengembangan membutuhkan ruang kerja terpusat untuk memantau status tugas lintas sprint, menetapkan prioritas, dan menyelaraskan progres anggota tim tanpa bergantung pada dokumen terpisah.",
        en: "Development teams need a centralized workspace to track task status across sprints, assign priorities, and align team progress without relying on fragmented spreadsheets.",
      },
      solution: {
        id: "Mengembangkan sistem manajemen proyek berbasis web dengan papan kanban interaktif, pengelompokan sprint, dan pelacakan alur kerja tim secara terstruktur.",
        en: "Engineered a web-based project management system featuring interactive kanban boards, sprint organization, and structured team workflow tracking.",
      },
      architecture: {
        id: "Frontend SPA menggunakan React, TypeScript, dan Tailwind CSS yang terhubung ke backend Express.js dengan Prisma ORM dan database PostgreSQL.",
        en: "Single-page application frontend built with React, TypeScript, and Tailwind CSS backed by an Express.js server, Prisma ORM, and PostgreSQL.",
      },
      features: {
        id: [
          "Manajemen tugas berbasis papan kanban dengan pembaruan status progres",
          "Pengorganisasian ruang kerja proyek, manajemen sprint, dan penugasan anggota tim",
          "Pemodelan relasional terstruktur untuk proyek, anggota, dan riwayat aktivitas tugas",
        ],
        en: [
          "Kanban-based task management with workflow status transitions",
          "Project workspace organization, sprint planning, and team member assignments",
          "Structured relational data modeling for projects, members, and task activity",
        ],
      },
      contribution: {
        id: "Full-Stack Developer — merancang model data proyek & sprint, membangun REST API, serta mengerjakan komponen antarmuka kanban.",
        en: "Full-Stack Developer — modeled project and sprint schemas, implemented REST API services, and built the kanban UI components.",
      },
    },
    image: "/project_management.webp",
    tags: ["React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Express"],
    github: null,
    live: null,
  },
  {
    id: "food-ecommerce",
    number: "03",
    categoryKey: "fullstack",
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
    details: {
      problem: {
        id: "Distribusi produk pertanian segar membutuhkan etalase digital yang memudahkan pembeli menjelajahi katalog, mengelola keranjang belanja, serta berkomunikasi langsung dengan pengelola toko.",
        en: "Fresh agricultural produce distribution requires a clean digital storefront that lets buyers browse catalogs, manage shopping carts, and communicate directly with store administrators.",
      },
      solution: {
        id: "Membangun platform e-commerce end-to-end dengan katalog produk terstruktur, state keranjang belanja yang sinkron, alur checkout, ulasan pelanggan, dan fitur pesan pengguna-admin.",
        en: "Developed an end-to-end e-commerce platform with structured product catalogs, synchronized cart state, checkout workflows, customer reviews, and user-admin messaging.",
      },
      architecture: {
        id: "Aplikasi full-stack dengan React dan TypeScript pada sisi frontend serta Express.js, Prisma ORM, dan PostgreSQL untuk pengelolaan katalog, transaksi, dan pesan.",
        en: "Full-stack application combining a React and TypeScript frontend with Express.js, Prisma ORM, and PostgreSQL for catalog, order, and messaging persistence.",
      },
      features: {
        id: [
          "Katalog produk pertanian dengan pencarian dan penyaringan kategori",
          "Manajemen keranjang belanja dan alur checkout pesanan",
          "Sistem ulasan pelanggan terverifikasi dan komunikasi langsung pengguna-admin",
        ],
        en: [
          "Agricultural product catalog with search and category filtering",
          "Shopping cart state management and order checkout workflow",
          "Verified customer review system and direct user-to-admin messaging",
        ],
      },
      contribution: {
        id: "Full-Stack Developer — mengembangkan antarmuka toko dan manajemen state keranjang, merancang skema database Prisma, serta mengintegrasikan endpoint transaksi dan pesan.",
        en: "Full-Stack Developer — built the storefront UI and cart state management, designed Prisma schemas, and integrated order and messaging APIs.",
      },
    },
    image: "/food.webp",
    tags: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL"],
    github: "https://github.com/IGhifari/web-food",
    live: "https://food-liart-one.vercel.app",
  },
  {
    id: "internship-journal",
    number: "04",
    categoryKey: "fullstack",
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
    details: {
      problem: {
        id: "Pencatatan jurnal kegiatan magang siswa secara manual menyulitkan pemantauan berkala, pengumpulan bukti dokumentasi, dan proses validasi oleh pembimbing.",
        en: "Manual paper-based internship logbooks make periodic monitoring, documentation submission, and mentor validation slow and difficult to track.",
      },
      solution: {
        id: "Merancang sistem jurnal magang berbasis web yang mendigitalkan pelaporan harian siswa serta menyediakan alur peninjauan dan evaluasi terstruktur bagi mentor.",
        en: "Created a web-based internship journal system that digitizes daily student reporting and provides a structured review and evaluation workflow for mentors.",
      },
      architecture: {
        id: "Antarmuka web menggunakan React dan Tailwind CSS yang terintegrasi dengan backend Laravel dan database relasional MySQL.",
        en: "Web interface built with React and Tailwind CSS integrated with a Laravel backend and MySQL relational database.",
      },
      features: {
        id: [
          "Pencatatan log aktivitas magang harian beserta unggahan dokumentasi progres",
          "Dasbor pembimbing/mentor untuk meninjau, memvalidasi, dan memberi evaluasi laporan siswa",
          "Rekapitulasi kehadiran dan riwayat kegiatan magang secara terpusat",
        ],
        en: [
          "Daily internship activity logging with progress documentation uploads",
          "Mentor dashboard for reviewing, validating, and evaluating student submissions",
          "Centralized attendance summaries and chronological activity history",
        ],
      },
      contribution: {
        id: "Full-Stack Web Developer — membangun antarmuka pelaporan siswa dan dasbor evaluasi serta mengintegrasikan autentikasi dan CRUD dengan backend Laravel & MySQL.",
        en: "Full-Stack Web Developer — implemented student reporting and mentor evaluation views and integrated authentication and CRUD workflows with Laravel & MySQL.",
      },
    },
    image: "/internship.webp",
    tags: ["React", "Laravel", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/internship-journal",
    live: null,
  },
];

export const otherProjects = [
  {
    id: "class-1ia08",
    categoryKey: "webapp",
    title: "Class 1IA08 Website",
    category: {
      id: "Aplikasi Web",
      en: "Web Application",
    },
    description: {
      id: "Website informasi kelas untuk mengelola dan menampilkan pengumuman, tugas, mata kuliah, serta informasi akademik Class 1IA08.",
      en: "A class information website for managing and displaying announcements, assignments, courses, and academic information for Class 1IA08.",
    },
    details: {
      problem: {
        id: "Pengumuman akademik, daftar tugas, dan jadwal mata kuliah kelas sering tersebar di berbagai grup pesan sehingga mudah terlewat oleh mahasiswa.",
        en: "Academic announcements, assignment deadlines, and course schedules are often scattered across chat groups, making them easy for students to miss.",
      },
      solution: {
        id: "Menyediakan portal informasi kelas terpusat untuk menampilkan pengumuman, tugas, daftar mata kuliah, dan agenda akademik Class 1IA08 secara rapi.",
        en: "Provided a centralized class portal to organize and display announcements, assignments, courses, and academic schedules for Class 1IA08.",
      },
      architecture: {
        id: "SPA berbasis React + Vite dengan Tailwind CSS, komponen shadcn/ui, React Router, animasi Framer Motion, serta backend-as-a-service Supabase.",
        en: "React + Vite SPA styled with Tailwind CSS, shadcn/ui components, React Router, Framer Motion animations, and Supabase backend services.",
      },
      features: {
        id: [
          "Papan pengumuman kelas dan pelacakan daftar tugas akademik",
          "Direktori jadwal mata kuliah dan informasi struktur kelas",
          "Antarmuka responsif untuk akses cepat melalui perangkat seluler maupun desktop",
        ],
        en: [
          "Class announcement board and academic assignment tracker",
          "Course schedule directory and class structure information",
          "Responsive layout optimized for quick mobile and desktop access",
        ],
      },
      contribution: {
        id: "Frontend / Web Developer — berkontribusi dalam pengembangan antarmuka halaman informasi akademik, komponen UI, dan integrasi data Supabase.",
        en: "Frontend / Web Developer — contributed to academic information views, UI components, and Supabase data integration.",
      },
    },
    image: "/class1ia08.webp",
    tags: ["React", "Vite", "JavaScript", "Tailwind CSS", "shadcn/ui", "Supabase", "React Router", "Framer Motion"],
    github: "https://github.com/ikmalz/class-1IA08",
    live: "https://class-gokilll.vercel.app/",
  },
  {
    id: "ecovoyage",
    categoryKey: "game",
    title: "Game EcoVoyage - Pulau Harapan",
    category: {
      id: "Game Web Edukasi",
      en: "Educational Web Game",
    },
    description: {
      id: "Game web edukasi interaktif yang dibangun untuk mengedukasi pemain tentang keberlanjutan ekosistem laut dan konservasi lingkungan di sekitar Pulau Harapan.",
      en: "An interactive educational web game built to educate players on marine ecosystem sustainability and environmental conservation around Pulau Harapan.",
    },
    details: {
      problem: {
        id: "Materi edukasi mengenai konservasi laut dan ekosistem pesisir sering disampaikan secara satu arah sehingga kurang menarik bagi pelajar.",
        en: "Educational material on marine conservation and coastal ecosystems is often presented passively, reducing engagement for younger learners.",
      },
      solution: {
        id: "Membangun game web interaktif bertema Pulau Harapan yang mengajak pemain belajar menjaga kelestarian ekosistem laut melalui simulasi permainan langsung di browser.",
        en: "Built an interactive Pulau Harapan-themed browser game that teaches marine ecosystem conservation through hands-on gameplay.",
      },
      architecture: {
        id: "Aplikasi web ringan berbasis HTML5, CSS3, dan Vanilla JavaScript tanpa dependensi framework berat agar dapat dijalankan langsung di berbagai perangkat.",
        en: "Lightweight browser application built with HTML5, CSS3, and Vanilla JavaScript without heavy framework dependencies for broad device compatibility.",
      },
      features: {
        id: [
          "Alur permainan interaktif bertema pelestarian lingkungan Pulau Harapan",
          "Umpan balik visual dan skor untuk memperkuat pemahaman materi konservasi",
          "Dapat dimainkan langsung melalui browser tanpa instalasi tambahan",
        ],
        en: [
          "Interactive gameplay centered on Pulau Harapan environmental conservation",
          "Visual feedback and scoring mechanics that reinforce learning objectives",
          "Runs directly in the browser with zero installation required",
        ],
      },
      contribution: {
        id: "Game & Web Developer — mengimplementasikan logika permainan JavaScript, interaksi DOM, dan tata letak visual CSS3.",
        en: "Game & Web Developer — implemented JavaScript game logic, DOM interactions, and CSS3 visual layouts.",
      },
    },
    image: "/pulauharapan.webp",
    tags: ["HTML5", "JavaScript", "CSS3"],
    github: "https://github.com/IGhifari/EcoVoyage-PulauHarapan",
    live: "https://ighifari.github.io/EcoVoyage-PulauHarapan/views/halamanAwal.html",
  },
  {
    id: "a-day-at-home",
    categoryKey: "game",
    title: "A Day At Home",
    category: {
      id: "Game Web Edukasi",
      en: "Educational Web Game",
    },
    description: {
      id: "Game web visual edukatif yang dibuat khusus untuk anak-anak tunarungu, memanfaatkan penceritaan interaktif dan isyarat visual untuk meningkatkan keterlibatan kognitif.",
      en: "A visual educational web game created specifically for deaf children, leveraging interactive storytelling and visual cues to enhance cognitive engagement.",
    },
    details: {
      problem: {
        id: "Media pembelajaran interaktif untuk anak-anak tunarungu membutuhkan pendekatan yang mengutamakan isyarat visual yang jelas tanpa bergantung pada instruksi audio.",
        en: "Interactive learning media for deaf children requires clear visual-first cues and storytelling without relying on audio instructions.",
      },
      solution: {
        id: "Mengembangkan game edukasi berbasis visual 'A Day At Home' yang mengenalkan benda dan aktivitas sehari-hari di rumah melalui ilustrasi dan interaksi ramah anak.",
        en: "Developed 'A Day At Home', a visual educational game introducing everyday household objects and activities through illustrations and child-friendly interactions.",
      },
      architecture: {
        id: "Aplikasi web interaktif berbasis React dan Tailwind CSS yang dioptimalkan untuk responsivitas visual dan kemudahan navigasi.",
        en: "Interactive web application built with React and Tailwind CSS optimized for visual clarity and straightforward navigation.",
      },
      features: {
        id: [
          "Permainan pengenalan objek dan aktivitas rumah berbasis isyarat visual penuh",
          "Penceritaan interaktif langkah demi langkah yang ramah bagi siswa SLB/tunarungu",
          "Antarmuka bersih dengan tombol aksi berukuran jelas dan mudah dijangkau",
        ],
        en: [
          "Visual-first object recognition and household activity gameplay",
          "Step-by-step interactive storytelling tailored for deaf / special-needs students",
          "Clean interface with accessible, high-visibility action controls",
        ],
      },
      contribution: {
        id: "Frontend Developer (Proyek Kompetisi Clevio) — membangun komponen interaksi permainan dengan React dan menyusun tampilan menggunakan Tailwind CSS.",
        en: "Frontend Developer (Clevio Competition Project) — built interactive game components with React and styled the interface using Tailwind CSS.",
      },
    },
    image: "/seharidirumah.webp",
    tags: ["React", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Project-Game-Clevio-SLB",
    live: "https://bendaditempatku.netlify.app/",
  },
  {
    id: "desaku",
    categoryKey: "fullstack",
    title: "Desaku",
    category: {
      id: "Portal Administrasi / Full-Stack",
      en: "Administrative Portal / Full-Stack",
    },
    description: {
      id: "Portal administrasi digital yang dirancang untuk memodernisasi tata kelola desa, mengelola data kartu keluarga, dan mendistribusikan pengumuman komunitas publik.",
      en: "A digital administrative portal designed to modernize village governance, manage family registry records, and distribute public community announcements.",
    },
    details: {
      problem: {
        id: "Pengelolaan data warga, pencatatan kartu keluarga, dan penyebaran informasi desa yang masih terpisah memperlambat layanan administrasi masyarakat.",
        en: "Fragmented resident records, family registry administration, and village announcements slow down community public services.",
      },
      solution: {
        id: "Membangun portal administrasi desa berbasis web untuk mengelola data kependudukan/kartu keluarga dan mempublikasikan pengumuman desa secara terpusat.",
        en: "Built a web-based village administrative portal to manage family registry data and publish community announcements centrally.",
      },
      architecture: {
        id: "Aplikasi full-stack dengan frontend React & Tailwind CSS serta backend Express.js, Prisma ORM, dan database MySQL.",
        en: "Full-stack application pairing a React & Tailwind CSS frontend with an Express.js backend, Prisma ORM, and MySQL database.",
      },
      features: {
        id: [
          "Manajemen data warga dan pencatatan kartu keluarga terstruktur",
          "Publikasi berita dan pengumuman kegiatan desa untuk warga",
          "Antarmuka dasbor administrasi dengan operasi CRUD tervalidasi",
        ],
        en: [
          "Structured resident and family registry (Kartu Keluarga) data management",
          "Public village news and community announcement publishing",
          "Administrative dashboard interface with validated CRUD operations",
        ],
      },
      contribution: {
        id: "Full-Stack Developer — merancang skema database MySQL/Prisma, membuat REST API Express, dan membangun antarmuka dasbor React.",
        en: "Full-Stack Developer — designed the MySQL/Prisma schema, created Express REST APIs, and built the React dashboard views.",
      },
    },
    image: "/desaku.webp",
    tags: ["React", "Express", "Prisma", "MySQL", "Tailwind CSS"],
    github: "https://github.com/IGhifari/Website-DesaKita",
    live: null,
  },
  {
    id: "portfolio-ghifari",
    categoryKey: "webapp",
    title: "Portfolio Website",
    category: {
      id: "Aplikasi Web / Portofolio",
      en: "Web Application / Portfolio",
    },
    description: {
      id: "Website portofolio pengembang pribadi yang dirancang dengan estetika editorial gelap modern, mikro-interaksi taktil, tipografi responsif, dan aksen WebGL.",
      en: "Personal developer portfolio designed with modern dark editorial aesthetics, tactile micro-interactions, responsive typography, and WebGL accents.",
    },
    details: {
      problem: {
        id: "Menyajikan karya rekayasa perangkat lunak, latar belakang akademik, dan sertifikasi dalam satu halaman web yang cepat, responsif, dan mudah ditinjau oleh perekrut.",
        en: "Presenting software engineering work, academic background, and certifications in a single fast, responsive web experience that is easy for recruiters to evaluate.",
      },
      solution: {
        id: "Merancang portofolio interaktif bergaya editorial dengan dukungan dwibahasa (ID/EN), mode tema gelap/terang, studi kasus proyek, dan optimasi performa pemuatan.",
        en: "Designed an interactive editorial portfolio featuring bilingual (ID/EN) support, dark/light themes, project case studies, and lazy-loaded asset optimization.",
      },
      architecture: {
        id: "Aplikasi React 18 + Vite dengan Tailwind CSS, Framer Motion, code-splitting per section, kanvas shader WebGL OGL, dan integrasi formulir EmailJS + Zod.",
        en: "React 18 + Vite application using Tailwind CSS, Framer Motion, section-level code splitting, an OGL WebGL shader canvas, and EmailJS + Zod form integration.",
      },
      features: {
        id: [
          "Dukungan dwibahasa penuh (Indonesia & Inggris) dan tema Gelap/Terang",
          "Modal studi kasus proyek, penyaringan kategori, serta pratinjau sertifikat",
          "Optimasi performa dengan pemuatan audio tertunda, aset WebP, dan code splitting",
        ],
        en: [
          "Full bilingual (Indonesian & English) and Dark/Light theme support",
          "Project case study modal, category filtering, and certificate lightbox preview",
          "Performance-optimized with deferred audio loading, WebP assets, and code splitting",
        ],
      },
      contribution: {
        id: "Perancang & Pengembang Utama — merancang sistem desain, arsitektur komponen, animasi, dan optimasi performa.",
        en: "Sole Designer & Developer — engineered the design system, component architecture, motion interactions, and performance optimizations.",
      },
    },
    image: "/portfolio.webp",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/IGhifari/Portfolio-ghifari",
    live: "https://portfolio-ghifari.vercel.app",
  },
];
