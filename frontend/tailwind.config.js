/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'viettin-dark': '#0f172a',
        'viettin-accent': '#38bdf8',
        'viettin-purple': '#c084fc',
      }
    },
  },
  plugins: [],
}
