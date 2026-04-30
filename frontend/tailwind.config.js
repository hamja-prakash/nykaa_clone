/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        nykaa: {
          pink: '#fc2779',
          'pink-dark': '#e01f6a',
          'pink-light': '#ffe0ef',
          'pink-pale': '#fff5f9',
          gold: '#c5a028',
          dark: '#1a1a1a',
          gray: '#666666',
          'light-gray': '#f5f5f5',
          border: '#e8e8e8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
