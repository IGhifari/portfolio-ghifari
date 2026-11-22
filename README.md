# Portfolio Ghifari

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ighifari.my.id-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://www.ighifari.my.id/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

Interactive developer portfolio for **M. Ghifari Bima Khadafi**, featuring a 3D low-poly exploration park and mini-games, WebGL shader effects, bilingual routing (`/` and `/en`), seasonal theme system, architectural case studies, virtual developer terminal, and grounded Gemini AI assistant.

**Live Website:** [ighifari.my.id](https://www.ighifari.my.id/)

---

## Key Features

- **3D Interactive World & Mini-Games (`/play`)** — Low-poly 3D park exploration (`/play/explore`) with portfolio destination buildings, central plaza fountain, and a playable mini football pitch, plus three 3D arcade mini-games: Deploy Stack (`/play/stack`), Bug Hunter (`/play/bugs`), and Stack Runner (`/play/runner`).
- **Interactive WebGL Hero & Physics Lanyard** — Dynamic background shader threads powered by OGL (`Threads.jsx`) and a 3D physics-based ID lanyard card (`Lanyard.jsx`).
- **Grounded AI Portfolio Assistant** — Chat drawer (`ChatAssistant.jsx`) backed by Google Gemini API (`/api/chat`) with strict portfolio knowledge retrieval, prompt-injection guards, and rate limiting.
- **Developer Terminal (`Ctrl+J` / `Cmd+J`)** — Virtual CLI (`DeveloperTerminal.jsx`) with command execution, route/section navigation, seasonal previews, and project inspection.
- **Interactive `@ghifari29/id-kit` Playground** — Live in-browser testing playground (`IdKitPlayground.jsx`) on `/study-case/id-kit` covering Rupiah formatting, NIK/NPWP validation, phone carriers, holidays, and region data.
- **Bilingual Routing & SEO (`id` / `en`)** — Synchronized `/` and `/en` routes with browser history handling, canonical/hreflang tags, Open Graph locales, Schema.org JSON-LD, 37 pre-rendered static HTML pages, and a 28-URL bilingual sitemap.
- **Dark, Light & Monthly Seasonal Themes** — Semantic CSS token engine (`ThemeContext.jsx`, `seasonalEvents.js`) with optional GPU-composited seasonal atmosphere effects (`SeasonalEffects.jsx`).
- **Live GitHub Activity Heatmap** — 53-week contribution matrix proxied via Cloudflare Pages Functions (`/api/github`) with 2D roving tabindex keyboard navigation.
- **Case Studies & Recruiter Mode** — Filterable engineering case studies (`/study-case`, `/study-case/:slug`) and a dedicated executive summary page (`/recruiter`).
- **Automated Verification** — 371 unit, security, routing, physics, and WCAG accessibility tests across 30 test suites using the Node.js test runner.

---

## Adapting This Portfolio

The codebase separates identity configuration and content data from UI components:

### 1. Update Identity (`src/config/site.js`)
Edit [`src/config/site.js`](src/config/site.js) to configure your name, domain, social links, feature flags, terminal prompt, and assistant persona:
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

### 2. Update Content Data (`src/data/`)
- `src/data/profile.js` — Hero copy and lanyard card metadata.
- `src/data/projects.js` — Featured and secondary projects plus case study details.
- `src/data/skills.js` — Tech stack categories and highlighted skills.
- `src/data/experience.js` — Work experience and internships.
- `src/data/education.js` — Formal academic background.
- `src/data/certificates.js` — Certifications catalog.
- `src/data/translations.js` — Bilingual UI dictionaries (`id` / `en`).

### 3. Configure Environment Variables (`.env`)
```bash
cp .env.example .env
```
- `GEMINI_API_KEY` — Google Gemini API key for `/api/chat` (optional for local UI work).
- `ALLOWED_ORIGIN` — Comma-separated CORS allowed origins.

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Core & Build** | [React 18](https://react.dev/), [Vite 6](https://vitejs.dev/), [Tailwind CSS 3](https://tailwindcss.com/) |
| **3D, WebGL & Motion** | [Three.js](https://threejs.org/), [OGL](https://github.com/oframe/ogl), [Framer Motion](https://www.framer.com/motion/) |
| **AI & Serverless** | [`@google/genai`](https://www.npmjs.com/package/@google/genai), Cloudflare Pages Functions |
| **Utilities & UI** | [`@ghifari29/id-kit`](https://www.npmjs.com/package/@ghifari29/id-kit), [Zod](https://zod.dev/), [React Icons](https://react-icons.github.io/react-icons/), [`@emailjs/browser`](https://www.emailjs.com/), [React Toastify](https://fkhadra.github.io/react-toastify/), [React Scroll](https://www.npmjs.com/package/react-scroll) |

---

## Project Structure

```text
portfolio-ghifari/
├── api/                        # Serverless chat handler & RAG helpers
│   ├── _lib/                   # Retrieval, Gemini client & rate limiting
│   └── chat.js                 # POST /api/chat handler
├── functions/api/              # Cloudflare Pages Functions (/api/chat, /api/github)
├── public/                     # Static assets, audio, CV PDF, _redirects, sitemap.xml
├── scripts/                    # Post-build static SEO & sitemap generator
├── src/
│   ├── components/             # Portfolio UI sections & interactive widgets
│   │   ├── reactbits/          # Threads, TechText, LatticeLoader, LogoLoop, TiltedCard
│   │   ├── ui/                 # FilterDropdown
│   │   ├── About.jsx
│   │   ├── AcademicBackground.jsx
│   │   ├── CaseStudyDetail.jsx
│   │   ├── CaseStudyList.jsx
│   │   ├── Certificate.jsx
│   │   ├── ChatAssistant.jsx
│   │   ├── Contact.jsx
│   │   ├── DeveloperTerminal.jsx
│   │   ├── Experience.jsx
│   │   ├── Footer.jsx
│   │   ├── GithubActivity.jsx
│   │   ├── IdKitPlayground.jsx
│   │   ├── Journey.jsx
│   │   ├── Lanyard.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   ├── Project.jsx
│   │   ├── RecruiterMode.jsx
│   │   ├── SeasonalEffects.jsx
│   │   ├── Skill.jsx
│   │   ├── SoundButton.jsx
│   │   └── TargetCursor.jsx
│   ├── config/                 # site.js & seasonalEvents.js
│   ├── context/                # ThemeContext, LanguageContext, RouterContext
│   ├── data/                   # Bilingual portfolio datasets & translations
│   ├── game/                   # 3D Explore world & mini-games (stack, bugs, runner)
│   │   ├── bugs/               # Bug Hunter 3D mini-game
│   │   ├── hub/                # /play 3D Game Hub
│   │   ├── logic/              # Pure 2D/3D movement, collision & football physics
│   │   ├── runner/             # Stack Runner 3D mini-game
│   │   ├── shared/             # Seasonal 3D themes & atmosphere particles
│   │   ├── stack/              # Deploy Stack 3D mini-game
│   │   ├── ui/                 # GameHUD, FootballHUD, InfoPanel, ArcadeModal, VirtualJoystick
│   │   ├── world/              # Three.js park scene, buildings, props, player, football field
│   │   └── GamePage.jsx        # /play/explore entry page
│   ├── hooks/                  # useAudioPlayer, useFocusTrap
│   ├── services/               # githubService.js
│   ├── styles/                 # Modular CSS & Tailwind utilities
│   ├── utils/                  # router, seo, terminalCommands, contactValidation, projectExplorer
│   ├── App.jsx
│   └── main.jsx
├── tests/                      # 30 Node.js test suites (371 tests)
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IGhifari/Portfolio-ghifari.git
   cd Portfolio-ghifari
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server with local `/api/chat` and `/api/github` middlewares |
| `build` | `npm run build` | Bundle production assets and pre-render 37 static HTML pages + `sitemap.xml` |
| `preview` | `npm run preview` | Serve production `dist/` build locally |
| `lint` | `npm run lint` | Run ESLint across the repository |
| `test` | `npm test` | Run all 371 unit and accessibility tests |

---

## Deployment

Deployed on **Cloudflare Pages** with Cloudflare Pages Functions (`functions/api/`) handling `/api/chat` and `/api/github`.

---

## Author

**M. Ghifari Bima Khadafi**
- GitHub: [@IGhifari](https://github.com/IGhifari)
- LinkedIn: [M. Ghifari Bima Khadafi](https://www.linkedin.com/in/ighifari/)
- Website: [ighifari.my.id](https://www.ighifari.my.id/)

---

## License

Licensed under the [MIT License](LICENSE).
