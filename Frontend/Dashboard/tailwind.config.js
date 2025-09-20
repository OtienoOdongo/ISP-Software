import { indigo } from '@mui/material/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      animation: {
        'pulse-short': 'pulse-short 2s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-short': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        // Light theme colors
        light: {
          primary: {
            50: '#f5f3ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
          },
          background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
          },
          text: {
            primary: '#1f2937',
            secondary: '#374151',
            tertiary: '#6b7280',
          },
          border: {
            light: '#e5e7eb',
            medium: '#d1d5db',
            dark: '#9ca3af',
          },
        },
        // Dark theme colors
        dark: {
          primary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
          background: {
            primary: '#111827',
            secondary: '#1f2937',
            tertiary: '#374151',
          },
          text: {
            primary: '#f9fafb',
            secondary: '#e5e7eb',
            tertiary: '#d1d5db',
          },
          border: {
            light: '#374151',
            medium: '#4b5563',
            dark: '#6b7280',
          },
        },
        // Functional colors (work in both themes)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // MUI indigo integration
        indigo: {
          50: indigo[50],
          100: indigo[100],
          200: indigo[200],
          300: indigo[300],
          400: indigo[400],
          500: indigo[500],
          600: indigo[600],
          700: indigo[700],
          800: indigo[800],
          900: indigo[900],
        },
      },
      // Custom utilities for theme transitions
      transitionProperty: {
        'theme': 'color, background-color, border-color, fill, stroke',
      }
    },
  },
  plugins: [],
}