/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        nb: {
          cream: 'var(--nb-cream)',
          yellow: 'var(--nb-yellow)',
          red: 'var(--nb-red)',
          black: 'var(--nb-black)',
          white: 'var(--nb-white)',
          ink: 'var(--nb-ink)',
          muted: 'var(--nb-muted)',
          line: 'var(--nb-line)',
        }
      },
      boxShadow: {
        'nb': 'var(--nb-shadow)',
        'nb-lg': 'var(--nb-shadow-lg)',
        'nb-xl': '8px 8px 0px var(--nb-shadow-color)',
        'nb-hover': 'var(--nb-shadow-hover)',
        'nb-yellow': '4px 4px 0px var(--nb-yellow)',
        'nb-red': '4px 4px 0px var(--nb-red)',
      },
    },
  },
  plugins: [],
}
