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
        theme: {
          bg: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          surface: 'var(--surface)',
          'surface-muted': 'var(--surface-muted)',
          'surface-alt': 'var(--surface-alt)',
          'surface-hover': 'var(--surface-hover)',
          primary: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          border: 'var(--border)',
          'border-subtle': 'var(--border-subtle)',
          'border-hover': 'var(--border-hover)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-contrast': 'var(--accent-contrast)',
        },
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
      },
    },
  },
  plugins: [],
}
