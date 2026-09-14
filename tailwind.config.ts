import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F6F8FA",
        },
        border: {
          DEFAULT: "#E4E8EE",
          strong: "#CDD5E0",
        },
        primary: {
          50: "#EBF1FC",
          100: "#D2E1F8",
          200: "#A6C3F1",
          300: "#79A5EA",
          400: "#3F7BDE",
          500: "#1958C1",
          600: "#144A9E",
          700: "#123F8C",
          800: "#0E3170",
          900: "#0A2454",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#5B6472",
          faint: "#8A93A3",
        },
        success: {
          DEFAULT: "#0F9D58",
          bg: "#E7F6EE",
        },
        warning: {
          DEFAULT: "#B7791F",
          bg: "#FBF1DF",
        },
        danger: {
          DEFAULT: "#DC2626",
          bg: "#FCEAEA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
