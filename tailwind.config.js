/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        grotesk: ['"Geist Variable"', 'Geist', 'Inter', '"Space Grotesk"', 'sans-serif'],
        mono: ['"Geist Mono Variable"', '"Geist Mono"', '"JetBrains Mono"', '"Space Mono"', 'monospace'],
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
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
    },
  },
  plugins: [],
}
