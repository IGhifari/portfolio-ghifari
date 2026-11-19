/**
 * Server-Only Portfolio Knowledge Base Aggregator (STRICT KNOWLEDGE ONLY).
 *
 * Location: api/_lib/knowledge.js
 * IMPORTANT: This module is strictly for backend / serverless usage (Cloudflare Pages Functions / API)
 * and must NOT be imported into any frontend component.
 *
 * Every entry is normalized directly from the repository's canonical data modules
 * and contains the required metadata fields:
 * - id: Unique identifier for the knowledge entry
 * - category: One of the 9 canonical portfolio knowledge categories
 * - title: Bilingual title ({ id, en })
 * - content: Bilingual normalized content ({ id: { summary, data }, en: { summary, data } })
 * - source: Traceable origin file paths and section reference in the repository
 */

import { profileData } from '../../src/data/profile.js';
import { RESUME_URL, RESUME_FILENAME, RESUME_AVAILABLE } from '../../src/data/resume.js';
import { translations } from '../../src/data/translations.js';
import { selectedProjects, otherProjects } from '../../src/data/projects.js';
import { certificates } from '../../src/data/certificates.js';
import { experiences } from '../../src/data/experience.js';
import { techCategoriesData, marqueeTechnologies } from '../../src/data/skills.js';
import { directEmail, contactChannelsData } from '../../src/data/contact.js';
import { educationMetadata } from '../../src/data/education.js';

export const KNOWLEDGE_CATEGORIES = Object.freeze({
  IDENTITY_PROFILE: 'Identity & Profile',
  ABOUT: 'About',
  SKILLS_TECHNOLOGIES: 'Skills & Technologies',
  SELECTED_PROJECTS: 'Selected Projects',
  OTHER_PROJECTS: 'Other Projects',
  EDUCATION: 'Education',
  EXPERIENCE_CERTIFICATES: 'Experience & Certificates',
  DEVELOPMENT_JOURNEY: 'Development Journey',
  CONTACT: 'Contact',
});

const idText = translations.id;
const enText = translations.en;

/**
 * 1. IDENTITY & PROFILE
 */
const identityAndProfileEntries = [
  {
    id: 'identity-profile-main',
    category: KNOWLEDGE_CATEGORIES.IDENTITY_PROFILE,
    title: {
      id: `Profil & Identitas — ${profileData.fullName}`,
      en: `Profile & Identity — ${profileData.fullName}`,
    },
    content: {
      id: {
        summary: `${profileData.fullName} (${profileData.brandName}) adalah seorang ${idText.hero.role}. ${idText.hero.valueProp} Berbasis di ${profileData.lanyardCard.baseLocation} dengan status: ${idText.hero.available}. Fokus rekayasa: ${profileData.lanyardCard.engineeringFocus} (${profileData.lanyardCard.stackSummary}).`,
        data: {
          fullName: profileData.fullName,
          brandName: profileData.brandName,
          nameLines: profileData.nameLines,
          alternateNames: profileData.alternateNames,
          role: idText.hero.role,
          footerRole: idText.footer.role,
          valueProposition: idText.hero.valueProp,
          availabilityStatus: idText.hero.available,
          baseLocation: profileData.lanyardCard.baseLocation,
          avatarImage: profileData.avatarImage,
          socials: profileData.socials,
          lanyardCard: profileData.lanyardCard,
          resume: {
            filename: RESUME_FILENAME,
            url: RESUME_URL,
            available: RESUME_AVAILABLE,
          },
        },
      },
      en: {
        summary: `${profileData.fullName} (${profileData.brandName}) is a ${enText.hero.role}. ${enText.hero.valueProp} Based in ${profileData.lanyardCard.baseLocation} with status: ${enText.hero.available}. Engineering focus: ${profileData.lanyardCard.engineeringFocus} (${profileData.lanyardCard.stackSummary}).`,
        data: {
          fullName: profileData.fullName,
          brandName: profileData.brandName,
          nameLines: profileData.nameLines,
          alternateNames: profileData.alternateNames,
          role: enText.hero.role,
          footerRole: enText.footer.role,
          valueProposition: enText.hero.valueProp,
          availabilityStatus: enText.hero.available,
          baseLocation: profileData.lanyardCard.baseLocation,
          avatarImage: profileData.avatarImage,
          socials: profileData.socials,
          lanyardCard: profileData.lanyardCard,
          resume: {
            filename: RESUME_FILENAME,
            url: RESUME_URL,
            available: RESUME_AVAILABLE,
          },
        },
      },
    },
    source: {
      files: [
        'src/components/Profile.jsx',
        'src/data/profile.js',
        'src/data/translations.js',
        'src/data/resume.js',
        'src/utils/lanyardCardGenerator.js',
        'src/components/Footer.jsx',
        'index.html',
      ],
      sectionId: '#profile',
    },
  },
];

/**
 * 2. ABOUT
 */
const aboutEntries = [
  {
    id: 'about-biography',
    category: KNOWLEDGE_CATEGORIES.ABOUT,
    title: {
      id: `${idText.about.heading} — Ringkasan & Latar Belakang`,
      en: `${enText.about.heading} — Overview & Background`,
    },
    content: {
      id: {
        summary: `${idText.about.statement} ${idText.about.p1} ${idText.about.p2} ${idText.about.p3}`,
        data: {
          sectionTag: idText.about.sectionTag,
          heading: idText.about.heading,
          statement: idText.about.statement,
          metadata: {
            role: idText.about.metaRoleValue,
            location: idText.about.metaLocationValue,
            status: idText.about.metaStatusValue,
          },
          paragraphs: [idText.about.p1, idText.about.p2, idText.about.p3],
        },
      },
      en: {
        summary: `${enText.about.statement} ${enText.about.p1} ${enText.about.p2} ${enText.about.p3}`,
        data: {
          sectionTag: enText.about.sectionTag,
          heading: enText.about.heading,
          statement: enText.about.statement,
          metadata: {
            role: enText.about.metaRoleValue,
            location: enText.about.metaLocationValue,
            status: enText.about.metaStatusValue,
          },
          paragraphs: [enText.about.p1, enText.about.p2, enText.about.p3],
        },
      },
    },
    source: {
      files: ['src/components/About.jsx', 'src/data/translations.js'],
      sectionId: '#about',
    },
  },
  {
    id: 'about-focus-areas',
    category: KNOWLEDGE_CATEGORIES.ABOUT,
    title: {
      id: idText.about.focusHeader,
      en: enText.about.focusHeader,
    },
    content: {
      id: {
        summary: idText.about.focusAreas
          .map((area) => `${area.title}: ${area.description}`)
          .join(' | '),
        data: {
          header: idText.about.focusHeader,
          focusAreas: idText.about.focusAreas,
        },
      },
      en: {
        summary: enText.about.focusAreas
          .map((area) => `${area.title}: ${area.description}`)
          .join(' | '),
        data: {
          header: enText.about.focusHeader,
          focusAreas: enText.about.focusAreas,
        },
      },
    },
    source: {
      files: ['src/components/About.jsx', 'src/data/translations.js'],
      sectionId: '#about',
    },
  },
];

/**
 * 3. SKILLS & TECHNOLOGIES
 */
const skillsAndTechnologiesEntries = [
  {
    id: 'skills-overview',
    category: KNOWLEDGE_CATEGORIES.SKILLS_TECHNOLOGIES,
    title: {
      id: `${idText.stack.heading} — Ringkasan Teknologi`,
      en: `${enText.stack.heading} — Technology Stack Overview`,
    },
    content: {
      id: {
        summary: `${idText.stack.intro} Teknologi utama (Core Technologies): ${techCategoriesData
          .flatMap((c) => c.skills.filter((s) => s.highlight).map((s) => s.name))
          .join(', ')}. Daftar marquee: ${marqueeTechnologies.join(', ')}.`,
        data: {
          sectionTag: idText.stack.sectionTag,
          heading: idText.stack.heading,
          intro: idText.stack.intro,
          coreTechLabel: idText.stack.coreTech,
          coreTechnologies: techCategoriesData.flatMap((c) =>
            c.skills.filter((s) => s.highlight).map((s) => s.name)
          ),
          marqueeTechnologies,
        },
      },
      en: {
        summary: `${enText.stack.intro} Core Technologies: ${techCategoriesData
          .flatMap((c) => c.skills.filter((s) => s.highlight).map((s) => s.name))
          .join(', ')}. Marquee list: ${marqueeTechnologies.join(', ')}.`,
        data: {
          sectionTag: enText.stack.sectionTag,
          heading: enText.stack.heading,
          intro: enText.stack.intro,
          coreTechLabel: enText.stack.coreTech,
          coreTechnologies: techCategoriesData.flatMap((c) =>
            c.skills.filter((s) => s.highlight).map((s) => s.name)
          ),
          marqueeTechnologies,
        },
      },
    },
    source: {
      files: ['src/components/Skill.jsx', 'src/data/skills.js', 'src/data/translations.js'],
      sectionId: '#stack',
    },
  },
  ...techCategoriesData.map((cat) => {
    const idCatTrans = idText.stack.categories[cat.id] || {};
    const enCatTrans = enText.stack.categories[cat.id] || {};
    const allSkillNames = cat.skills.map((s) => s.name);
    const highlightedSkillNames = cat.skills.filter((s) => s.highlight).map((s) => s.name);

    return {
      id: `skills-category-${cat.id}`,
      category: KNOWLEDGE_CATEGORIES.SKILLS_TECHNOLOGIES,
      title: {
        id: `Kategori Teknologi: ${idCatTrans.title || cat.title} (${cat.badge})`,
        en: `Technology Category: ${enCatTrans.title || cat.title} (${cat.badge})`,
      },
      content: {
        id: {
          summary: `${idCatTrans.title || cat.title} (${cat.badge}): ${
            idCatTrans.description || cat.description
          } Daftar keahlian: ${allSkillNames.join(', ')}. Teknologi utama di kategori ini: ${
            highlightedSkillNames.join(', ') || '-'
          }.`,
          data: {
            categoryId: cat.id,
            badge: cat.badge,
            title: idCatTrans.title || cat.title,
            description: idCatTrans.description || cat.description,
            skills: cat.skills,
            highlightedSkills: highlightedSkillNames,
          },
        },
        en: {
          summary: `${enCatTrans.title || cat.title} (${cat.badge}): ${
            enCatTrans.description || cat.description
          } Skills: ${allSkillNames.join(', ')}. Core highlighted skills in this category: ${
            highlightedSkillNames.join(', ') || '-'
          }.`,
          data: {
            categoryId: cat.id,
            badge: cat.badge,
            title: enCatTrans.title || cat.title,
            description: enCatTrans.description || cat.description,
            skills: cat.skills,
            highlightedSkills: highlightedSkillNames,
          },
        },
      },
      source: {
        files: ['src/components/Skill.jsx', 'src/data/skills.js', 'src/data/translations.js'],
        sectionId: '#stack',
      },
    };
  }),
];

/**
 * Helper to normalize project objects from src/data/projects.js
 */
const normalizeProjectEntry = (project, categoryConstant, idPrefix) => ({
  id: `${idPrefix}-${project.id}`,
  category: categoryConstant,
  title: {
    id: `${project.title}${project.subtitle?.id ? ` — ${project.subtitle.id}` : ''}`,
    en: `${project.title}${project.subtitle?.en ? ` — ${project.subtitle.en}` : ''}`,
  },
  content: {
    id: {
      summary: [
        `${project.title} (${project.category.id}): ${project.description.id}`,
        project.details?.problem?.id ? `Permasalahan: ${project.details.problem.id}` : '',
        project.details?.solution?.id ? `Solusi: ${project.details.solution.id}` : '',
        project.details?.architecture?.id ? `Arsitektur: ${project.details.architecture.id}` : '',
        project.details?.features?.id
          ? `Fitur Utama: ${project.details.features.id.join('; ')}.`
          : '',
        project.details?.contribution?.id
          ? `Peran & Kontribusi: ${project.details.contribution.id}`
          : '',
        `Teknologi: ${project.tags.join(', ')}.`,
        `GitHub: ${project.github || 'Tidak tersedia (repositori internal/lokal)'}.`,
        project.npm ? `npm: ${project.npm}.` : '',
        project.live ? `Live Demo: ${project.live}` : (project.npm ? '' : `Live Demo: ${idText.projects.modal.noLiveNote}`),
      ]
        .filter(Boolean)
        .join(' '),
      data: {
        id: project.id,
        number: project.number || null,
        categoryKey: project.categoryKey,
        categoryLabel: project.category.id,
        title: project.title,
        subtitle: project.subtitle?.id || null,
        description: project.description.id,
        details: {
          problem: project.details?.problem?.id || null,
          solution: project.details?.solution?.id || null,
          architecture: project.details?.architecture?.id || null,
          features: project.details?.features?.id || [],
          contribution: project.details?.contribution?.id || null,
        },
        tags: project.tags,
        image: project.image,
        github: project.github,
        npm: project.npm || null,
        live: project.live,
      },
    },
    en: {
      summary: [
        `${project.title} (${project.category.en}): ${project.description.en}`,
        project.details?.problem?.en ? `Problem: ${project.details.problem.en}` : '',
        project.details?.solution?.en ? `Solution: ${project.details.solution.en}` : '',
        project.details?.architecture?.en ? `Architecture: ${project.details.architecture.en}` : '',
        project.details?.features?.en
          ? `Key Features: ${project.details.features.en.join('; ')}.`
          : '',
        project.details?.contribution?.en
          ? `Role & Contribution: ${project.details.contribution.en}`
          : '',
        `Technologies: ${project.tags.join(', ')}.`,
        `GitHub: ${project.github || 'Unavailable (internal/local repository)'}.`,
        project.npm ? `npm: ${project.npm}.` : '',
        project.live ? `Live Demo: ${project.live}` : (project.npm ? '' : `Live Demo: ${enText.projects.modal.noLiveNote}`),
      ]
        .filter(Boolean)
        .join(' '),
      data: {
        id: project.id,
        number: project.number || null,
        categoryKey: project.categoryKey,
        categoryLabel: project.category.en,
        title: project.title,
        subtitle: project.subtitle?.en || null,
        description: project.description.en,
        details: {
          problem: project.details?.problem?.en || null,
          solution: project.details?.solution?.en || null,
          architecture: project.details?.architecture?.en || null,
          features: project.details?.features?.en || [],
          contribution: project.details?.contribution?.en || null,
        },
        tags: project.tags,
        image: project.image,
        github: project.github,
        npm: project.npm || null,
        live: project.live,
      },
    },
  },
  source: {
    files: ['src/data/projects.js', 'src/components/Project.jsx', 'src/data/translations.js'],
    sectionId: '#projects',
  },
});

/**
 * 4. SELECTED PROJECTS
 */
const selectedProjectEntries = selectedProjects.map((project) =>
  normalizeProjectEntry(project, KNOWLEDGE_CATEGORIES.SELECTED_PROJECTS, 'project-selected')
);

/**
 * 5. OTHER PROJECTS
 */
const otherProjectEntries = otherProjects.map((project) =>
  normalizeProjectEntry(project, KNOWLEDGE_CATEGORIES.OTHER_PROJECTS, 'project-other')
);

/**
 * 6. EDUCATION
 */
const educationEntries = [
  {
    id: 'education-universitas-gunadarma',
    category: KNOWLEDGE_CATEGORIES.EDUCATION,
    title: {
      id: `${idText.education.gunadarma.institution} — ${idText.education.gunadarma.major}`,
      en: `${enText.education.gunadarma.institution} — ${enText.education.gunadarma.major}`,
    },
    content: {
      id: {
        summary: `${idText.education.gunadarma.institution} (${idText.education.gunadarma.badgeDegree}): Jurusan ${idText.education.gunadarma.major}, ${idText.education.gunadarma.faculty}. Status: ${idText.education.statusValue} (${idText.education.timelineValue}), Lokasi Kampus: ${idText.education.campusValue}. ${idText.education.gunadarma.description} Catatan: ${idText.education.note}`,
        data: {
          institution: idText.education.gunadarma.institution,
          badgeDegree: idText.education.gunadarma.badgeDegree,
          major: idText.education.gunadarma.major,
          faculty: idText.education.gunadarma.faculty,
          timeline: idText.education.timelineValue,
          status: idText.education.statusValue,
          campusLocation: idText.education.campusValue,
          description: idText.education.gunadarma.description,
          editorialNote: idText.education.note,
          isCurrent: educationMetadata.gunadarma.isCurrent,
        },
      },
      en: {
        summary: `${enText.education.gunadarma.institution} (${enText.education.gunadarma.badgeDegree}): Major in ${enText.education.gunadarma.major}, ${enText.education.gunadarma.faculty}. Status: ${enText.education.statusValue} (${enText.education.timelineValue}), Campus Location: ${enText.education.campusValue}. ${enText.education.gunadarma.description} Note: ${enText.education.note}`,
        data: {
          institution: enText.education.gunadarma.institution,
          badgeDegree: enText.education.gunadarma.badgeDegree,
          major: enText.education.gunadarma.major,
          faculty: enText.education.gunadarma.faculty,
          timeline: enText.education.timelineValue,
          status: enText.education.statusValue,
          campusLocation: enText.education.campusValue,
          description: enText.education.gunadarma.description,
          editorialNote: enText.education.note,
          isCurrent: educationMetadata.gunadarma.isCurrent,
        },
      },
    },
    source: {
      files: [
        'src/components/AcademicBackground.jsx',
        'src/data/education.js',
        'src/data/translations.js',
      ],
      sectionId: '#education',
    },
  },
  {
    id: 'education-smkn-1-cibinong',
    category: KNOWLEDGE_CATEGORIES.EDUCATION,
    title: {
      id: `${idText.education.institution} — ${idText.education.cibinongMajor}`,
      en: `${enText.education.institution} — ${enText.education.cibinongMajor}`,
    },
    content: {
      id: {
        summary: `${idText.education.institution} (${idText.education.badgeVocational}, ${idText.education.badgeCurriculum}): Jurusan ${idText.education.cibinongMajor}, Periode ${educationMetadata.smkn1Cibinong.period}. ${idText.education.overview} Kompetensi Inti: ${idText.education.competencies
          .map((c) => `${c.title} (${c.desc})`)
          .join('; ')}. Cakupan Kurikulum: ${idText.education.scopeTags.join(', ')}.`,
        data: {
          institution: idText.education.institution,
          badgeVocational: idText.education.badgeVocational,
          badgeCurriculum: idText.education.badgeCurriculum,
          major: idText.education.cibinongMajor,
          period: educationMetadata.smkn1Cibinong.period,
          overview: idText.education.overview,
          competenciesHeader: idText.education.competenciesHeader,
          competencies: idText.education.competencies,
          scopeTags: idText.education.scopeTags,
          isCurrent: educationMetadata.smkn1Cibinong.isCurrent,
        },
      },
      en: {
        summary: `${enText.education.institution} (${enText.education.badgeVocational}, ${enText.education.badgeCurriculum}): Major in ${enText.education.cibinongMajor}, Period ${educationMetadata.smkn1Cibinong.period}. ${enText.education.overview} Core Competencies: ${enText.education.competencies
          .map((c) => `${c.title} (${c.desc})`)
          .join('; ')}. Curriculum Scope: ${enText.education.scopeTags.join(', ')}.`,
        data: {
          institution: enText.education.institution,
          badgeVocational: enText.education.badgeVocational,
          badgeCurriculum: enText.education.badgeCurriculum,
          major: enText.education.cibinongMajor,
          period: educationMetadata.smkn1Cibinong.period,
          overview: enText.education.overview,
          competenciesHeader: enText.education.competenciesHeader,
          competencies: enText.education.competencies,
          scopeTags: enText.education.scopeTags,
          isCurrent: educationMetadata.smkn1Cibinong.isCurrent,
        },
      },
    },
    source: {
      files: [
        'src/components/AcademicBackground.jsx',
        'src/data/education.js',
        'src/data/translations.js',
      ],
      sectionId: '#education',
    },
  },
];

/**
 * 7. EXPERIENCE & CERTIFICATES
 */
const workExperienceEntries = experiences.map((exp) => ({
  id: `work-experience-${exp.id}`,
  category: KNOWLEDGE_CATEGORIES.EXPERIENCE_CERTIFICATES,
  title: {
    id: `${exp.role.id} — ${exp.company}`,
    en: `${exp.role.en} — ${exp.company}`,
  },
  content: {
    id: {
      summary: `${exp.role.id} di ${exp.company} (${exp.period.id}, ${exp.type.id}). ${exp.description.id} Tanggung jawab teknis: ${exp.responsibilities.id.join(' ')} Teknologi: ${exp.technologies.join(', ')}.`,
      data: exp,
    },
    en: {
      summary: `${exp.role.en} at ${exp.company} (${exp.period.en}, ${exp.type.en}). ${exp.description.en} Key technical responsibilities: ${exp.responsibilities.en.join(' ')} Technologies: ${exp.technologies.join(', ')}.`,
      data: exp,
    },
  },
  source: {
    files: ['src/components/Experience.jsx', 'src/data/experience.js'],
    sectionId: '#experience',
  },
}));

const experienceAndCertificateEntries = [
  ...workExperienceEntries,
  ...certificates.map((cert) => {
  const idCategoryLabel = idText.certificates.categories[cert.category] || cert.category;
  const enCategoryLabel = enText.certificates.categories[cert.category] || cert.category;

  return {
    id: `experience-cert-${cert.id}`,
    category: KNOWLEDGE_CATEGORIES.EXPERIENCE_CERTIFICATES,
    title: {
      id: `${cert.title} — ${cert.issuer}`,
      en: `${cert.title} — ${cert.issuer}`,
    },
    content: {
      id: {
        summary: `${cert.title} diterbitkan oleh ${cert.issuer} (Kategori: ${idCategoryLabel}, Periode: ${cert.period}). Keahlian terkait: ${cert.skills.join(', ')}.`,
        data: {
          id: cert.id,
          number: cert.number,
          title: cert.title,
          issuer: cert.issuer,
          period: cert.period,
          categoryKey: cert.category,
          categoryLabel: idCategoryLabel,
          skills: cert.skills,
          image: cert.image,
          credentialUrl: cert.credentialUrl,
        },
      },
      en: {
        summary: `${cert.title} issued by ${cert.issuer} (Category: ${enCategoryLabel}, Period: ${cert.period}). Certified skills: ${cert.skills.join(', ')}.`,
        data: {
          id: cert.id,
          number: cert.number,
          title: cert.title,
          issuer: cert.issuer,
          period: cert.period,
          categoryKey: cert.category,
          categoryLabel: enCategoryLabel,
          skills: cert.skills,
          image: cert.image,
          credentialUrl: cert.credentialUrl,
        },
      },
    },
    source: {
      files: [
        'src/data/certificates.js',
        'src/components/Certificate.jsx',
        'src/data/translations.js',
      ],
      sectionId: '#certificates',
    },
  };
})];

/**
 * 8. DEVELOPMENT JOURNEY
 */
const developmentJourneyEntries = idText.journey.milestones.map((idMilestone, index) => {
  const enMilestone = enText.journey.milestones[index] || idMilestone;

  return {
    id: `journey-milestone-${idMilestone.number}`,
    category: KNOWLEDGE_CATEGORIES.DEVELOPMENT_JOURNEY,
    title: {
      id: `${idMilestone.number} / ${idMilestone.stage} — ${idMilestone.focus}`,
      en: `${enMilestone.number} / ${enMilestone.stage} — ${enMilestone.focus}`,
    },
    content: {
      id: {
        summary: `Tahap ${idMilestone.number} (${idMilestone.stage} — ${idMilestone.focus}): ${idMilestone.description} Fokus teknis: ${idMilestone.highlights.join(', ')}.`,
        data: {
          number: idMilestone.number,
          stage: idMilestone.stage,
          focus: idMilestone.focus,
          description: idMilestone.description,
          highlights: idMilestone.highlights,
        },
      },
      en: {
        summary: `Stage ${enMilestone.number} (${enMilestone.stage} — ${enMilestone.focus}): ${enMilestone.description} Technical highlights: ${enMilestone.highlights.join(', ')}.`,
        data: {
          number: enMilestone.number,
          stage: enMilestone.stage,
          focus: enMilestone.focus,
          description: enMilestone.description,
          highlights: enMilestone.highlights,
        },
      },
    },
    source: {
      files: ['src/components/Journey.jsx', 'src/data/translations.js'],
      sectionId: '#journey',
    },
  };
});

/**
 * 9. CONTACT
 */
const contactEntries = [
  {
    id: 'contact-direct-info',
    category: KNOWLEDGE_CATEGORIES.CONTACT,
    title: {
      id: `${idText.contact.heading} — Informasi Kontak Langsung`,
      en: `${enText.contact.heading} — Direct Contact Information`,
    },
    content: {
      id: {
        summary: `${idText.contact.intro} ${idText.contact.inquiriesDesc} Email langsung: ${directEmail}. Lokasi: ${idText.contact.location}, Zona Waktu: ${idText.contact.timezone}, Status: ${idText.contact.availableBadge}. Tersedia juga formulir pengiriman pesan langsung di bagian #contact pada website.`,
        data: {
          email: directEmail,
          location: idText.contact.location,
          timezone: idText.contact.timezone,
          availabilityBadge: idText.contact.availableBadge,
          inquiriesTitle: idText.contact.inquiriesTitle,
          inquiriesDescription: idText.contact.inquiriesDesc,
          contactFormAvailable: true,
          contactSection: '#contact',
        },
      },
      en: {
        summary: `${enText.contact.intro} ${enText.contact.inquiriesDesc} Direct email: ${directEmail}. Location: ${enText.contact.location}, Timezone: ${enText.contact.timezone}, Status: ${enText.contact.availableBadge}. A direct message dispatch form is also available in the #contact section of the website.`,
        data: {
          email: directEmail,
          location: enText.contact.location,
          timezone: enText.contact.timezone,
          availabilityBadge: enText.contact.availableBadge,
          inquiriesTitle: enText.contact.inquiriesTitle,
          inquiriesDescription: enText.contact.inquiriesDesc,
          contactFormAvailable: true,
          contactSection: '#contact',
        },
      },
    },
    source: {
      files: [
        'src/components/Contact.jsx',
        'src/data/contact.js',
        'src/data/translations.js',
        'src/components/Footer.jsx',
      ],
      sectionId: '#contact',
    },
  },
  {
    id: 'contact-social-channels',
    category: KNOWLEDGE_CATEGORIES.CONTACT,
    title: {
      id: idText.contact.profilesHeader,
      en: enText.contact.profilesHeader,
    },
    content: {
      id: {
        summary: contactChannelsData
          .map(
            (ch) =>
              `${ch.name} (${ch.handle}): ${ch.url} — ${
                idText.contact.channels[ch.key] || ch.desc
              }`
          )
          .join(' | '),
        data: {
          header: idText.contact.profilesHeader,
          channels: contactChannelsData.map((ch) => ({
            key: ch.key,
            name: ch.name,
            handle: ch.handle,
            url: ch.url,
            description: idText.contact.channels[ch.key] || ch.desc,
          })),
        },
      },
      en: {
        summary: contactChannelsData
          .map(
            (ch) =>
              `${ch.name} (${ch.handle}): ${ch.url} — ${
                enText.contact.channels[ch.key] || ch.desc
              }`
          )
          .join(' | '),
        data: {
          header: enText.contact.profilesHeader,
          channels: contactChannelsData.map((ch) => ({
            key: ch.key,
            name: ch.name,
            handle: ch.handle,
            url: ch.url,
            description: enText.contact.channels[ch.key] || ch.desc,
          })),
        },
      },
    },
    source: {
      files: ['src/components/Contact.jsx', 'src/data/contact.js', 'src/data/translations.js'],
      sectionId: '#contact',
    },
  },
];

/**
 * Grouped Knowledge Base dictionary by the 9 required domains
 */
export const knowledgeBase = Object.freeze({
  identityProfile: identityAndProfileEntries,
  about: aboutEntries,
  skillsTechnologies: skillsAndTechnologiesEntries,
  selectedProjects: selectedProjectEntries,
  otherProjects: otherProjectEntries,
  education: educationEntries,
  experienceCertificates: experienceAndCertificateEntries,
  developmentJourney: developmentJourneyEntries,
  contact: contactEntries,
});

/**
 * Flat array of all normalized knowledge entries.
 * Every entry strictly has: { id, category, title, content, source }
 */
export const knowledgeEntries = Object.freeze([
  ...identityAndProfileEntries,
  ...aboutEntries,
  ...skillsAndTechnologiesEntries,
  ...selectedProjectEntries,
  ...otherProjectEntries,
  ...educationEntries,
  ...experienceAndCertificateEntries,
  ...developmentJourneyEntries,
  ...contactEntries,
]);

/**
 * Resolves a single knowledge entry to a specific language ('id' or 'en'),
 * or returns the full bilingual entry if lang is omitted.
 */
const resolveEntryLanguage = (entry, lang) => {
  if (lang !== 'id' && lang !== 'en') {
    return entry;
  }
  return {
    id: entry.id,
    category: entry.category,
    title: entry.title[lang] || entry.title.id,
    content: entry.content[lang] || entry.content.id,
    source: entry.source,
  };
};

/**
 * Retrieves knowledge entries with optional category and language filtering.
 */
export const getKnowledgeEntries = ({ category, lang } = {}) => {
  const filtered = category
    ? knowledgeEntries.filter((entry) => entry.category === category)
    : knowledgeEntries;

  return filtered.map((entry) => resolveEntryLanguage(entry, lang));
};

/**
 * Retrieves a single knowledge entry by its unique ID.
 */
export const getKnowledgeById = (id, lang) => {
  const found = knowledgeEntries.find((entry) => entry.id === id);
  return found ? resolveEntryLanguage(found, lang) : null;
};

/**
 * Retrieves all knowledge entries belonging to a specific category.
 */
export const getKnowledgeByCategory = (category, lang) =>
  getKnowledgeEntries({ category, lang });

/**
 * Serializes the entire Knowledge Base into a deterministic, human-and-LLM-readable
 * reference document for STRICT KNOWLEDGE ONLY grounding.
 */
export const serializeKnowledgeForPrompt = (lang = 'id') => {
  const targetLang = lang === 'en' ? 'en' : 'id';
  const entries = getKnowledgeEntries({ lang: targetLang });

  return entries
    .map(
      (entry) =>
        `[${entry.id}] (${entry.category})\nTitle: ${entry.title}\nContent: ${entry.content.summary}\nSource: ${entry.source.files.join(', ')} (${entry.source.sectionId})`
    )
    .join('\n\n');
};
