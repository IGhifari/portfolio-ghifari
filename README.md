# Portfolio Ghifari 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-portfolio--ghifari.vercel.app-000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-ghifari.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.14-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A modern, interactive, and responsive developer portfolio website for **M. Ghifari Bima Khadafi**, featuring 3D physics-based animations, WebGL canvas effects, dual-theme support, and bilingual internationalization.

🌐 **Live Website:** [https://portfolio-ghifari.vercel.app](https://portfolio-ghifari.vercel.app)

---

## ✨ Key Features

- **Interactive 3D & WebGL Canvas** — 3D physics elements using React Three Fiber (`@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`) combined with dynamic background threads powered by OGL.
- **🌐 Bilingual Support (i18n)** — Seamless one-click switching between English and Indonesian (`id` / `en`) managed via React Context (`LanguageContext`).
- **🌓 Dark & Light Theme** — Custom theme switching engine with CSS custom properties and persistent state stored in `localStorage`.
- **🎵 Ambient Audio Experience** — Interactive sound player button with audio state management via `useAudioPlayer`.
- **💼 Interactive Project Showcase** — Filterable project gallery with 3D tilt effects (`TiltedCard`), tech badges, live demo links, source code repositories, and modal previews.
- **🎓 Academic Background** — Dedicated section highlighting formal education, GPA, academic honors, and coursework.
- **📜 Verified Certifications** — Interactive certification catalog with verification links and preview modal.
- **🛠️ Technical Stack Matrix** — Categorized overview of frontend, backend, tools, and libraries.
- **🧭 Career & Learning Journey** — Structured timeline tracing professional experience and milestones.
- **📬 Validated Contact Form** — Direct messaging powered by EmailJS, robust input validation via Zod, and real-time toast feedback using React Toastify.
- **📱 Fully Responsive & Accessible** — Crafted with fluid mobile navigation, desktop-optimized micro-interactions, and support for `prefers-reduced-motion`.

---

## 🛠️ Tech Stack

### Core & Frameworks
| Technology | Role |
|------------|------|
| **[React 18](https://react.dev/)** | Core user interface library |
| **[Vite 5](https://vitejs.dev/)** | Next-generation frontend tooling and bundler |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling framework |

### 3D, WebGL & Animations
| Package | Description |
|---------|-------------|
| **[Three.js](https://threejs.org/)** | 3D graphics rendering engine |
| **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)** | Declarative Three.js wrapper for React |
| **[@react-three/drei](https://github.com/pmndrs/drei)** | Functional helpers and abstractions for React Three Fiber |
| **[@react-three/rapier](https://github.com/pmndrs/react-three-rapier)** | Real-time physics simulation engine |
| **[OGL](https://github.com/oframe/ogl)** | Minimal WebGL library for particle/thread canvas effects |
| **[Framer Motion](https://www.framer.com/motion/)** | Production-ready motion and layout transitions |
| **[TypeIt React](https://typeitjs.com/)** | Smooth typewriter text animations |

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
├── public/                     # Static public assets (icons, images, audio)
│   ├── assets/                 # Profile, project, and certificate media
│   └── audio/                  # Ambient background audio tracks
├── src/
│   ├── assets/                 # Local image imports and graphics
│   ├── components/             # React UI components
│   │   ├── reactbits/          # Custom WebGL & canvas components
│   │   │   ├── Threads.jsx     # OGL interactive background threads
│   │   │   └── TiltedCard.jsx  # 3D interactive card tilt component
│   │   ├── About.jsx           # Personal biography & philosophy
│   │   ├── AcademicBackground.jsx # Education, honors & GPA details
│   │   ├── Certificate.jsx     # Certification catalog & viewer modal
│   │   ├── Contact.jsx         # Contact form with Zod & EmailJS
│   │   ├── Footer.jsx          # Footer links, social profiles & credits
│   │   ├── Journey.jsx         # Career and learning timeline
│   │   ├── Navbar.jsx          # Navigation header with theme & lang toggles
│   │   ├── Particles.jsx       # Interactive background canvas
│   │   ├── Profile.jsx         # Hero section with 3D canvas and typewriter
│   │   ├── Project.jsx         # Projects gallery and detail modal
│   │   ├── Skill.jsx           # Categorized tech stack & dev tools
│   │   └── SoundButton.jsx     # Interactive ambient sound controller
│   ├── context/                # Global React Context providers
│   │   ├── LanguageContext.jsx # Bilingual (ID/EN) state and switcher
│   │   └── ThemeContext.jsx    # Dark/Light theme state manager
│   ├── data/                   # Static content & translation files
│   │   ├── certificates.js     # Certificate records and credentials
│   │   ├── projects.js         # Project showcase definitions & media
│   │   └── translations.js     # Indonesian & English language dictionaries
│   ├── hooks/                  # Custom React hooks
│   │   └── useAudioPlayer.js   # Background audio playback hook
│   ├── styles/                 # Modular CSS stylesheets & variables
│   │   ├── Components.css      # Component-level styles
│   │   ├── Index.css           # Global CSS variables and base tokens
│   │   └── ...                 # Section-specific styles
│   ├── App.jsx                 # Main layout and section assembler
│   └── main.jsx                # Application root entry point
├── .env                        # Environment variables (ignored in git)
├── index.html                  # HTML5 document template & SEO metadata
├── tailwind.config.js          # Tailwind CSS theme configuration
├── vite.config.js              # Vite build setup
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
