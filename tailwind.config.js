/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette A: Deep Trust / Warm Sand
        navy: '#1B3C53',
        'navy-light': '#234C6A',
        slate: '#456882',
        sand: '#D2C1B6',
        // Palette B: Retro Sage & Arcade Neon
        'light-sage': '#EBF4DD',
        sage: '#90AB8B',
        forest: '#5A7863',
        charcoal: '#3B4953',
        moss: '#5B7E3C',
        chroma: '#A2CB8B',
        neon: '#E8F5BD',
        ruby: '#C44545',
      },
      fontFamily: {
        display: ['Platypi', 'Georgia', 'serif'],
        slab: ['Roboto Slab', 'Georgia', 'serif'],
        ui: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        apple: '1.5rem',
        'apple-lg': '2rem',
      },
      boxShadow: {
        arcade: '4px 4px 0px 0px rgba(59, 73, 83, 1)',
        'arcade-dark': '4px 4px 0px 0px rgba(162, 203, 139, 1)',
        'arcade-sm': '2px 2px 0px 0px rgba(59, 73, 83, 1)',
        'arcade-lg': '6px 6px 0px 0px rgba(59, 73, 83, 1)',
      },
    },
  },
  plugins: [],
};
