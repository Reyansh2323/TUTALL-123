/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tutall-navy': '#1B3C53',     // Deep Navy
        'tutall-steel': '#234C6A',    // Steel Blue
        'tutall-slate': '#456882',    // Muted Slate
        'tutall-sand': '#D2C1B6',     // Warm Sand
        'tutall-light-sage': '#EBF4DD', // Light Sage
        'tutall-sage': '#90AB8B',       // Muted Sage
        'tutall-forest': '#5A7863',    // Deep Forest
        'tutall-charcoal': '#3B4953',  // Charcoal
      },
      borderRadius: {
        'apple': '1.5rem', // 24px
        'apple-lg': '2rem', // 32px
      }
    },
  },
  plugins: [],
}
