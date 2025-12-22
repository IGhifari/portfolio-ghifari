# Portfolio Ghifari 🚀

A modern, interactive portfolio website built with React and Vite, featuring stunning 3D animations, particle effects, and a premium design aesthetic.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=flat-square&logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-000000?style=flat-square&logo=three.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- **Interactive 3D Elements** - Powered by React Three Fiber and Drei
- **Smooth Animations** - Beautiful transitions using Framer Motion
- **Particle Effects** - Dynamic background using tsparticles
- **Contact Form** - Integrated with EmailJS for direct messaging
- **Responsive Design** - Optimized for all screen sizes
- **Modern UI/UX** - Premium glassmorphism design with dark mode
- **Image Carousel** - Smooth project showcase using Swiper

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS framework

### 3D & Animations
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **@react-three/rapier** - Physics engine
- **Framer Motion** - Animation library
- **OGL** - Lightweight WebGL library

### UI Components
- **React Icons** - Icon library
- **Swiper** - Touch slider
- **TypeIt React** - Typewriter effects
- **React Toastify** - Toast notifications

### Utilities
- **EmailJS** - Email service integration
- **React Scroll** - Smooth scrolling navigation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio-ghifari.git
   cd portfolio-ghifari
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
portfolio-ghifari/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and media
│   ├── components/     # React components
│   │   ├── Certificate.jsx
│   │   ├── Contact.jsx
│   │   ├── ContactMe.jsx
│   │   ├── LastUpdated.jsx
│   │   ├── Navbar.jsx
│   │   ├── Particles.jsx
│   │   ├── Profile.jsx
│   │   ├── Project.jsx
│   │   ├── Skill.jsx
│   │   ├── SoundButton.jsx
│   │   ├── Story.jsx
│   │   └── Timeline.jsx
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # CSS stylesheets
│   ├── App.jsx         # Main application
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## 🌐 Deployment

This project is configured for deployment on **Vercel**. The `vercel.json` file is included for easy deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/portfolio-ghifari)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ghifari**

- GitHub: [@IGhifari](https://github.com/IGhifari)

---

<p align="center">Made with ❤️ and React</p>
