import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // TechVaults Brand Colors
        tva: {
          red:       "#bc0004",
          "red-dk":  "#a00003",
          "red-lt":  "#ffdad6",
          "red-xlt": "#fff0ef",
          "on-red":  "#ffffff",
          ink:       "#201a1a",
          "ink-m":   "#6b4f4f",
          surface:   "#f7f2f2",
          "surface-0":"#ffffff",
          border:    "#ddc8c8",
          success:   "#1da851",
          "success-lt":"#d4f5e2",
          warn:      "#f59e0b",
          "warn-lt": "#fef3c7",
          error:     "#e53935",
          "error-lt":"#fde8e8",
          info:      "#2563eb",
          "info-lt": "#dbeafe",
          online:    "#69f0ae",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "Arial", "sans-serif"],
      },
      borderRadius: {
        "4":  "4px",
        "8":  "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
      },
      boxShadow: {
        sm:  "0 1px 3px rgba(32,26,26,.08), 0 1px 2px rgba(32,26,26,.04)",
        md:  "0 4px 12px rgba(32,26,26,.10), 0 2px 4px rgba(32,26,26,.06)",
        lg:  "0 10px 32px rgba(32,26,26,.14), 0 4px 8px rgba(32,26,26,.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease",
        "slide-up": "slideUp 0.2s ease",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
