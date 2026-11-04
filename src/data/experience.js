/**
 * Professional work experience data.
 * All entries verified against local repository assets, official internship certificate
 * (PT. AMA Salam Indonesia), and verifiable project contributions.
 */

export const experiences = [
  {
    id: 'ama-salam',
    badge: '// 01',
    role: {
      id: 'Frontend Developer Intern',
      en: 'Frontend Developer Intern',
    },
    company: 'PT. AMA Salam Indonesia',
    companyShort: 'Ama Salam Foundation',
    location: {
      id: 'Bogor, Jawa Barat, Indonesia',
      en: 'Bogor, West Java, Indonesia',
    },
    period: {
      id: 'Oktober 2025 – Februari 2026',
      en: 'October 2025 – February 2026',
    },
    duration: {
      id: '5 Bulan',
      en: '5 Months',
    },
    type: {
      id: 'Magang Industri',
      en: 'Industrial Internship',
    },
    description: {
      id: 'Berkontribusi sebagai Frontend Developer Intern di Ama Salam Foundation, terlibat dalam pengembangan dan pemeliharaan antarmuka sistem informasi berbasis web guna mendukung operasional internal dan layanan pengguna yayasan.',
      en: 'Contributed as a Frontend Developer Intern at Ama Salam Foundation, involved in developing and maintaining web-based information system interfaces to support internal operations and foundation user services.',
    },
    responsibilities: {
      id: [
        'Mengembangkan antarmuka Project Management System berbasis web untuk pemantauan progres dan alur kerja tim yayasan.',
        'Membangun komponen antarmuka yang responsif, modular, dan terstruktur menggunakan React.js dan Tailwind CSS.',
        'Melakukan optimasi performa halaman web dan aksesibilitas antarmuka berdasarkan audit metrik Lighthouse.',
        'Berkolaborasi bersama tim pengembang dalam implementasi fitur antarmuka kanban dan integrasi layanan web.',
      ],
      en: [
        'Developed the web-based Project Management System interfaces for monitoring project progress and foundation workflows.',
        'Built responsive, modular, and structured UI components using React.js and Tailwind CSS.',
        'Optimized web page performance and interface accessibility based on Lighthouse audit metrics.',
        'Collaborated with the development team on kanban UI feature implementation and web workflow integration.',
      ],
    },
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'PostgreSQL',
      'Lighthouse / Web Vitals',
    ],
    projectRef: 'project-management',
    certificate: {
      title: 'Frontend Developer Internship Certificate',
      issuer: 'PT. AMA Salam Indonesia',
      period: '1 Okt 2025 – 27 Feb 2026',
      image: '/images/certificates/ama_salam.webp',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Performance Optimization'],
    },
  },
];
