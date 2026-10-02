import { motion } from 'framer-motion';
import { FiBookOpen, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const AcademicBackground = () => {
  const educationData = {
    institution: "SMKN 1 Cibinong",
    degree: "Vocational High School Diploma",
    major: "Software Engineering (Rekayasa Perangkat Lunak / RPL)",
    location: "Cibinong, Bogor Regency, West Java, Indonesia",
    period: "July 2023 — June 2026 (Expected)",
    status: "Currently Enrolled · Senior Year",
    overview:
      "Formal three-year vocational engineering curriculum combining fundamental computer science concepts with intensive practical software and web application development.",
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
    curriculumTags: [
      "Software Engineering",
      "Web Development",
      "Database Architecture",
      "OOP & Algorithms",
      "API Design",
      "Git / Version Control",
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* Section Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 md:mb-16"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
            06 / EDUCATION
          </span>
          <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
            ACADEMIC BACKGROUND
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] uppercase">
            FORMAL EDUCATION<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Foundational software engineering curriculum emphasizing practical programming, system architecture, and modern development standards.
          </p>
        </div>
      </motion.header>

      {/* Main Content: Quiet editorial split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Context & Timeline Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-5">
            <div>
              <span className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Current Program
              </span>
              <p className="font-grotesk font-bold text-lg text-[var(--text-primary)]">
                Vocational High School
              </p>
              <p className="font-mono text-xs text-[var(--accent)] mt-0.5 font-semibold">
                Software Engineering (RPL)
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3 font-mono text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2.5">
                <FiCalendar size={14} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Timeline</span>
                  <span className="text-[var(--text-primary)]">{educationData.period}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FiMapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Campus Location</span>
                  <span className="text-[var(--text-primary)]">{educationData.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FiBookOpen size={14} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Status</span>
                  <span className="text-[var(--accent)] font-semibold">{educationData.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Note */}
          <div className="p-5 border-l-2 border-[var(--accent)]/70 bg-[var(--surface-alt)]/60 rounded-r-lg">
            <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
              Curriculum is complemented by active production work, professional frontend internship experience, and independent full-stack software development.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Detailed Institution & Curriculum Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8 bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-lg p-6 sm:p-8 transition-colors space-y-6"
        >
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--surface-alt)] text-[var(--accent)] border border-[var(--border)]">
                  SMK / VOCATIONAL
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  INDONESIAN NATIONAL CURRICULUM
                </span>
              </div>
              <h3 className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
                {educationData.institution}
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--surface-alt)] px-3 py-1.5 rounded border border-[var(--border-subtle)] self-start sm:self-auto">
              2023 — 2026
            </span>
          </div>

          {/* Overview */}
          <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {educationData.overview}
          </p>

          {/* Curriculum Focus Areas */}
          <div className="space-y-3 pt-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Core Competencies & Academic Pillars
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {educationData.competencies.map((item) => (
                <div
                  key={item.title}
                  className="bg-[var(--surface-alt)] border border-[var(--border-subtle)] rounded-md p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <FiCheckCircle size={14} className="text-[var(--accent)] mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="font-grotesk font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                      {item.title}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed pl-5.5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Tags */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--text-muted)] mr-1">
              Curriculum Scope:
            </span>
            {educationData.curriculumTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--tag-bg)] border border-[var(--tag-border)] text-[var(--tag-text)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AcademicBackground;
