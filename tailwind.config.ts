import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // ===========================================
    // BREAKPOINTS
    // Custom breakpoints including xs for small mobile
    // ===========================================
    screens: {
      xs: "475px", // Small mobile
      sm: "640px", // Mobile landscape / small tablet
      md: "768px", // Tablet
      lg: "1024px", // Desktop
      xl: "1280px", // Large desktop
      "2xl": "1536px", // Extra large
    },
    extend: {
      // ===========================================
      // MODERN COLOR SYSTEM
      // Semantic naming with WCAG AA compliant contrasts
      // ===========================================
      colors: {
        // Primary brand color with accessible shades
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // Main primary - passes WCAG AA on white
          600: "#4f46e5", // Darker variant
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Neutral scale for text, backgrounds, borders
        surface: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#22302e",
          950: "#0a0a0a",
        },
        // Semantic status colors
        success: {
          light: "#dcfce7",
          DEFAULT: "#22c55e",
          dark: "#166534",
        },
        warning: {
          light: "#fef3c7",
          DEFAULT: "#f59e0b",
          dark: "#92400e",
        },
        error: {
          light: "#fee2e2",
          DEFAULT: "#ef4444",
          dark: "#991b1b",
        },
        info: {
          light: "#dbeafe",
          DEFAULT: "#3b82f6",
          dark: "#1e40af",
        },
      },

      // ===========================================
      // TYPOGRAPHY
      // Modern type scale (1.25 ratio - Major Third)
      // ===========================================
      fontFamily: {
        sans: [
          "Satoshi",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        heading: ['"Neue Montreal"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Body text scale
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12px
        "2xs": ["0.8125rem", { lineHeight: "1.5" }], // 13px - small UI text
        sm: ["0.875rem", { lineHeight: "1.5" }], // 14px
        nav: ["0.9375rem", { lineHeight: "1.5" }], // 15px - nav text
        base: ["1rem", { lineHeight: "1.6" }], // 16px - base
        lg: ["1.125rem", { lineHeight: "1.6" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.5" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "1.4" }], // 24px
        // Heading scale (Major Third - 1.25)
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }], // 36px
        hero: ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }], // 36px - hero headline (20% smaller)
        "5xl": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 60px
        "7xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 72px
        "8xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.02em" }], // 96px
      },

      // ===========================================
      // SPACING
      // 8px base grid system (modern standard)
      // ===========================================
      spacing: {
        "0.5": "0.125rem", // 2px
        "1": "0.25rem", // 4px
        "1.5": "0.375rem", // 6px
        "2": "0.5rem", // 8px
        "2.5": "0.625rem", // 10px
        "3": "0.75rem", // 12px
        "3.5": "0.875rem", // 14px
        "4": "1rem", // 16px
        "5": "1.25rem", // 20px
        "6": "1.5rem", // 24px
        "6.5": "1.625rem", // 26px - logo height
        "7": "1.75rem", // 28px
        "8": "2rem", // 32px
        "9": "2.25rem", // 36px
        "10": "2.5rem", // 40px
        "11": "2.75rem", // 44px
        "12": "3rem", // 48px
        "14": "3.5rem", // 56px
        "16": "4rem", // 64px
        "15.25": "3.8125rem", // 61px - header height (py-3.5)
        "16.25": "4.0625rem", // 65px - old header height
        "20": "5rem", // 80px
        "24": "6rem", // 96px
        "28": "7rem", // 112px
        "32": "8rem", // 128px
        "36": "9rem", // 144px
        "40": "10rem", // 160px
        "44": "11rem", // 176px
        "48": "12rem", // 192px
        "96": "24rem", // 384px - mobile hero
        "144": "36rem", // 576px - hero height lg
        "160": "40rem", // 640px - hero height xl
      },

      // ===========================================
      // WIDTH/MAX-WIDTH
      // Component-specific widths
      // ===========================================
      width: {
        dropdown: "30rem", // 480px - dropdown menus
      },
      maxWidth: {
        dropdown: "30rem", // 480px
        content: "50rem", // 800px - content width
      },

      // ===========================================
      // BORDER RADIUS
      // Consistent rounded corners
      // ===========================================
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.25rem", // 20px
        "3xl": "1.5rem", // 24px
      },

      // ===========================================
      // SHADOWS
      // Modern subtle shadows for depth
      // ===========================================
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        DEFAULT:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      },

      // ===========================================
      // ANIMATIONS
      // Smooth, purposeful motion
      // ===========================================
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        // Hero slider animations
        "hero-scroll-down": "heroScrollDown 30s linear infinite",
        "hero-scroll-up": "heroScrollUp 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // Hero slider continuous scroll
        heroScrollDown: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        heroScrollUp: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
      },

      // ===========================================
      // TRANSITIONS
      // Consistent timing functions
      // ===========================================
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "ease-in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [
    // Animation play state utilities
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".animation-paused": {
          "animation-play-state": "paused",
        },
        ".animation-running": {
          "animation-play-state": "running",
        },
      });
    }),
  ],
};

export default config;
