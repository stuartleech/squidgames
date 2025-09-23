module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['var(--font-orbitron)', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#f9c413', // Margate Krakens Yellow
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        krakens: {
          yellow: '#f9c413',
          pink: '#d80e61',
          dark: '#1f2937',
        },
        football: {
          green: '#4ade80',
          dark: '#1f2937',
          gold: '#fbbf24',
        }
      },
    },
  },
  plugins: [],
}
