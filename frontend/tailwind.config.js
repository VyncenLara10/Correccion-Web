/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          500: '#0066FF',
          600: '#0052CC',
        },
        success: {
          DEFAULT: '#00C853',
        },
        danger: {
          DEFAULT: '#FF3B30',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}