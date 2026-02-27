/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "5r": {
          orange: "#e85d04",
          "orange-hover": "#f48c06",
          "orange-soft": "rgba(232, 93, 4, 0.12)",
          dark: "#1a1a1a",
          "dark-surface": "#252525",
          "dark-border": "#3a3a3a",
        },
      },
    },
  },
  plugins: [],
};
