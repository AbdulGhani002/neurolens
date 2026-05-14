/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f6fa",
          100: "#e9ebf3",
          200: "#c9cfe0",
          300: "#9aa3c0",
          400: "#6a7497",
          500: "#48527a",
          600: "#343c63",
          700: "#252c4f",
          800: "#181d3a",
          900: "#0c1027",
          950: "#05071a",
        },
        accent: {
          cyan: "#5ee4d4",
          violet: "#a472ff",
          coral: "#ff6f91",
          amber: "#ffc857",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Sora", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(94, 228, 212, 0.25)",
        "glow-violet": "0 0 32px rgba(164, 114, 255, 0.25)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulse_soft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        dash: {
          to: { strokeDashoffset: "-200" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
        "pulse-soft": "pulse_soft 2.5s ease-in-out infinite",
        dash: "dash 6s linear infinite",
      },
    },
  },
  plugins: [],
};
