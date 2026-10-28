# Portfolio Ghifari 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-portfolio--ghifari.vercel.app-000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-ghifari.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.14-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, interactive, and responsive developer portfolio website for **M. Ghifari Bima Khadafi**, featuring WebGL shader canvas effects, dual-theme support, bilingual internationalization, and interactive case studies.

🌐 **Live Website:** [https://portfolio-ghifari.vercel.app](https://portfolio-ghifari.vercel.app)

---

## ✨ Key Features

- **Interactive WebGL Canvas** — Dynamic background threads powered by OGL (`Threads.jsx`) with automatic static-frame fallback on mobile and `prefers-reduced-motion`.
- **🌐 Bilingual Support (i18n)** — Seamless one-click switching between Indonesian and English (`id` / `en`) managed via React Context (`LanguageContext`).
- **🌓 Dark & Light Theme** — Custom theme switching engine with CSS custom properties and persistent state stored in `localStorage`.
- **🎵 Deferred Ambient Audio Player** — Interactive sound player (`useAudioPlayer`) with lazy initialization (`preload="none"`) so zero audio bytes are downloaded until requested.
- **💼 Interactive Project Showcase & Case Studies** — Category-filterable project gallery with 3D tilt effects (`TiltedCard`), tech badges, live demo links, source code repositories, and a structured case-study detail modal.
- **🎓 Academic Background** — Dedicated section highlighting formal education at Universitas Gunadarma and SMKN 1 Cibinong.
- **📜 Verified Certifications** — Interactive certification catalog with high-resolution preview modal.
- **🛠️ Technical Stack Matrix** — Categorized overview of frontend, backend, database, and developer workflow tools.
- **🧭 Career & Learning Journey** — Structured timeline tracing development milestones.
- **📬 Validated Contact Form** — Direct messaging powered by EmailJS, input validation via Zod, honeypot + client cooldown anti-spam layers, and theme-aware toast feedback using React Toastify.
- **📱 Responsive, Fast & Accessible** — Section-level code splitting (`React.lazy`), WebP media assets, keyboard-accessible modals, and WCAG-compliant contrast tokens.

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
├── public/                     # Static public assets (WebP/PNG images, audio, SEO files)
├── src/
│   ├── components/             # React UI components
│   │   ├── reactbits/          # Custom WebGL & interactive card components
│   │   │   ├── Threads.jsx     # OGL interactive background threads
│   │   │   └── TiltedCard.jsx  # 3D interactive card tilt component
│   │   ├── About.jsx           # Personal biography & focus areas
│   │   ├── AcademicBackground.jsx # Formal education details
│   │   ├── Certificate.jsx     # Certification catalog & viewer modal
│   │   ├── Contact.jsx         # Contact form with Zod, honeypot & EmailJS
│   │   ├── Footer.jsx          # Footer links, social profiles & build date
│   │   ├── Journey.jsx         # Development progression timeline
│   │   ├── LastUpdated.jsx     # Build-time automatic update indicator
│   │   ├── Navbar.jsx          # Navigation header with theme & lang toggles
│   │   ├── Profile.jsx         # Hero section with WebGL threads & CTAs
│   │   ├── Project.jsx         # Filterable project gallery & case study modal
│   │   ├── Skill.jsx           # Categorized tech stack & marquee
│   │   └── SoundButton.jsx     # Interactive ambient sound controller
│   ├── context/                # Global React Context providers
│   │   ├── LanguageContext.jsx # Bilingual (ID/EN) state and switcher
│   │   └── ThemeContext.jsx    # Dark/Light theme state manager
│   ├── data/                   # Static content & translation files
│   │   ├── certificates.js     # Certificate records and credentials
│   │   ├── projects.js         # Project showcase & case study definitions
│   │   ├── resume.js           # Resume / CV download configuration
│   │   └── translations.js     # Indonesian & English language dictionaries
│   ├── hooks/                  # Custom React hooks
│   │   └── useAudioPlayer.js   # Deferred background audio playback hook
│   ├── styles/                 # Modular CSS stylesheets & variables
│   │   ├── Components.css      # Core component styles
│   │   ├── Index.css           # Global CSS variables and theme tokens
│   │   └── ...                 # Section-specific styles
│   ├── App.jsx                 # Main layout and lazy-loaded section assembler
│   └── main.jsx                # Application root entry point
├── .env                        # Environment variables (ignored in git)
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

   Create a `.env` file in the root directory:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```
   > *Note:* If you only want to test the site locally without submitting messages, the contact form interface remains fully testable.

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
| `build` | `npm run build` | Compiles and optimizes assets for production into the `dist/` folder |
| `preview` | `npm run preview` | Locally serves the production build for validation |
| `lint` | `npm run lint` | Runs ESLint to check for code quality and syntax issues |

---

## 🌐 Deployment

The application is deployed on **Vercel** with automatic deployments on branch updates.

You can also deploy your own clone with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/IGhifari/Portfolio-ghifari)

---

## 👤 Author

**M. Ghifari Bima Khadafi**

- **GitHub:** [@IGhifari](https://github.com/IGhifari)
- **Portfolio:** [portfolio-ghifari.vercel.app](https://portfolio-ghifari.vercel.app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
