/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          800: "#27272a",
          850: "#1f1f23",
          900: "#18181b",
          950: "#09090b",
        },
        accent: {
          DEFAULT: "#22d3ee",
          dim: "#0891b2",
          glow: "rgba(34,211,238,0.12)",
        },
        valid: "#4ade80",
        tampered: "#f87171",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
