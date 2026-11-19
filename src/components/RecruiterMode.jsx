import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowLeft,
  FiDownload,
  FiMail,
  FiCopy,
  FiCheck,
  FiGithub,
  FiLinkedin,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiAward,
  FiExternalLink,
  FiShield,
  FiCheckCircle,
  FiLayers,
} from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink } from '../context/RouterContext';
import { profileData } from '../data/profile';
import { experiences } from '../data/experience';
import { educationMetadata } from '../data/education';
import { techCategoriesData } from '../data/skills';
import { selectedProjects } from '../data/projects';
import { directEmail } from '../data/contact';
import { RESUME_URL, RESUME_FILENAME, RESUME_AVAILABLE } from '../data/resume';
import { updateDocumentMetadata, generateRecruiterSchema } from '../utils/seo';
import { siteConfig } from '../config/site';

const RecruiterMode = () => {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Dynamic SEO metadata on route mount
  useEffect(() => {
    const isId = language === 'id';
    const title = isId
      ? `Mode Rekruter & Ringkasan Eksekutif | ${siteConfig.name}`
      : `Recruiter Mode & Executive Summary | ${siteConfig.name}`;
    const description = isId
      ? `Ringkasan profesional profil rekayasa perangkat lunak, riwayat pendidikan formal, pengalaman kerja terverifikasi (PT. AMA Salam Indonesia), keahlian teknis, dan proyek unggulan ${siteConfig.name}.`
      : `A concise professional overview of software engineering qualifications, formal education, verified work experience (PT. AMA Salam Indonesia), technical skills, and selected projects by ${siteConfig.name}.`;

    updateDocumentMetadata({
      title,
      description,
      canonicalPath: '/recruiter',
      ogTitle: title,
      ogDescription: description,
      ogImage: '/portfolio.png',
      schemaData: generateRecruiterSchema(),
    });
  }, [language]);

  const copyEmailToClipboard = () => {
    if (!navigator?.clipboard?.writeText) return;
    navigator.clipboard
      .writeText(directEmail)
      .then(() => {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      })
      .catch(() => {});
  };

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay, ease: easeCurve },
    };
  };

  const resolve = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
      return val[language] || val.id || val.en || '';
    }
    return val;
  };

  // Curate top 4 projects for executive scanability
  const showcasedProjects = selectedProjects.slice(0, 4);

  return (
    <div className="w-full min-h-screen text-[var(--text-primary)] pt-24 pb-20 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        {/* ==================================================
            1. TOP BAR: BREADCRUMB & STATUS BADGE
            ================================================== */}
        <motion.div {...getFadeMotion(0)} className="flex items-center justify-between">
          <RouterLink
            to="/"
            data-cursor-label="Back"
            className="cursor-target inline-flex items-center gap-2 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded py-1 px-1.5 -ml-1.5"
            aria-label={t('recruiter.backToPortfolio')}
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{t('recruiter.backToPortfolio')}</span>
          </RouterLink>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-emerald-400">
              {t('recruiter.status')}
            </span>
          </div>
        </motion.div>

        {/* ==================================================
            2. EXECUTIVE SUMMARY & PROFILE HEADER
            ================================================== */}
        <motion.header
          {...getFadeMotion(0.05)}
          className="p-6 sm:p-8 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] shadow-sm space-y-6"
        >
          {/* Header Row: Identity & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src={profileData.avatarImage}
                alt={profileData.fullName}
                width={72}
                height={72}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--border)] object-cover shrink-0 shadow-md"
                loading="eager"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)]">
                    {t('recruiter.subBadge')}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {profileData.lanyardCard.cardId}
                  </span>
                </div>
                <h1 className="font-grotesk font-black text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
                  {profileData.fullName}
                </h1>
                <p className="font-mono text-xs sm:text-sm text-[var(--accent)] uppercase font-semibold tracking-wider">
                  {t('recruiter.role')}
                </p>
              </div>
            </div>

            {/* Location & Relocation / Availability */}
            <div className="font-mono text-xs text-[var(--text-secondary)] space-y-1.5 self-start sm:self-auto sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-1.5">
                <FiMapPin size={13} className="text-[var(--accent)]" aria-hidden="true" />
                <span>{t('recruiter.locationValue')}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-[var(--text-muted)] text-[11px]">
                <FiBriefcase size={12} aria-hidden="true" />
                <span>Full-time / Contract / Internship</span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {RESUME_AVAILABLE && (
              <a
                href={RESUME_URL}
                download={RESUME_FILENAME}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="CV"
                aria-label={`${t('recruiter.downloadCvAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-grotesk font-bold text-xs tracking-wider uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <FiDownload size={14} aria-hidden="true" />
                <span>{t('recruiter.downloadCv')}</span>
                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
              </a>
            )}

            <a
              href={`mailto:${directEmail}`}
              data-cursor-label="Mail"
              className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--accent)] font-grotesk font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiMail size={14} aria-hidden="true" />
              <span>{t('recruiter.emailDirect')}</span>
            </a>

            <button
              type="button"
              onClick={copyEmailToClipboard}
              data-cursor-label="Copy"
              className="cursor-target inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              title={directEmail}
            >
              {copiedEmail ? (
                <>
                  <FiCheck size={13} className="text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400">{t('recruiter.copiedEmail')}</span>
                </>
              ) : (
                <>
                  <FiCopy size={13} aria-hidden="true" />
                  <span>{t('recruiter.copyEmail')}</span>
                </>
              )}
            </button>

            <a
              href={profileData.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="GitHub"
              className="cursor-target inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiGithub size={13} aria-hidden="true" />
              <span>GitHub</span>
              <FiExternalLink size={11} aria-hidden="true" />
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
            </a>

            <a
              href={profileData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="LinkedIn"
              className="cursor-target inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiLinkedin size={13} aria-hidden="true" />
              <span>LinkedIn</span>
              <FiExternalLink size={11} aria-hidden="true" />
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
            </a>
          </div>

          {/* Profile Narrative & Core Value Statement */}
          <div className="space-y-4 pt-2">
            <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {t('recruiter.profileSummaryText')}
            </p>

            {/* 3 Core Strengths Pillar Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              {(t('recruiter.strengths') || []).map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[var(--surface-alt)]/80 border border-[var(--border-subtle)] space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" aria-hidden="true" />
                    <h2 className="font-grotesk font-bold text-xs uppercase tracking-wide text-[var(--text-primary)]">
                      {s.title}
                    </h2>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        {/* ==================================================
            3. TWO-COLUMN GRID: EXPERIENCE & EDUCATION + SKILLS
            ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Verified Experience & Education */}
          <div className="lg:col-span-7 space-y-8">
            {/* Work Experience Section */}
            <motion.section {...getFadeMotion(0.1)} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                <FiBriefcase className="text-[var(--accent)]" size={16} aria-hidden="true" />
                <h2 className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('recruiter.experienceTitle')}
                </h2>
              </div>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <article
                    key={exp.id}
                    className="p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-4 hover:border-[var(--border)] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] uppercase">
                            {resolve(exp.type)}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">
                            {resolve(exp.duration)}
                          </span>
                        </div>
                        <h3 className="font-grotesk font-bold text-base sm:text-lg text-[var(--text-primary)] mt-1.5">
                          {resolve(exp.role)}
                        </h3>
                        <p className="font-mono text-xs text-[var(--accent)] font-semibold">
                          {exp.company}
                        </p>
                      </div>

                      <div className="font-mono text-xs text-[var(--text-muted)] sm:text-right shrink-0">
                        <span>{resolve(exp.period)}</span>
                      </div>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {resolve(exp.description)}
                    </p>

                    {/* Key contributions */}
                    <div className="space-y-1.5 pt-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block font-semibold">
                        {t('experience.responsibilitiesHeader')}
                      </span>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-none p-0 m-0 font-sans">
                        {(resolve(exp.responsibilities) || []).map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 leading-relaxed">
                            <FiCheckCircle size={13} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Badges & Certificate Action */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {exp.projectRef && (
                        <RouterLink
                          to={`/study-case/${exp.projectRef}`}
                          data-cursor-label="Study"
                          className="cursor-target font-mono text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>{t('recruiter.readCaseStudy')}</span>
                          <FiExternalLink size={11} aria-hidden="true" />
                        </RouterLink>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>

            {/* Formal Education Section */}
            <motion.section {...getFadeMotion(0.15)} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                <FiBookOpen className="text-[var(--accent)]" size={16} aria-hidden="true" />
                <h2 className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('recruiter.educationTitle')}
                </h2>
              </div>

              <div className="space-y-3">
                {/* Universitas Gunadarma */}
                <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)]">
                        {educationMetadata.gunadarma.institution}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] font-semibold">
                        {t('education.statusValue')}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[var(--accent)]">
                      {t('education.major')} · {t('education.faculty')}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                    {t('education.timelineValue')}
                  </span>
                </div>

                {/* SMKN 1 Cibinong */}
                <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)]">
                      {educationMetadata.smkn1Cibinong.institution}
                    </span>
                    <p className="font-mono text-xs text-[var(--text-secondary)]">
                      {t('education.cibinongMajor')}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                    {educationMetadata.smkn1Cibinong.period}
                  </span>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column (5 cols): Main Technical Competencies Matrix */}
          <div className="lg:col-span-5 space-y-4">
            <motion.section {...getFadeMotion(0.12)} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                <FiLayers className="text-[var(--accent)]" size={16} aria-hidden="true" />
                <h2 className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('recruiter.skillsTitle')}
                </h2>
              </div>

              <div className="p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-5">
                {techCategoriesData.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-semibold text-[var(--text-primary)] tracking-wide">
                        {category.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                        {category.badge}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill) => (
                        <span
                          key={skill.name}
                          className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${
                            skill.highlight
                              ? 'bg-[var(--surface-alt)] border border-[var(--accent)]/50 text-[var(--accent)] font-semibold'
                              : 'bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Additional Engineering Practices Note */}
                <div className="pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider block text-[var(--accent)] font-semibold">
                    Core Standards &amp; Principles
                  </span>
                  <p className="leading-relaxed">
                    Semantic HTML5 · WCAG 2.1 AA Accessibility · Responsive Layouts · RESTful API Conventions · Clean Git Commits.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* ==================================================
            4. SELECTED FEATURED PROJECTS
            ================================================== */}
        <motion.section {...getFadeMotion(0.2)} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <FiAward className="text-[var(--accent)]" size={16} aria-hidden="true" />
                <h2 className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('recruiter.projectsTitle')}
                </h2>
              </div>
              <p className="font-mono text-xs text-[var(--text-secondary)] mt-1">
                {t('recruiter.projectsSubtitle')}
              </p>
            </div>

            <RouterLink
              to="/study-case"
              data-cursor-label="Explore"
              className="cursor-target font-mono text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>{language === 'id' ? 'Lihat Semua Proyek' : 'View Full Catalog'}</span>
              <FiExternalLink size={12} aria-hidden="true" />
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {showcasedProjects.map((project) => {
              const isInternship = project.id === 'project-management';

              return (
                <article
                  key={project.id}
                  className="p-5 sm:p-6 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-wider uppercase">
                        {resolve(project.category)}
                      </span>
                      {isInternship && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 tracking-wider flex items-center gap-1">
                          <FiShield size={10} aria-hidden="true" />
                          <span>PT. AMA SALAM</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-grotesk font-bold text-lg sm:text-xl text-[var(--text-primary)]">
                      {project.title}
                    </h3>

                    {project.subtitle && (
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        {resolve(project.subtitle)}
                      </p>
                    )}

                    <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {resolve(project.description)}
                    </p>

                    {/* Internal Enterprise Confidentiality Notice */}
                    {isInternship && (
                      <div className="p-3 rounded bg-[var(--surface-alt)] border-l-2 border-l-blue-500 border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                        <span className="text-blue-400 font-semibold uppercase block">
                          {t('recruiter.internalBadge')}
                        </span>
                        <p>{t('recruiter.internalNote')}</p>
                      </div>
                    )}

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links Row */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                    <RouterLink
                      to={`/study-case/${project.id}`}
                      data-cursor-label="Study"
                      className="cursor-target inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent)] hover:underline"
                    >
                      <FiBookOpen size={12} aria-hidden="true" />
                      <span>{t('recruiter.readCaseStudy')}</span>
                    </RouterLink>

                    <div className="flex items-center gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="Code"
                          className="cursor-target inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-1"
                          title="GitHub Repository"
                        >
                          <FiGithub size={13} aria-hidden="true" />
                          <span>Code</span>
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}

                      {project.npm && (
                        <a
                          href={project.npm}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="npm"
                          className="cursor-target inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-1"
                          title="npm Package"
                        >
                          <SiNpm size={13} aria-hidden="true" />
                          <span>npm</span>
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}

                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="Live Demo"
                          className="cursor-target inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-1"
                          title="Live Demo"
                        >
                          <span>Live</span>
                          <FiExternalLink size={11} aria-hidden="true" />
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </motion.section>

        {/* ==================================================
            5. RECRUITER CTA & CONTACT SECTION
            ================================================== */}
        <motion.section
          {...getFadeMotion(0.25)}
          className="p-6 sm:p-8 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-center space-y-4"
        >
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)] uppercase tracking-tight">
              {t('recruiter.contactTitle')}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('recruiter.contactSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`mailto:${directEmail}`}
              data-cursor-label="Mail"
              className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-grotesk font-bold text-xs tracking-wider uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <FiMail size={15} aria-hidden="true" />
              <span>{t('recruiter.reachViaEmail')}</span>
            </a>

            {RESUME_AVAILABLE && (
              <a
                href={RESUME_URL}
                download={RESUME_FILENAME}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="CV"
                aria-label={`${t('recruiter.downloadCvAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--accent)] font-grotesk font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <FiDownload size={15} aria-hidden="true" />
                <span>{t('recruiter.downloadCv')}</span>
                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
              </a>
            )}

            <a
              href={profileData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="LinkedIn"
              className="cursor-target inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiLinkedin size={15} aria-hidden="true" />
              <span>LinkedIn</span>
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default RecruiterMode;
