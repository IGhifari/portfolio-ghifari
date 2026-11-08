/**
 * Measurable Keyword-Based Retrieval Engine for Portfolio Knowledge Base.
 *
 * Location: api/_lib/retrieval.js
 * Mode: STRICT KNOWLEDGE ONLY
 *
 * Responsibilities:
 * 1. Detect prompt injection / instruction override attempts (ID & EN).
 * 2. Normalize and tokenize user queries (preserving technical terms like React, Node.js, C#, S1, 1IA08).
 * 3. Expand domain-specific bilingual synonyms strictly mapped to existing portfolio categories.
 * 4. Score all 29 Knowledge Base entries deterministically across title, category, tags/skills, and content.
 * 5. Enforce a minimum relevance threshold (`MIN_RELEVANCE_SCORE`) and detect unlisted personal data queries.
 */

import { knowledgeEntries, KNOWLEDGE_CATEGORIES } from './knowledge.js';

export const MIN_RELEVANCE_SCORE = 3.0;
export const DEFAULT_TOP_K = 6;

/**
 * Stopwords in Indonesian & English that should not contribute to relevance scoring.
 */
const STOPWORDS = new Set([
  // Indonesian
  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'apakah', 'apa', 'siapa',
  'bagaimana', 'kapan', 'dimana', 'kemana', 'berapa', 'saja', 'ada', 'untuk',
  'dengan', 'pada', 'adalah', 'ialah', 'merupakan', 'dalam', 'atau', 'juga',
  'sudah', 'telah', 'sedang', 'akan', 'bisa', 'dapat', 'boleh', 'tolong',
  'coba', 'jelaskan', 'ceritakan', 'sebutkan', 'kasih', 'tahu', 'tentang',
  'nya', 'dia', 'ia', 'beliau', 'kamu', 'anda', 'saya', 'aku', 'kita', 'kami',
  'hal', 'tersebut', 'lebih', 'lanjut', 'detail', 'lengkap', 'dong', 'ya', 'nih',
  // English
  'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'what', 'who',
  'how', 'when', 'where', 'which', 'why', 'whom', 'whose', 'can', 'could',
  'would', 'should', 'will', 'shall', 'may', 'might', 'must', 'do', 'does',
  'did', 'have', 'has', 'had', 'having', 'tell', 'me', 'us', 'you', 'your',
  'his', 'her', 'their', 'our', 'my', 'its', 'it', 'he', 'she', 'they', 'we',
  'in', 'of', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'out',
  'into', 'over', 'after', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'please', 'explain', 'describe', 'list', 'show', 'give', 'know',
]);

/**
 * Subject anchor tokens refer to the portfolio owner's name.
 * Standalone name mentions without any valid portfolio topic must NOT pass MIN_RELEVANCE_SCORE.
 */
const SUBJECT_NAME_TOKENS = new Set([
  'ghifari',
  'bima',
  'khadafi',
  'muhammad',
  'ighifari',
]);

/**
 * Unlisted personal / private attributes that do NOT exist anywhere in the portfolio.
 * Queries asking specifically for these must be refused under STRICT KNOWLEDGE ONLY.
 */
const UNLISTED_PERSONAL_PATTERNS = [
  /\b(nomor\s*(wa|whatsapp|telepon|telp|hp|handphone|ponsel)|phone\s*number|whatsapp\s*number|mobile\s*number)\b/i,
  /\b(berapa\s*(ipk|gpa|gaji|salary|umur|usia|tinggi|berat)|what\s*is\s*(his|ghifari'?s?)?\s*(gpa|ipk|salary|age|height|weight|phone|whatsapp))\b/i,
  /\b(ipk|gpa|transkrip\s*nilai|expected\s*salary|ekspektasi\s*gaji|gaji\s*pokok|slip\s*gaji)\b/i,
  /\b(tanggal\s*lahir|tempat\s*lahir|date\s*of\s*birth|birth\s*date|birthday|ulang\s*tahun|umur\s*berapa|usia\s*berapa)\b/i,
  /\b(agama|religion|status\s*pernikahan|marital\s*status|sudah\s*menikah|pacar|girlfriend|istri|wife)\b/i,
  /\b(nomor\s*(ktp|nik|rekening|paspor)|bank\s*account|home\s*address|alamat\s*rumah\s*lengkap)\b/i,
  /\b(makanan\s*favorit|minuman\s*favorit|warna\s*favorit|hobi\s*olahraga|favorite\s*(food|drink|color|movie))\b/i,
];

/**
 * Prompt injection and instruction-override patterns (Indonesian & English).
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system|developer|your)?\s*(instructions|rules|prompts|constraints|guidelines|context|training|role|persona|task|identity|objective)/i,
  /disregard\s+(all\s+)?(previous|prior|above|system|developer|your)?\s*(instructions|rules|prompts|constraints|guidelines|role|persona|task|identity)/i,
  /forget\s+(all\s+)?(previous|prior|above|your)?\s*(instructions|rules|prompts|context|training|role|persona|task|identity)/i,
  /abaikan\s+(semua\s+|seluruh\s+)?(instruksi|aturan|perintah|batasan|konteks|prompt|peran|tugas|identitas|tujuan)/i,
  /lupakan\s+(semua\s+|seluruh\s+)?(instruksi|aturan|perintah|batasan|konteks|prompt|peran|tugas|identitas|tujuan)/i,
  /(system\s*override|developer\s*mode|jailbreak|dan\s*mode|god\s*mode|sudo\s*mode)/i,
  /(you\s+are\s+now\s+(a|an)|act\s+as\s+(a|an)|pretend\s+(to\s+be|you\s+are)|roleplay\s+as)/i,
  /(kamu\s+sekarang\s+adalah|berpura-puralah\s+menjadi|bertindaklah\s+sebagai|mainkan\s+peran\s+sebagai)/i,
  /(reveal|print|output|show|repeat)\s+(your|the)\s+(system\s*prompt|hidden\s*instructions|api\s*key|secret)/i,
  /(tampilkan|bocorkan|cetak|ulangi)\s+(system\s*prompt|instruksi\s*sistem|api\s*key|rahasia)/i,
  /<\s*\/?\s*(system|instruction|prompt|developer)\s*>/i,
];

/**
 * Bilingual intent groups that map user query keywords to canonical portfolio categories
 * and related search terms present in the Knowledge Base.
 */
const INTENT_RULES = [
  {
    name: 'identity',
    triggers: [
      'profil', 'profile', 'identitas', 'identity', 'siapa', 'who',
      'perkenalkan', 'introduce', 'introduction', 'role', 'peran',
      'profesi', 'pekerjaan', 'status', 'available', 'tersedia',
      'hire', 'kerja', 'cv', 'resume', 'unduh', 'download', 'lanyard',
      'pass', 'card',
    ],
    categories: [KNOWLEDGE_CATEGORIES.IDENTITY_PROFILE, KNOWLEDGE_CATEGORIES.ABOUT],
    categoryBoost: 3.5,
  },
  {
    name: 'about',
    triggers: [
      'tentang', 'about', 'bio', 'biografi', 'biography', 'latar',
      'background', 'fokus', 'focus', 'spesialisasi', 'specialization',
      'expertise', 'ringkasan', 'summary', 'overview', 'lokasi',
      'location', 'domisili', 'bogor', 'jakarta', 'indonesia',
    ],
    categories: [KNOWLEDGE_CATEGORIES.ABOUT, KNOWLEDGE_CATEGORIES.IDENTITY_PROFILE],
    categoryBoost: 3.5,
  },
  {
    name: 'skills',
    triggers: [
      'skill', 'skills', 'keahlian', 'kemampuan', 'teknologi', 'technology',
      'technologies', 'tech', 'stack', 'tools', 'alat', 'workflow',
      'bahasa', 'pemrograman', 'programming', 'framework', 'library',
      'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack',
      'database', 'basis', 'data', 'sql', 'orm', 'react', 'typescript',
      'javascript', 'tailwind', 'vite', 'html', 'html5', 'css', 'css3',
      'node', 'nodejs', 'node.js', 'express', 'prisma', 'supabase',
      'laravel', 'php', 'postgresql', 'postgres', 'mysql', 'git',
      'github', 'docker', 'vercel', 'vscode', 'antigravity', 'tableplus',
      'postman', 'bruno', 'claude', 'gemini',
    ],
    categories: [KNOWLEDGE_CATEGORIES.SKILLS_TECHNOLOGIES],
    categoryBoost: 4.0,
  },
  {
    name: 'projects',
    triggers: [
      'proyek', 'project', 'projects', 'karya', 'work', 'works',
      'portofolio', 'portfolio', 'aplikasi', 'application', 'app', 'apps',
      'website', 'web', 'sistem', 'system', 'platform', 'game', 'games',
      'studi', 'kasus', 'case', 'study', 'demo', 'live', 'repo', 'repository',
      'akseskita', 'akses', 'disabilitas', 'disability', 'accessibility',
      'management', 'kanban', 'sprint', 'food', 'marketplace', 'ecommerce',
      'e-commerce', 'pertanian', 'agricultural', 'internship-journal',
      'jurnal', 'journal', '1ia08', 'class', 'kelas', 'ecovoyage',
      'pulau', 'harapan', 'day', 'home', 'sehari', 'rumah', 'tunarungu',
      'deaf', 'slb',
    ],
    categories: [KNOWLEDGE_CATEGORIES.SELECTED_PROJECTS, KNOWLEDGE_CATEGORIES.OTHER_PROJECTS],
    categoryBoost: 4.0,
  },
  {
    name: 'education',
    triggers: [
      'pendidikan', 'education', 'akademik', 'academic', 'kuliah',
      'kampus', 'campus', 'universitas', 'university', 'college',
      'gunadarma', 'sekolah', 'school', 'smk', 'smkn', 'cibinong',
      'jurusan', 'major', 'prodi', 'fakultas', 'faculty', 'rpl',
      'rekayasa', 'perangkat', 'lunak', 'informatika', 'informatics',
      's1', 'undergraduate', 'degree', 'kurikulum', 'curriculum',
      'kompetensi', 'competencies', 'alumni', 'lulusan', 'student', 'mahasiswa',
      'studying', 'study', 'studies', 'belajar', 'menempuh', 'pursuing',
    ],
    categories: [KNOWLEDGE_CATEGORIES.EDUCATION],
    categoryBoost: 4.5,
  },
  {
    name: 'experience_certificates',
    triggers: [
      'pengalaman', 'experience', 'magang', 'internship', 'intern',
      'pkl', 'prakerin', 'sertifikat', 'sertifikasi', 'certificate',
      'certificates', 'certification', 'certifications', 'kredensial',
      'credential', 'credentials', 'kompetisi', 'competition', 'lomba',
      'pelatihan', 'training', 'kursus', 'course', 'ama', 'salam',
      'pt', 'clevio', 'digitalent', 'kominfo', 'idn', 'islamic',
      'python', 'analytics',
    ],
    categories: [KNOWLEDGE_CATEGORIES.EXPERIENCE_CERTIFICATES],
    categoryBoost: 4.5,
  },
  {
    name: 'journey',
    triggers: [
      'perjalanan', 'journey', 'timeline', 'milestone', 'milestones',
      'tahap', 'tahapan', 'stage', 'stages', 'kronologi', 'chronological',
      'perkembangan', 'progression', 'fondasi', 'foundation', 'transisi',
      'transition', 'arah', 'direction', 'karir', 'career', 'sejarah',
    ],
    categories: [KNOWLEDGE_CATEGORIES.DEVELOPMENT_JOURNEY],
    categoryBoost: 4.0,
  },
  {
    name: 'contact',
    triggers: [
      'kontak', 'contact', 'hubungi', 'menghubungi', 'reach', 'connect',
      'email', 'gmail', 'mail', 'pesan', 'message', 'formulir', 'form',
      'sosmed', 'sosial', 'social', 'media', 'network', 'networks',
      'channel', 'channels', 'linkedin', 'instagram', 'ig', 'discord',
      'tiktok', 'kolaborasi', 'collaboration', 'freelance', 'kontrak',
      'contract', 'inquiries', 'timezone', 'zona', 'waktu', 'wib',
    ],
    categories: [KNOWLEDGE_CATEGORIES.CONTACT],
    categoryBoost: 4.5,
  },
];

/**
 * Detects whether a user message (or history item) contains prompt injection patterns.
 */
export const detectPromptInjection = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { isInjection: false, matchedPattern: null };
  }
  const normalized = text.trim();
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isInjection: true, matchedPattern: pattern.source };
    }
  }
  return { isInjection: false, matchedPattern: null };
};

/**
 * Detects whether a query asks for private/unlisted personal attributes not in the portfolio.
 */
export const detectUnlistedPersonalQuery = (text = '') => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const normalized = text.trim();
  return UNLISTED_PERSONAL_PATTERNS.some((pattern) => pattern.test(normalized));
};

/**
 * Detects the likely language ('id' or 'en') of a query string, falling back to fallbackLang.
 */
export const detectQueryLanguage = (query = '', fallbackLang = 'id') => {
  if (!query || typeof query !== 'string') {
    return fallbackLang === 'en' ? 'en' : 'id';
  }
  const lower = query.toLowerCase();
  const idMarkers = [
    'apa', 'apakah', 'siapa', 'bagaimana', 'dimana', 'kapan', 'berapa',
    'proyek', 'keahlian', 'pendidikan', 'pengalaman', 'magang', 'sertifikat',
    'kontak', 'hubungi', 'tentang', 'perjalanan', 'teknologi', 'kuliah',
    'sekolah', 'saja', 'yang', 'milik', 'buat', 'kerjakan', 'bahasa',
  ];
  const enMarkers = [
    'what', 'who', 'how', 'where', 'when', 'which', 'does', 'did', 'can',
    'tell', 'show', 'list', 'projects', 'skills', 'education', 'experience',
    'internship', 'certificates', 'contact', 'reach', 'about', 'journey',
    'built', 'worked', 'university', 'school', 'his', 'available',
  ];

  const words = lower.split(/[^a-z0-9]+/).filter(Boolean);
  let idCount = 0;
  let enCount = 0;
  for (const w of words) {
    if (idMarkers.includes(w)) idCount += 1;
    if (enMarkers.includes(w)) enCount += 1;
  }

  if (idCount > enCount) return 'id';
  if (enCount > idCount) return 'en';
  return fallbackLang === 'en' ? 'en' : 'id';
};

/**
 * Normalizes and tokenizes text into searchable lowercase tokens.
 */
export const tokenize = (text = '') => {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9+#.-]+/g, ' ')
    .trim();

  if (!cleaned) return [];

  return cleaned
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
};

/**
 * Checks whether a query asks "who is Ghifari" / general profile introduction.
 */
const isGeneralIdentityQuery = (rawQuery = '') => {
  const lower = rawQuery.toLowerCase().trim();
  return (
    /\b(siapa\s+(itu\s+)?(m\.?\s*)?(ghifari|bima|khadafi|ighifari))\b/i.test(lower) ||
    /\b(who\s+is\s+(m\.?\s*)?(ghifari|bima|khadafi|ighifari))\b/i.test(lower) ||
    /\b(ceritakan\s+tentang\s+ghifari|tell\s+me\s+about\s+ghifari|profil\s+ghifari|ghifari'?s?\s+profile)\b/i.test(lower)
  );
};

/**
 * Scores a single Knowledge Base entry against the query tokens and active intents.
 */
const scoreKnowledgeEntry = (entry, rawQuery, queryTokens, matchedIntents) => {
  let score = 0;
  const matchedKeywords = new Set();

  const titleId = (entry.title.id || '').toLowerCase();
  const titleEn = (entry.title.en || '').toLowerCase();
  const summaryId = (entry.content.id?.summary || '').toLowerCase();
  const summaryEn = (entry.content.en?.summary || '').toLowerCase();
  const dataJson = JSON.stringify(entry.content.id?.data || {}).toLowerCase();
  const entryIdLower = entry.id.toLowerCase();

  // 1. Intent Category Boost
  for (const intent of matchedIntents) {
    if (intent.categories.includes(entry.category)) {
      score += intent.categoryBoost;
      matchedKeywords.add(`intent:${intent.name}`);
    }
  }

  // 2. General Identity Query Boost ("Siapa Ghifari?" / "Who is Ghifari?")
  if (
    isGeneralIdentityQuery(rawQuery) &&
    (entry.category === KNOWLEDGE_CATEGORIES.IDENTITY_PROFILE ||
      entry.category === KNOWLEDGE_CATEGORIES.ABOUT)
  ) {
    score += 6.0;
    matchedKeywords.add('intent:who-is-ghifari');
  }

  // 3. Token-level scoring
  const nonSubjectTokens = queryTokens.filter((t) => !SUBJECT_NAME_TOKENS.has(t));

  for (const token of queryTokens) {
    const isSubjectName = SUBJECT_NAME_TOKENS.has(token);

    if (isSubjectName) {
      // Subject name tokens alone only give a tiny weight (0.4) so out-of-scope questions
      // like "Apa makanan favorit Ghifari?" do not cross MIN_RELEVANCE_SCORE (3.0)
      if (titleId.includes(token) || summaryId.includes(token)) {
        score += 0.4;
      }
      continue;
    }

    // Exact match in entry ID (e.g. "akseskita", "ecovoyage", "clevio", "gunadarma")
    if (entryIdLower.includes(token) && token.length >= 3) {
      score += 5.5;
      matchedKeywords.add(token);
    }

    // Match in Title (ID or EN)
    const tokenRegex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (tokenRegex.test(titleId) || tokenRegex.test(titleEn)) {
      score += 4.5;
      matchedKeywords.add(token);
    } else if (titleId.includes(token) || titleEn.includes(token)) {
      score += 3.0;
      matchedKeywords.add(token);
    }

    // Match in Summary or Structured Data (ID or EN)
    if (tokenRegex.test(summaryId) || tokenRegex.test(summaryEn) || tokenRegex.test(dataJson)) {
      score += 2.5;
      matchedKeywords.add(token);
    } else if (
      token.length >= 4 &&
      (summaryId.includes(token) || summaryEn.includes(token) || dataJson.includes(token))
    ) {
      score += 1.5;
      matchedKeywords.add(token);
    }
  }

  // 4. Multi-word phrase bonus (for non-subject tokens)
  if (nonSubjectTokens.length >= 2) {
    const phrase = nonSubjectTokens.join(' ');
    if (titleId.includes(phrase) || titleEn.includes(phrase)) {
      score += 5.0;
    } else if (summaryId.includes(phrase) || summaryEn.includes(phrase)) {
      score += 3.0;
    }
  }

  return {
    entry,
    score: Number(score.toFixed(2)),
    matchedKeywords: Array.from(matchedKeywords),
  };
};

/**
 * Main Retrieval Function.
 * Searches the Knowledge Base and returns relevant entries above `threshold`.
 *
 * @param {string} query - The user's question
 * @param {object} options
 * @param {'id'|'en'} [options.lang='id'] - Target language
 * @param {number} [options.threshold=MIN_RELEVANCE_SCORE] - Minimum score required
 * @param {number} [options.topK=DEFAULT_TOP_K] - Maximum number of entries to return
 */
export const retrieveKnowledge = (
  query,
  { lang = 'id', threshold = MIN_RELEVANCE_SCORE, topK = DEFAULT_TOP_K } = {}
) => {
  const effectiveLang = detectQueryLanguage(query, lang);

  // 1. Check Prompt Injection first
  const injectionCheck = detectPromptInjection(query);
  if (injectionCheck.isInjection) {
    return {
      query,
      language: effectiveLang,
      hasRelevantKnowledge: false,
      refusalReason: 'PROMPT_INJECTION',
      isAmbiguous: false,
      threshold,
      topScore: 0,
      results: [],
    };
  }

  // 2. Check Unlisted Personal Info query
  if (detectUnlistedPersonalQuery(query)) {
    return {
      query,
      language: effectiveLang,
      hasRelevantKnowledge: false,
      refusalReason: 'UNLISTED_PERSONAL_INFO',
      isAmbiguous: false,
      threshold,
      topScore: 0,
      results: [],
    };
  }

  const queryTokens = tokenize(query);
  const rawLower = (query || '').toLowerCase();

  // 3. Identify matched domain intents
  const matchedIntents = INTENT_RULES.filter((rule) =>
    rule.triggers.some((trigger) => {
      if (queryTokens.includes(trigger)) return true;
      const regex = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i');
      return regex.test(rawLower);
    })
  );

  // 4. Score all entries
  const scored = knowledgeEntries
    .map((entry) => scoreKnowledgeEntry(entry, query, queryTokens, matchedIntents))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score);

  const topResults = scored.slice(0, topK);
  const topScore = topResults.length > 0 ? topResults[0].score : 0;
  const hasRelevantKnowledge = topResults.length > 0;

  // 5. Determine whether the query is broad/ambiguous across multiple items
  const nonSubjectTokens = queryTokens.filter((t) => !SUBJECT_NAME_TOKENS.has(t));
  const distinctCategories = new Set(topResults.map((r) => r.entry.category));
  const isAmbiguous =
    hasRelevantKnowledge &&
    nonSubjectTokens.length <= 2 &&
    topResults.length >= 2 &&
    (distinctCategories.size >= 2 ||
      Math.abs(topResults[0].score - topResults[1].score) <= 1.0);

  return {
    query,
    language: effectiveLang,
    hasRelevantKnowledge,
    refusalReason: hasRelevantKnowledge ? null : 'NO_RELEVANT_KNOWLEDGE',
    isAmbiguous,
    threshold,
    topScore,
    results: topResults.map(({ entry, score, matchedKeywords }) => ({
      id: entry.id,
      category: entry.category,
      title: entry.title[effectiveLang] || entry.title.id,
      summary: entry.content[effectiveLang]?.summary || entry.content.id.summary,
      data: entry.content[effectiveLang]?.data || entry.content.id.data,
      source: entry.source,
      score,
      matchedKeywords,
    })),
  };
};
