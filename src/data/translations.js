/**
 * Comprehensive bilingual translations dictionary for Ghifari's portfolio.
 * Supported languages: 'id' (Indonesian - default), 'en' (English).
 */

export const translations = {
  id: {
    // Navbar
    nav: {
      work: "PROYEK",
      about: "TENTANG",
      journey: "PERJALANAN",
      stack: "TEKNOLOGI",
      contact: "KONTAK",
      themeToLight: "Ganti ke mode terang",
      themeToDark: "Ganti ke mode gelap",
      openMenu: "Buka menu navigasi",
      closeMenu: "Tutup menu navigasi",
      switchLangToEn: "Ganti ke Bahasa Inggris",
      switchLangToId: "Ganti ke Bahasa Indonesia",
      langGroup: "Pilihan bahasa",
    },

    // Hero / Profile
    hero: {
      available: "TERSEDIA UNTUK BEKERJA",
      role: "WEB DEVELOPER / SOFTWARE ENGINEER",
      valueProp: "Saya membangun aplikasi web modern dengan antarmuka yang matang dan sistem yang andal.",
      exploreWork: "LIHAT KARYA",
      githubCta: "GITHUB",
      scroll: "GULIR",
      scrollAria: "Gulir ke bawah untuk melihat karya",
      githubAria: "Profil GitHub",
      linkedinAria: "Profil LinkedIn",
    },

    // Projects
    projects: {
      sectionTag: "01 / KARYA PILIHAN",
      heading: "PROYEK PILIHAN",
      intro: "Koleksi pilihan aplikasi dan sistem yang telah saya rancang dan kembangkan.",
      sourceCode: "KODE SUMBER",
      liveDemo: "DEMO LANGSUNG",
      sourceCodeAria: "Lihat kode sumber di GitHub",
      liveDemoAria: "Buka demo langsung",
      archiveTag: "02 / ARSIP",
      archiveHeading: "PROYEK LAINNYA",
      archiveIntro: "Eksperimen sebelumnya, game web edukatif, dan aplikasi manajemen digital.",
      githubRepo: "Repositori GitHub",
      liveDeployment: "Peluncuran Langsung",
    },

    // About
    about: {
      sectionTag: "02 / TENTANG",
      heading: "TENTANG SAYA",
      statement: "Saya membangun aplikasi web yang menyeimbangkan antarmuka intuitif dengan rekayasa perangkat lunak yang andal.",
      metaRoleLabel: "PERAN",
      metaRoleValue: "Web Developer / Software Engineer",
      metaLocationLabel: "LOKASI",
      metaLocationValue: "Bogor / Jakarta, Indonesia",
      metaStatusLabel: "STATUS",
      metaStatusValue: "Tersedia untuk Proyek",
      p1: "Saya seorang web developer yang berfokus pada pengembangan aplikasi web praktis dan dapat diandalkan menggunakan React serta teknologi backend modern. Saya menikmati mengubah ide produk menjadi antarmuka terstruktur, arsitektur sistem yang mudah dipelihara, dan pengalaman pengguna yang andal.",
      p2: "Fondasi pengembangan saya dibangun melalui pendidikan rekayasa perangkat lunak langsung dan diperkuat dengan membangun proyek full-stack end-to-end—termasuk platform aksesibilitas, alat manajemen proyek, dan aplikasi e-commerce.",
      p3: "Saya menghargai organisasi kode yang rapi, manajemen state yang terprediksi, dan ergonomi UI yang jelas. Saya percaya perangkat lunak tidak hanya harus terlihat rapi tetapi juga berkinerja lancar dan tetap mudah dipelihara dalam jangka panjang.",
      focusHeader: "FOKUS & KEAHLIAN SAAT INI",
      focusAreas: [
        {
          title: "Rekayasa Frontend",
          description: "Membangun antarmuka web yang responsif dan aksesibel menggunakan React, JavaScript/TypeScript modern, serta sistem komponen yang skalabel.",
        },
        {
          title: "Arsitektur Full-Stack",
          description: "Mengembangkan aplikasi end-to-end dengan Node.js, Express, RESTful API, dan Prisma ORM yang didukung database relasional.",
        },
        {
          title: "Kualitas UI & Aksesibilitas",
          description: "Merancang pengalaman pengguna yang matang dengan HTML semantik, Tailwind CSS, tipografi responsif yang fleksibel, dan kesadaran aksesibilitas WCAG.",
        },
        {
          title: "Sistem & Pemodelan Data",
          description: "Merancang model skema terstruktur dan kueri menggunakan PostgreSQL dan MySQL dengan autentikasi aman dan pola CRUD.",
        },
      ],
    },

    // Journey
    journey: {
      sectionTag: "03 / PERJALANAN",
      heading: "PERJALANAN PENGEMBANGAN",
      intro: "Perkembangan kronologis dari fondasi pemrograman hingga pengembangan aplikasi full-stack.",
      milestones: [
        {
          number: "01",
          stage: "FONDASI AWAL",
          focus: "Rekayasa Perangkat Lunak Kejuruan & Web Dasar",
          description:
            "Memulai jalur pengembangan dengan menguasai prinsip dasar pemrograman dan teknologi web—HTML5, CSS3, JavaScript, dan PHP—selama studi rekayasa perangkat lunak di SMKN 1 Cibinong. Membangun alur kerja kontrol versi terstruktur dengan Git dan membuat aplikasi web interaktif pertama.",
          highlights: ["Semantic HTML & CSS", "JavaScript Fundamentals", "PHP & Relational DBs", "Git & GitHub"],
        },
        {
          number: "02",
          stage: "TRANSISI FULL-STACK",
          focus: "Arsitektur Komponen Modern & REST API",
          description:
            "Beralih dari website multi-halaman tradisional ke aplikasi satu halaman modern dan sistem backend modular. Mengadopsi React dan Tailwind CSS untuk rekayasa antarmuka skalabel, dipadukan dengan Express.js, Prisma ORM, dan MySQL/PostgreSQL untuk membangun backend RESTful tangguh berotentikasi JWT.",
          highlights: ["React & Component Systems", "Tailwind CSS", "Express & REST APIs", "Prisma ORM & PostgreSQL"],
        },
        {
          number: "03",
          stage: "PENGEMBANGAN SISTEM & PRODUK",
          focus: "Aplikasi Skalabel & Platform Inklusif",
          description:
            "Mengembangkan aplikasi end-to-end yang substansial termasuk platform penjelajahan aksesibilitas AksesKita, Sistem Manajemen Proyek full-stack, dan marketplace e-commerce Food. Berfokus pada manajemen state yang andal, desain skema terstruktur, validasi formulir, dan ergonomi antarmuka yang aksesibel.",
          highlights: ["AksesKita Platform", "Project Management System", "Food Marketplace", "Accessibility (a11y)"],
        },
        {
          number: "04",
          stage: "ARAH PENGEMBANGAN SAAT INI",
          focus: "TypeScript, Arsitektur & Rekayasa Produk",
          description:
            "Terus memperdalam standar rekayasa melalui adopsi TypeScript di seluruh aplikasi full-stack, pola arsitektur backend yang skalabel, optimalisasi performa frontend, serta penyempurnaan kualitas antarmuka.",
          highlights: ["TypeScript Adoption", "Scalable System Architecture", "Performance Optimization", "Clean Code & Testing"],
        },
      ],
    },

    // Tech Stack
    stack: {
      sectionTag: "04 / TEKNOLOGI",
      heading: "TEKNOLOGI YANG SAYA GUNAKAN",
      intro: "Kumpulan teknologi praktis untuk merancang, membangun, dan menerapkan aplikasi web modern dari antarmuka hingga basis data.",
      coreTech: "Teknologi Utama",
      categories: {
        frontend: {
          title: "FRONTEND",
          badge: "// 01",
          description: "Arsitektur komponen modern, antarmuka pengguna yang dinamis, dan sistem client ber-tipe.",
        },
        backend: {
          title: "BACKEND",
          badge: "// 02",
          description: "Layanan RESTful skalabel, middleware server, validasi skema, dan autentikasi.",
        },
        database: {
          title: "DATABASE",
          badge: "// 03",
          description: "Skema database relasional, normalisasi, optimasi kueri, dan migrasi.",
        },
        tools: {
          title: "TOOLS & WORKFLOW",
          badge: "// 04",
          description: "Kontrol versi, alur pengujian API, lingkungan pengembangan, dan alat deployment.",
        },
      },
    },

    // Certificates
    certificates: {
      sectionTag: "05 / SERTIFIKAT",
      subTag: "KREDENSIAL",
      heading: "SERTIFIKASI TEKNIS",
      intro: "Pelatihan kejuruan terverifikasi, kredensial magang praktis, dan pencapaian kompetisi pengembangan perangkat lunak.",
      previewFull: "LIHAT LENGKAP",
      viewCert: "LIHAT SERTIFIKAT",
      verifyCred: "VERIFIKASI KREDENSIAL",
      archivalCopy: "SALINAN ARSIP",
      inspectAria: "Periksa sertifikat:",
      modalClose: "TUTUP / ESC",
      modalCloseAria: "Tutup pratinjau sertifikat",
      modalCategory: "Kategori:",
      modalDismiss: "Tekan ESC atau klik di luar untuk menutup",
      categories: {
        "PROFESSIONAL INTERNSHIP": "MAGANG PROFESIONAL",
        "COMPETITION": "KOMPETISI",
        "VOCATIONAL TRAINING": "PELATIHAN KEJURUAN",
        "TECHNICAL TRAINING": "PELATIHAN TEKNIS",
      },
    },

    // Education / Academic Background
    education: {
      sectionTag: "06 / PENDIDIKAN",
      subTag: "LATAR BELAKANG AKADEMIK",
      heading: "PENDIDIKAN FORMAL",
      intro: "Kurikulum rekayasa perangkat lunak dasar yang menekankan pemrograman praktis, arsitektur sistem, dan standar pengembangan modern.",
      currentProgram: "Program Saat Ini",
      schoolLevel: "Sekolah Menengah Kejuruan (SMK)",
      major: "Rekayasa Perangkat Lunak (RPL)",
      timelineLabel: "Periode",
      timelineValue: "Juli 2023 — Juni 2026 (Perkiraan)",
      campusLabel: "Lokasi Kampus",
      campusValue: "Cibinong, Kabupaten Bogor, Jawa Barat, Indonesia",
      statusLabel: "Status",
      statusValue: "Sedang Menempuh · Tahun Terakhir",
      note: "Kurikulum ini dilengkapi dengan pengerjaan proyek produksi aktif, pengalaman magang frontend profesional, dan pengembangan perangkat lunak full-stack independen.",
      badgeVocational: "SMK / KEJURUAN",
      badgeCurriculum: "KURIKULUM NASIONAL INDONESIA",
      institution: "SMKN 1 Cibinong",
      overview: "Kurikulum rekayasa kejuruan formal tiga tahun yang memadukan konsep ilmu komputer dasar dengan pengembangan perangkat lunak dan aplikasi web praktis secara intensif.",
      competenciesHeader: "Kompetensi Inti & Pilar Akademik",
      competencies: [
        {
          title: "Sistem Web & Arsitektur",
          desc: "Membangun aplikasi client-server terstruktur, antarmuka responsif, dan integrasi RESTful API.",
        },
        {
          title: "Desain Database Relasional",
          desc: "Desain skema, normalisasi tabel, kueri SQL, dan pemodelan data ORM dengan MySQL dan PostgreSQL.",
        },
        {
          title: "Dasar Pemrograman",
          desc: "Pemrograman berorientasi objek (OOP), struktur data, algoritma, dan desain kode modular.",
        },
        {
          title: "Alur Kerja Rekayasa Perangkat Lunak",
          desc: "Kontrol versi terdistribusi dengan Git/GitHub, tinjauan kode kolaboratif, dan dokumentasi terstruktur.",
        },
      ],
      scopeLabel: "Cakupan Kurikulum:",
      scopeTags: [
        "Rekayasa Perangkat Lunak",
        "Pengembangan Web",
        "Arsitektur Database",
        "OOP & Algoritma",
        "Desain API",
        "Git / Kontrol Versi",
      ],
    },

    // Contact
    contact: {
      sectionTag: "07 / KONTAK",
      subTag: "HUBUNGI SAYA",
      heading: "MARI MEMBANGUN SESUATU YANG BERMANFAAT",
      intro: "Memiliki ide proyek, peluang kerja, atau rencana kolaborasi? Silakan kirim pesan langsung atau terhubung melalui saluran saya.",
      formBadge: "Kirim Langsung",
      formTitle: "Kirim Pesan",
      requiredHint: "* Wajib diisi",
      nameLabel: "Nama Anda",
      namePlaceholder: "mis. Alex Morgan",
      emailLabel: "Email Anda",
      emailPlaceholder: "mis. alex@example.com",
      subjectLabel: "Subjek",
      subjectOptional: "(opsional)",
      subjectPlaceholder: "mis. Tanya proyek / Kolaborasi full-stack",
      messageLabel: "Pesan",
      messagePlaceholder: "Ceritakan tentang proyek, jadwal, atau ide Anda...",
      submitBtn: "KIRIM PESAN",
      submittingBtn: "MENGIRIM PESAN...",
      successTitle: "Pesan berhasil dikirim!",
      successBody: "Terima kasih telah menghubungi. Saya telah menerima pesan Anda dan akan segera membalas.",
      errorTitle: "Tidak dapat mengirim pesan otomatis",
      errorBody: "Silakan kirim email langsung ke",
      toastSuccess: "Pesan berhasil terkirim! 🎉",
      toastError: "Gagal mengirim pesan. Silakan hubungi langsung lewat email.",
      toastOffline: "Layanan email sedang offline. Silakan kirim ke ighifarii05@gmail.com secara langsung.",
      toastCopied: "Email disalin ke papan klip!",
      reachBadge: "KONTAK LANGSUNG",
      availableBadge: "SIAP BEKERJA",
      inquiriesTitle: "Pertanyaan & Kerjasama",
      inquiriesDesc: "Untuk peluang kontrak, proyek lepas, posisi software engineer, atau sekadar berdiskusi santai seputar programming.",
      copyEmailTitle: "Salin alamat email",
      location: "Bogor, Indonesia",
      timezone: "UTC+7 (WIB)",
      profilesHeader: "Profil & Jaringan Terverifikasi",
      connectAction: "HUBUNGI",
      channels: {
        github: "Repositori proyek, kode publik & kontribusi",
        linkedin: "Jaringan profesional, latar belakang karir & kredensial",
        instagram: "Aktivitas pribadi, eksperimen desain & kabar terbaru",
        discord: "Obrolan dan kolaborasi developer secara real-time",
        tiktok: "Klip pemrograman singkat dan konten kreatif",
      },
      validation: {
        nameMin: "Nama wajib diisi minimal 2 karakter.",
        emailValid: "Harap masukkan alamat email yang valid.",
        messageMin: "Pesan wajib diisi minimal 10 karakter.",
      },
    },

    // Footer
    footer: {
      role: "Web Developer · Software Engineer",
      backToTop: "KEMBALI KE ATAS",
      backToTopAria: "Kembali ke bagian atas halaman",
      creditsText: "Dibuat dengan",
      copyright: "Semua hak dilindungi undang-undang.",
      updatedLabel: "DIPERBARUI",
      clickToUpdate: "Klik untuk melihat/mengubah tanggal pembaruan",
      editDateAria: "Ubah tanggal pembaruan terakhir",
    },

    // Sound / Audio Player
    sound: {
      nowPlaying: "SEDANG DIPUTAR",
      openPlayer: "Buka pemutar musik",
      closePlayer: "Tutup pemutar musik",
      playMusic: "Putar musik",
      pauseMusic: "Jeda musik",
      prevTrack: "Lagu sebelumnya",
      nextTrack: "Lagu berikutnya",
      seekTrack: "Atur posisi lagu",
    },
  },

  en: {
    // Navbar
    nav: {
      work: "WORK",
      about: "ABOUT",
      journey: "JOURNEY",
      stack: "STACK",
      contact: "CONTACT",
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      switchLangToEn: "Switch to English",
      switchLangToId: "Switch to Indonesian",
      langGroup: "Language selection",
    },

    // Hero / Profile
    hero: {
      available: "AVAILABLE FOR WORK",
      role: "WEB DEVELOPER / SOFTWARE ENGINEER",
      valueProp: "I build modern web applications with thoughtful interfaces and reliable systems.",
      exploreWork: "EXPLORE WORK",
      githubCta: "GITHUB",
      scroll: "SCROLL",
      scrollAria: "Scroll down to explore work",
      githubAria: "GitHub Profile",
      linkedinAria: "LinkedIn Profile",
    },

    // Projects
    projects: {
      sectionTag: "01 / SELECTED WORK",
      heading: "SELECTED PROJECTS",
      intro: "A curated selection of applications and systems I've designed and built.",
      sourceCode: "SOURCE CODE",
      liveDemo: "LIVE DEMO",
      sourceCodeAria: "View source code on GitHub",
      liveDemoAria: "Open live demo",
      archiveTag: "02 / ARCHIVE",
      archiveHeading: "OTHER PROJECTS",
      archiveIntro: "Selected earlier experiments, educational web games, and digital management tools.",
      githubRepo: "GitHub Repository",
      liveDeployment: "Live Deployment",
    },

    // About
    about: {
      sectionTag: "02 / ABOUT",
      heading: "ABOUT ME",
      statement: "I build web applications that balance intuitive interfaces with reliable software engineering.",
      metaRoleLabel: "ROLE",
      metaRoleValue: "Web Developer / Software Engineer",
      metaLocationLabel: "LOCATION",
      metaLocationValue: "Bogor / Jakarta, Indonesia",
      metaStatusLabel: "STATUS",
      metaStatusValue: "Available for Projects",
      p1: "I'm a web developer focused on building practical, dependable web applications with React and modern backend technologies. I enjoy turning product ideas into structured interfaces, maintainable system architectures, and reliable user experiences.",
      p2: "My development foundation was established through hands-on software engineering education and strengthened by building end-to-end full-stack projects—including accessibility platforms, project management tools, and e-commerce applications.",
      p3: "I value clean code organization, predictable state management, and clear UI ergonomics. I believe software should not only look refined but also perform smoothly and remain maintainable over time.",
      focusHeader: "CURRENT FOCUS & EXPERTISE",
      focusAreas: [
        {
          title: "Frontend Engineering",
          description: "Building responsive, accessible web interfaces using React, modern JavaScript/TypeScript, and scalable component systems.",
        },
        {
          title: "Full-Stack Architecture",
          description: "Developing end-to-end applications with Node.js, Express, RESTful APIs, and Prisma ORM backed by relational databases.",
        },
        {
          title: "UI Craft & Accessibility",
          description: "Crafting thoughtful user experiences with semantic HTML, Tailwind CSS, fluid responsive typography, and WCAG accessibility awareness.",
        },
        {
          title: "Systems & Data Modeling",
          description: "Designing structured schema models and queries using PostgreSQL and MySQL with secure authentication and CRUD patterns.",
        },
      ],
    },

    // Journey
    journey: {
      sectionTag: "03 / JOURNEY",
      heading: "DEVELOPMENT JOURNEY",
      intro: "A chronological progression from core fundamentals to full-stack application development.",
      milestones: [
        {
          number: "01",
          stage: "FOUNDATION",
          focus: "Vocational Software Engineering & Core Web",
          description:
            "Started the development path by mastering fundamental programming principles and web technologies—HTML5, CSS3, JavaScript, and PHP—during vocational software engineering studies at SMKN 1 Cibinong. Established structured version control workflows with Git and built initial interactive web applications.",
          highlights: ["Semantic HTML & CSS", "JavaScript Fundamentals", "PHP & Relational DBs", "Git & GitHub"],
        },
        {
          number: "02",
          stage: "FULL-STACK TRANSITION",
          focus: "Modern Component Architecture & REST APIs",
          description:
            "Advanced from traditional multi-page sites into modern single-page applications and modular backend systems. Adopted React and Tailwind CSS for scalable UI engineering, paired with Express.js, Prisma ORM, and MySQL/PostgreSQL to build robust RESTful backends with JWT authentication.",
          highlights: ["React & Component Systems", "Tailwind CSS", "Express & REST APIs", "Prisma ORM & PostgreSQL"],
        },
        {
          number: "03",
          stage: "SYSTEM & PRODUCT DEVELOPMENT",
          focus: "Scalable Applications & Inclusive Platforms",
          description:
            "Engineered substantial, end-to-end applications including the AksesKita accessibility discovery platform, a full-stack Project Management System, and the Food e-commerce marketplace. Focused on reliable state management, structured schema design, form validation, and accessible UI ergonomics.",
          highlights: ["AksesKita Platform", "Project Management System", "Food Marketplace", "Accessibility (a11y)"],
        },
        {
          number: "04",
          stage: "CURRENT DIRECTION",
          focus: "TypeScript, Architecture & Product Engineering",
          description:
            "Continuing to advance engineering rigor through TypeScript adoption across full-stack applications, scalable backend architectural patterns, frontend performance optimization, and refined interface craftsmanship.",
          highlights: ["TypeScript Adoption", "Scalable System Architecture", "Performance Optimization", "Clean Code & Testing"],
        },
      ],
    },

    // Tech Stack
    stack: {
      sectionTag: "04 / TECH STACK",
      heading: "TOOLS I WORK WITH",
      intro: "A practical stack for designing, building, and deploying modern web applications from interface to database.",
      coreTech: "Core Technology",
      categories: {
        frontend: {
          title: "FRONTEND",
          badge: "// 01",
          description: "Modern component architectures, fluid user interfaces, and typed client systems.",
        },
        backend: {
          title: "BACKEND",
          badge: "// 02",
          description: "Scalable RESTful services, server middleware, schema validation, and authentication.",
        },
        database: {
          title: "DATABASE",
          badge: "// 03",
          description: "Relational database schemas, normalization, query optimizations, and migrations.",
        },
        tools: {
          title: "TOOLS & WORKFLOW",
          badge: "// 04",
          description: "Version control, API testing workflows, developer environments, and deployment tooling.",
        },
      },
    },

    // Certificates
    certificates: {
      sectionTag: "05 / CERTIFICATES",
      subTag: "CREDENTIALS",
      heading: "TECHNICAL CERTIFICATIONS",
      intro: "Verified vocational training, practical internship credentials, and competitive software development achievements.",
      previewFull: "PREVIEW FULL",
      viewCert: "VIEW CERTIFICATE",
      verifyCred: "VERIFY CREDENTIAL",
      archivalCopy: "ARCHIVAL COPY",
      inspectAria: "Inspect certificate:",
      modalClose: "ESC / CLOSE",
      modalCloseAria: "Close certificate preview",
      modalCategory: "Category:",
      modalDismiss: "Press ESC or click outside to dismiss",
      categories: {
        "PROFESSIONAL INTERNSHIP": "PROFESSIONAL INTERNSHIP",
        "COMPETITION": "COMPETITION",
        "VOCATIONAL TRAINING": "VOCATIONAL TRAINING",
        "TECHNICAL TRAINING": "TECHNICAL TRAINING",
      },
    },

    // Education / Academic Background
    education: {
      sectionTag: "06 / EDUCATION",
      subTag: "ACADEMIC BACKGROUND",
      heading: "FORMAL EDUCATION",
      intro: "Foundational software engineering curriculum emphasizing practical programming, system architecture, and modern development standards.",
      currentProgram: "Current Program",
      schoolLevel: "Vocational High School",
      major: "Software Engineering (RPL)",
      timelineLabel: "Timeline",
      timelineValue: "July 2023 — June 2026 (Expected)",
      campusLabel: "Campus Location",
      campusValue: "Cibinong, Bogor Regency, West Java, Indonesia",
      statusLabel: "Status",
      statusValue: "Currently Enrolled · Senior Year",
      note: "Curriculum is complemented by active production work, professional frontend internship experience, and independent full-stack software development.",
      badgeVocational: "SMK / VOCATIONAL",
      badgeCurriculum: "INDONESIAN NATIONAL CURRICULUM",
      institution: "SMKN 1 Cibinong",
      overview: "Formal three-year vocational engineering curriculum combining fundamental computer science concepts with intensive practical software and web application development.",
      competenciesHeader: "Core Competencies & Academic Pillars",
      competencies: [
        {
          title: "Web Systems & Architecture",
          desc: "Building structured client-server applications, responsive interfaces, and RESTful API integration.",
        },
        {
          title: "Relational Database Design",
          desc: "Schema design, table normalization, SQL queries, and ORM data modeling with MySQL and PostgreSQL.",
        },
        {
          title: "Programming Fundamentals",
          desc: "Object-oriented programming, data structures, algorithms, and modular code design.",
        },
        {
          title: "Engineering Workflows",
          desc: "Distributed version control with Git/GitHub, collaborative code review, and structured documentation.",
        },
      ],
      scopeLabel: "Curriculum Scope:",
      scopeTags: [
        "Software Engineering",
        "Web Development",
        "Database Architecture",
        "OOP & Algorithms",
        "API Design",
        "Git / Version Control",
      ],
    },

    // Contact
    contact: {
      sectionTag: "07 / CONTACT",
      subTag: "GET IN TOUCH",
      heading: "LET'S BUILD SOMETHING USEFUL",
      intro: "Have a project, opportunity, or collaboration in mind? Feel free to send a message directly or connect via my channels.",
      formBadge: "Direct Dispatch",
      formTitle: "Send a Message",
      requiredHint: "* Required fields",
      nameLabel: "Your Name",
      namePlaceholder: "e.g. Alex Morgan",
      emailLabel: "Your Email",
      emailPlaceholder: "e.g. alex@example.com",
      subjectLabel: "Subject",
      subjectOptional: "(optional)",
      subjectPlaceholder: "e.g. Project inquiry / Full-stack collaboration",
      messageLabel: "Message",
      messagePlaceholder: "Tell me about your project, timeline, or idea...",
      submitBtn: "SEND MESSAGE",
      submittingBtn: "SENDING MESSAGE...",
      successTitle: "Message dispatched successfully!",
      successBody: "Thank you for reaching out. I have received your note and will reply as soon as possible.",
      errorTitle: "Unable to send via automated dispatch",
      errorBody: "Please feel free to email me directly at",
      toastSuccess: "Message delivered successfully! 🎉",
      toastError: "Failed to send message. Please reach out directly via email.",
      toastOffline: "Email service is temporarily offline. Please write to ighifarii05@gmail.com directly.",
      toastCopied: "Email copied to clipboard!",
      reachBadge: "DIRECT REACH",
      availableBadge: "AVAILABLE FOR HIRE",
      inquiriesTitle: "Direct Inquiries",
      inquiriesDesc: "For contract inquiries, freelance work, software roles, or casual developer chats.",
      copyEmailTitle: "Copy email address",
      location: "Bogor, Indonesia",
      timezone: "UTC+7 (WIB)",
      profilesHeader: "Verified Profiles & Networks",
      connectAction: "CONNECT",
      channels: {
        github: "Public code, project repositories & contributions",
        linkedin: "Professional network, career background & credentials",
        instagram: "Personal activities, design experiments & updates",
        discord: "Real-time developer chat and collaboration",
        tiktok: "Short-form coding clips and creative uploads",
      },
      validation: {
        nameMin: "Name must be at least 2 characters.",
        emailValid: "Please enter a valid email address.",
        messageMin: "Message must be at least 10 characters.",
      },
    },

    // Footer
    footer: {
      role: "Web Developer · Software Engineer",
      backToTop: "BACK TO TOP",
      backToTopAria: "Scroll back to top of the page",
      creditsText: "Engineered with",
      copyright: "All rights reserved.",
      updatedLabel: "UPDATED",
      clickToUpdate: "Click to view/change update date",
      editDateAria: "Edit last updated date",
    },

    // Sound / Audio Player
    sound: {
      nowPlaying: "NOW PLAYING",
      openPlayer: "Open music player",
      closePlayer: "Close music player",
      playMusic: "Play music",
      pauseMusic: "Pause music",
      prevTrack: "Previous track",
      nextTrack: "Next track",
      seekTrack: "Seek track position",
    },
  },
};
