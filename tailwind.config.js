/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        severe: '#E24B4A', // red
        moderate: '#EF9F27', // amber
        low: '#639922', // green
        highlight: '#378ADD', // blue
        neutral: '#888780', // gray
      },
      borderWidth: {
        '0.5': '0.5px',
      },
    },
  },
  plugins: [],
};
