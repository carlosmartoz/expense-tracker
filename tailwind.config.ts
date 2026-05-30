import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b0f1a",
          800: "#111726",
          700: "#1a2233",
          600: "#252f45",
        },
        brand: {
          400: "#7c9cff",
          500: "#5b7cfa",
          600: "#4361ee",
        },
        mint: "#34d399",
        coral: "#fb7185",
        amber: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(8,12,24,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
