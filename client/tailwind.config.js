module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#FFFFFF',
          secondary: '#F8F8F8',
          text: '#1F2937',
          muted: '#6B7280',
          accent: '#4C51BF',
        },
        dark: {
          primary: '#121212',
          secondary: '#1F2937',
          text: '#E5E7EB',
          muted: '#9CA3AF',
          accent: '#6D28D9',
        },
      },
    },
  },
  plugins: [],
};