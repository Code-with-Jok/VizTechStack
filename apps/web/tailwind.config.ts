import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "node-bg": "hsl(var(--node-bg))",
        "node-border": "hsl(var(--node-border))",
        "node-active": "hsl(var(--node-active))",
        "node-completed": "hsl(var(--node-completed))",
        // ─── Viz3D Design System ──────────────────────────────────────────
        // 3D Node colors — used both in Three.js (as hex) and Tailwind (as CSS)
        viz3d: {
          // HTML elements: div, span, p, h1...
          html: {
            DEFAULT: "hsl(var(--viz3d-html))", // #6366f1 indigo
            muted: "hsl(var(--viz3d-html-muted))",
          },
          // Custom React Components: <MyComponent />
          component: {
            DEFAULT: "hsl(var(--viz3d-component))", // #06b6d4 cyan
            muted: "hsl(var(--viz3d-component-muted))",
          },
          // React Hooks: useState, useEffect, useMemo
          hook: {
            DEFAULT: "hsl(var(--viz3d-hook))", // #f59e0b amber
            muted: "hsl(var(--viz3d-hook-muted))",
          },
          // State & Props data nodes
          state: {
            DEFAULT: "hsl(var(--viz3d-state))", // #10b981 emerald
            muted: "hsl(var(--viz3d-state-muted))",
          },
          // Text nodes & annotations
          text: {
            DEFAULT: "hsl(var(--viz3d-text))", // #94a3b8 slate
            muted: "hsl(var(--viz3d-text-muted))",
          },
          // Edge connectors between nodes
          edge: "hsl(var(--viz3d-edge))", // #4f46e5 indigo-dark
          // Pulse animation color (state update signal)
          pulse: "hsl(var(--viz3d-pulse))", // #c084fc purple
          // Canvas background
          canvas: "hsl(var(--viz3d-canvas))", // near black
        },
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
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 20px 8px hsl(var(--primary) / 0.1)" },
        },
        // 3D node pulse (state update signal)
        "pulse-3d": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Floating idle animation for 3D nodes
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        // Data particle traveling along edge
        travel: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-3d": "pulse-3d 0.6s ease-in-out",
        float: "float 3s ease-in-out infinite",
        travel: "travel 1.5s linear infinite",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
