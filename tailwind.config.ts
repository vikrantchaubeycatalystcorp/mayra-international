import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0f0a2e 0%, #1e1b4b 25%, #312e81 50%, #4338ca 75%, #6366f1 100%)",
        "hero-mesh":
          "radial-gradient(at 40% 20%, rgba(99,102,241,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(120,119,198,0.25) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(99,102,241,0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(168,85,247,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(79,70,229,0.2) 0px, transparent 50%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.03) 50%, rgba(249,115,22,0.02) 100%)",
        "cta-gradient": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)",
        "orange-gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "premium-gradient":
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "aurora-gradient":
          "linear-gradient(135deg, #6366f1 0%, #a855f7 25%, #ec4899 50%, #f97316 75%, #6366f1 100%)",
        "section-gradient":
          "linear-gradient(180deg, rgba(238,242,255,0.5) 0%, rgba(255,255,255,1) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in-down": "fadeInDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "shimmer-fast": "shimmer 1.5s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "bounce-slow": "bounce 3s infinite",
        ticker: "ticker 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease-in-out infinite",
        "gradient-x": "gradientX 6s ease infinite",
        "in": "fadeIn 0.2s ease-out",
        "slide-in-from-top-2": "slideDown 0.2s ease-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "aurora": "aurora 12s ease-in-out infinite",
        "morph": "morph 8s ease-in-out infinite",
        "stagger-1": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
        "stagger-2": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s forwards",
        "stagger-3": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s forwards",
        "stagger-4": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s forwards",
        "stagger-5": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s forwards",
        "spin-slow": "spin 12s linear infinite",
        "typewriter": "typewriter 3s steps(40) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        gradientX: {
          "0%, 100%": { backgroundSize: "200% 200%", backgroundPosition: "left center" },
          "50%": { backgroundSize: "200% 200%", backgroundPosition: "right center" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.3)" },
        },
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%", backgroundSize: "200% 200%" },
          "25%": { backgroundPosition: "50% 0%", backgroundSize: "250% 250%" },
          "50%": { backgroundPosition: "100% 50%", backgroundSize: "200% 200%" },
          "75%": { backgroundPosition: "50% 100%", backgroundSize: "250% 250%" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 60% / 30% 40% 70% 50%" },
          "75%": { borderRadius: "40% 60% 50% 40% / 60% 50% 30% 70%" },
        },
        typewriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover":
          "0 20px 40px rgba(99,102,241,0.1), 0 8px 16px rgba(0,0,0,0.06)",
        "card-premium":
          "0 4px 20px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "blue-glow": "0 0 60px rgba(99,102,241,0.25)",
        "purple-glow": "0 0 60px rgba(168,85,247,0.25)",
        "orange-glow": "0 0 60px rgba(249,115,22,0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
        "premium": "0 25px 50px -12px rgba(0,0,0,0.15)",
        "premium-lg": "0 35px 60px -15px rgba(0,0,0,0.2)",
        "glass": "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
        "navbar": "0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.03)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};

export default config;
