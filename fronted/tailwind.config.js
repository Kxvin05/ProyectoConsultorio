/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#b388d1',      // Púrpura
        secondary: '#4ecdc4',    // Turquesa
        accent: '#ff69b4',       // Rosa
        dark: '#2d2d2d',
        light: '#f5f5f1',
      },
    },
  },
  plugins: [],
}