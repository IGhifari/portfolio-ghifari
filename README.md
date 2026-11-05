# Portfolio Ghifari 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-portfolio--ghifari.pages.dev-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://www.ighifari.my.id/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.14-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, interactive, and responsive developer portfolio website for **M. Ghifari Bima Khadafi**, featuring WebGL shader canvas effects, dual-theme support, bilingual internationalization, interactive case studies, developer terminal, and AI portfolio assistant.

🌐 **Live Website:** [ighifari.my.id](https://www.ighifari.my.id/)

---

## ✨ Key Features

- **Interactive WebGL Canvas** — Dynamic background threads powered by OGL (`Threads.jsx`) and 3D physics-based lanyard pass (`Lanyard.jsx`).
- **🤖 Grounded AI Portfolio Assistant** — Interactive AI chatbot (`ChatAssistant.jsx`) powered by Google Gemini API with React Bits `LatticeLoader`, strict portfolio RAG grounding, and zero hallucinations.
- **💻 Developer Terminal (HUD)** — Full-featured virtual terminal (`DeveloperTerminal.jsx`) accessible via keyboard shortcut (`Ctrl+J` / `⌘J`) with command execution, live GitHub sync, and audio feedback.
- **🎯 Custom Target Cursor HUD** — Responsive target cursor (`TargetCursor.jsx`) with dynamic locking to interactive elements, live label tracking, and magnetic snapping.
- **🌐 Bilingual Support (i18n)** — Seamless one-click switching between Indonesian and English (`id` / `en`) managed via React Context (`LanguageContext`).
- **🌓 Dark & Light Theme** — Custom theme switching engine with semantic CSS tokens and persistent state stored in `localStorage`.
- **📊 Live GitHub Activity Heatmap** — Real-time contribution matrix with 53-week roving tabindex grid, accessible arrow navigation, and live caching.
- **💼 Interactive Project Showcase & Case Studies** — Filterable project gallery with 3D tilt effects (`TiltedCard`), deep architecture case studies, and dedicated recruiter executive summary (`RecruiterMode.jsx`).
- **📱 Fast, Accessible & SEO-Optimized** — 13 static pre-rendered SEO pages, 100% WCAG contrast compliance, screen-reader focus traps, and 304 automated regression unit tests.

---

## 🎨 How to Adapt & Reuse This Portfolio (Template Guide)

This portfolio is architected with a decoupled data and configuration layer, making it easy to adapt for your own showcase in **3 simple steps**:

### 1. Update Core Identity (`src/config/site.js`)
Edit [`src/config/site.js`](src/config/site.js) with your personal information, domain, social handles, and bot persona:
```javascript
export const siteConfig = {
  name: 'Your Full Name',
  brandName: 'YOURNAME',
  shortName: 'YourName',
  domain: 'yourdomain.com',
  origin: 'https://www.yourdomain.com',
  author: {
    email: 'you@example.com',
    github: 'https://github.com/yourhandle',
    githubUsername: 'yourhandle',
    linkedin: 'https://www.linkedin.com/in/yourhandle/',
    instagram: 'https://www.instagram.com/yourhandle/',
    discord: 'your_discord_tag',
    twitter: '@yourhandle',
  },
  bot: {
    name: 'YOUR BOT AI',
    role: 'Portfolio Assistant',
  },
  terminal: {
    user: 'visitor',
    host: 'yourhandle',
    osName: 'YOUR-OS',
    version: 'v1.0.0',
  },
};
```
All components (Navbar logo, Footer copyright, Terminal prompt, Chat Assistant label, SEO metadata) will adapt automatically!

### 2. Update Content Data (`src/data/`)
Populate your personal projects, skills, education, and career journey in `src/data/`:
- `src/data/projects.js` — Showcase projects & case studies.
- `src/data/skills.js` — Technical stack & category groups.
- `src/data/experience.js` — Work history & internships.
- `src/data/certificates.js` — Verified certifications.
- `src/data/translations.js` — Bilingual text dictionaries (`id` / `en`).

### 3. Setup Environment Variables (`.env`)
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
- `GEMINI_API_KEY` — Google Gemini API key for the chat assistant (optional).
- `ALLOWED_ORIGIN` — Comma-separated CORS allowed origins.

---

## 🛠️ Tech Stack

### Core & Frameworks
| Technology | Role |
|------------|------|
| **[React 18](https://react.dev/)** | Core user interface library |
| **[Vite 5](https://vitejs.dev/)** | Next-generation frontend tooling and bundler |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling framework |

### WebGL & Animations
| Package | Description |
|---------|-------------|
| **[OGL](https://github.com/oframe/ogl)** | Minimal WebGL library for interactive shader thread effects |
| **[Three.js](https://threejs.org/)** | 3D physics lanyard rendering and card simulation |
| **[Framer Motion](https://www.framer.com/motion/)** | Production-ready motion and layout transitions |

### UI & Utilities
| Package | Description |
|---------|-------------|
| **[React Icons](https://react-icons.github.io/react-icons/)** | Modern vector icon sets |
| **[Zod](https://zod.dev/)** | Schema validation for contact form inputs |
| **[@emailjs/browser](https://www.emailjs.com/)** | Client-side email dispatch integration |
| **[React Toastify](https://fkhadra.github.io/react-toastify/)** | Animated notification toasts |
| **[React Scroll](https://www.npmjs.com/package/react-scroll)** | Smooth animated page scrolling |

---

## 📁 Project Structure

```
portfolio-ghifari/
├── api/                        # Serverless Functions (Gemini AI RAG & Chat API)
│   ├── _lib/                   # Retrieval, system prompt & rate limiters
│   └── chat.js                 # POST /api/chat endpoint
├── functions/api/              # Cloudflare Pages Functions (GitHub API proxy)
├── public/                     # Static public assets (WebP/PNG images, audio, SEO files)
├── scripts/                    # Build scripts (generate-static-seo.js)
├── src/
│   ├── components/             # React UI components & sections
│   │   ├── reactbits/          # Visual interaction components (Threads, TechText, LatticeLoader, LogoLoop)
│   │   ├── About.jsx           # Personal biography & focus areas
│   │   ├── AcademicBackground.jsx # Formal education details
│   │   ├── CaseStudyDetail.jsx # Deep-dive architecture case study
│   │   ├── CaseStudyList.jsx   # Filterable case study catalog
│   │   ├── Certificate.jsx     # Certification catalog & viewer modal
│   │   ├── ChatAssistant.jsx   # AI assistant drawer with LatticeLoader
│   │   ├── Contact.jsx         # Contact form with Zod & EmailJS
│   │   ├── DeveloperTerminal.jsx # Virtual interactive terminal
│   │   ├── Experience.jsx      # Work experience & internships
│   │   ├── Footer.jsx          # Footer links, social profiles & copyright
│   │   ├── GithubActivity.jsx  # Live contribution heatmap & repo metrics
│   │   ├── Journey.jsx         # Career development progression timeline
│   │   ├── Lanyard.jsx         # 3D interactive physics lanyard card
│   │   ├── Navbar.jsx          # Responsive navigation dock with theme/lang toggles
│   │   ├── Profile.jsx         # Hero section with WebGL threads & TechText
│   │   ├── Project.jsx         # Showcase projects gallery
│   │   ├── RecruiterMode.jsx   # Quick executive summary for recruiters
│   │   ├── Skill.jsx           # Categorized tech stack matrix
│   │   └── SoundButton.jsx     # Interactive ambient sound controller
│   ├── config/                 # Single Source of Truth configuration
│   │   └── site.js             # Identity, author, domain, terminal & bot config
│   ├── context/                # Global React Context providers (Theme, Language, Router)
│   ├── data/                   # Decoupled content & bilingual translations
│   ├── hooks/                  # Custom React hooks (useAudioPlayer, useFocusTrap)
│   ├── services/               # API & data caching layer (githubService.js)
│   ├── styles/                 # Modular CSS stylesheets & variables
│   ├── utils/                  # Helper utilities (cn, seo, terminalCommands, contactValidation)
│   ├── App.jsx                 # Main layout & lazy-loaded section assembler
│   └── main.jsx                # Application root entry point
├── tests/                      # Automated test suite (304 unit & accessibility tests)
├── .env.example                # Example environment variables template
├── index.html                  # HTML5 document template & SEO metadata
├── tailwind.config.js          # Tailwind CSS theme configuration
├── vite.config.js              # Vite build & chunk splitting setup
└── package.json                # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
- **npm** (or yarn / pnpm)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IGhifari/Portfolio-ghifari.git
   cd Portfolio-ghifari
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   ```
   http://localhost:5173
   ```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `build` | `npm run build` | Compiles assets for production and generates 13 static SEO HTML pages |
| `preview` | `npm run preview` | Locally serves the production build for validation |
| `lint` | `npm run lint` | Runs ESLint to check for code quality and syntax issues |
| `test` | `npm test` | Runs the full 304 unit and accessibility test suite |

---

## 🌐 Deployment

The application is deployed on **Cloudflare Pages** with automatic deployments on branch updates.

Hosting, Edge caching, and serverless API functions are powered by the Cloudflare Pages & Workers runtime.

---

## 👤 Author

**M. Ghifari Bima Khadafi**

- **GitHub:** [@IGhifari](https://github.com/IGhifari)
- **LinkedIn:** [M. Ghifari](https://www.linkedin.com/in/ighifari/)
- **Portfolio:** [ighifari.my.id](https://www.ighifari.my.id/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
