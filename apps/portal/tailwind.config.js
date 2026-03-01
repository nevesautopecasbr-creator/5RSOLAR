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
          green: "#84cc16",
          "green-soft": "rgba(132, 204, 22, 0.15)",
          dark: "#1a1a1a",
          marine: "#0f172a",
          "dark-surface": "#252525",
          "dark-border": "#334155",
          text: "#f8fafc",
          "text-muted": "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
