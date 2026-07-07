/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F4F7F6',
          panel: '#FFFFFF',
          ink: '#1F2E2B',
          'ink-soft': '#63736E',
          line: '#E2E8E5',
          teal: '#2A7A64',
          'teal-dark': '#1A5444',
          'teal-light': '#E8F2EF',
          psi: '#8C66D8',
          'psi-bg': '#F4F0FC',
          social: '#3B9968',
          'social-bg': '#EAF6F0',
          peda: '#D4892A',
          'peda-bg': '#FCF4E8',
          danger: '#C0472B',
          'danger-bg': '#FDF0ED',
        }
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        public: ['Public Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
