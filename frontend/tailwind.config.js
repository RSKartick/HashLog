/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        bg2: "#0a0a0a",
        bg3: "#111111",
        bg4: "#1a1a1a",
        fg: "#f0ece9",
        fg2: "#b8b2ae",
        fg3: "#8a8480",
        fg4: "#5a5654",
        bdr: "#1a1a1a",
        bdr2: "#242424",
        bdr3: "#2e2e2e",
        accent: {
          DEFAULT: "#c9793f",
          dim: "#8a5730",
          glow: "rgba(201,121,63,0.35)",
        },
        valid: {
          DEFAULT: "#10b981",
          dim: "#065f46",
          glow: "rgba(16,185,129,0.25)",
        },
        tampered: {
          DEFAULT: "#ef4444",
          dim: "#7f1d1d",
          glow: "rgba(239,68,68,0.25)",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Geist Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        "accent-glow": "0 0 25px -5px rgba(201, 121, 63, 0.35)",
        "valid-glow": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        "tampered-glow": "0 0 25px -5px rgba(239, 68, 68, 0.35)",
      },
    },
  },
  plugins: [],
};

