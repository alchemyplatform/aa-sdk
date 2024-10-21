import { withAccountKitUi } from "@account-kit/react/tailwind";
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        brand: "#363FF9",
        background: "hsl(var(--background))",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Demo app colors, not themable at this time
        "demo-bg-toggle-active": "#020617",
        "demo-bg-toggle-inactive": "#94A3B8",
        "demo-bg": "#FFFFFF",
        "demo-nav-bg": "rgba(255, 255, 255, 0.5)",
        "demo-fg-primary": "#020617",
        "demo-fg-secondary": "#475569",
        "demo-surface-secondary": "#EFF4F9",
        "demo-text-success": "#15803D",
        "demo-surface-success": "#16A34A",
        "demo-surface-success-subtle": "#F0FDF4",
        "demo-surface-critical": "#DC2626",
        "demo-surface-critical-subtle": "#FEF2F2",
        "demo-text-critical": "#B91C1C",
        "demo-bg-darkmode": "#4D4D4D",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "ui-loading-light": {
          "0%, 20%, to": { fill: "#cbd5e1" },
          "10%": { fill: "#363ff9" },
        },
        "ui-loading-dark": {
          "0%, 20%, to": { fill: "rgba(255, 255, 255, .5)" },
          "10%": { fill: "#FFFFFF" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ui-loading-dark": "ui-loading-dark 0.8s 0ms ease-out infinite both",
        "ui-loading-light": "ui-loading-light 0.8s 0ms ease-out infinite both",
      },
      backgroundImage: {
        "bg-main": "url('/images/bg-main.png')",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
} satisfies Config;

export default withAccountKitUi(config);
