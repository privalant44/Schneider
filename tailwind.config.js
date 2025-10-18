/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'anima-blue': '#1e40af',
        'anima-light-blue': '#3b82f6',
        'anima-dark-blue': '#1e3a8a',
      },
    },
  },
  plugins: [],
}
