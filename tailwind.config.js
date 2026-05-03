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
          cream: '#FFFBF0',
          yellow: '#FFE500',
          red: '#FF3B3B',
          black: '#0a0a0a',
          white: '#FFFFFF',
        }
      },
      boxShadow: {
        'nb': '4px 4px 0px #0a0a0a',
        'nb-lg': '6px 6px 0px #0a0a0a',
        'nb-xl': '8px 8px 0px #0a0a0a',
        'nb-hover': '2px 2px 0px #0a0a0a',
        'nb-yellow': '4px 4px 0px #FFE500',
        'nb-red': '4px 4px 0px #FF3B3B',
      },
    },
  },
  plugins: [],
}