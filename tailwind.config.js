/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PASSORA design tokens
        bg: {
          DEFAULT: '#f8fafc',
          2: '#f1f5f9',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8fafc',
          3: '#f1f5f9',
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          glow: 'rgba(59,130,246,0.25)',
        },
        accent: {
          DEFAULT: '#10b981',
          glow: 'rgba(16,185,129,0.2)',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        cbam: {
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          amber: '#f59e0b',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        primary: '0 0 24px rgba(59,130,246,0.3)',
        accent: '0 0 24px rgba(16,185,129,0.25)',
        glow: '0 4px 20px rgba(59,130,246,0.5)',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'grad-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'grad-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'grad-hero': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #ffffff 100%)',
      },
      borderColor: {
        subtle: 'rgba(0,0,0,0.08)',
        medium: 'rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.25)' },
          '50%':       { boxShadow: '0 0 24px rgba(59,130,246,0.4)' },
        },
      },
    },
  },
  plugins: [],
}
