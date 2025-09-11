// tailwind.config.js
module.exports = {
  darkMode: "class", // Enable dark mode via class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can define custom colors here for both light and dark modes
      colors: {
        light: { // Light mode palette
          primary: '#FFFFFF', // White background
          secondary: '#F8F8F8', // Lighter background for surfaces
          text: '#1F2937', // Dark gray for text
          muted: '#6B7280', // Muted gray for secondary text
          accent: '#4C51BF', // A primary accent color
        },
        dark: { // Dark mode palette
          primary: '#121212', // Very dark gray for main background
          secondary: '#1F2937', // Slightly lighter dark gray for surfaces
          text: '#E5E7EB', // Off-white for text
          muted: '#9CA3AF', // Lighter muted gray for secondary text
          accent: '#6D28D9', // A vibrant purple accent
        },
      },
    },
  },
  plugins: [],
};