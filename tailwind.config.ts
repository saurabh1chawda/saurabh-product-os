import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      colors: {
        ink: "#18211f",
        muted: "#5f6b66",
        line: "#d9dfdc",
        paper: "#f7f8f5",
        panel: "#ffffff",
        accent: "#245c4f",
        "accent-soft": "#e5efeb"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 33, 31, 0.08)"
      }
    }
  },
  plugins: [typography]
};

export default config;
