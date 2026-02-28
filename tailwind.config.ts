import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#141414",
        "surface-alt": "#1C1C1C",
        border: "#2A2A2A",
        "text-primary": "#FAFAFA",
        "text-secondary": "#888888",
        accent: "#BFFF00",
        "accent-hover": "#D4FF4D",
        error: "#FF4444",
        success: "#44FF88",
      },
      fontFamily: {
        asgardFat: ["Asgard Fat", "var(--font-asgard-fat)", "sans-serif"],
        birdsOfParadise: ["var(--font-birds-of-paradise)", "cursive"],
        sans: [
          "var(--font-brockmann)",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.15s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
