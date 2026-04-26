/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pass-blue': '#EBF4FF',
        'pass-purple': '#F5F3FF',
        'pass-brand-blue': '#3B82F6',
        'pass-brand-purple': '#8B5CF6',
      },
    },
  },
  plugins: [],
}
