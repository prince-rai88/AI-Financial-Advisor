/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "#0d0f14",
        "bg-surface": "#111318",
        "bg-elevated": "#1a1d27",
        "border-subtle": "#1e2130",
        accent: "#6c63ff",
        "accent-hover": "#5a52e0",
      },
    },
  },
  plugins: [],
};
