// import { indigo } from '@mui/material/colors';

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   darkMode: 'class',
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ["Inter", "Poppins", "sans-serif"],
//       },
//       animation: {
//         'pulse-short': 'pulse-short 2s infinite',
//         'fade-in': 'fade-in 0.5s ease-out',
//         'slide-in': 'slide-in 0.3s ease-out',
//       },
//       keyframes: {
//         'pulse-short': {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.7' },
//         },
//         'fade-in': {
//           '0%': { opacity: '0' },
//           '100%': { opacity: '1' },
//         },
//         'slide-in': {
//           '0%': { transform: 'translateY(-10px)', opacity: '0' },
//           '100%': { transform: 'translateY(0)', opacity: '1' },
//         },
//       },
//       colors: {
//         // Light theme colors
//         light: {
//           primary: {
//             50: '#f5f3ff',
//             100: '#e0e7ff',
//             200: '#c7d2fe',
//             300: '#a5b4fc',
//             400: '#818cf8',
//             500: '#6366f1',
//             600: '#4f46e5',
//             700: '#4338ca',
//             800: '#3730a3',
//             900: '#312e81',
//           },
//           background: {
//             primary: '#ffffff',
//             secondary: '#f8fafc',
//             tertiary: '#f1f5f9',
//           },
//           text: {
//             primary: '#1f2937',
//             secondary: '#374151',
//             tertiary: '#6b7280',
//           },
//           border: {
//             light: '#e5e7eb',
//             medium: '#d1d5db',
//             dark: '#9ca3af',
//           },
//         },
//         // Dark theme colors
//         dark: {
//           primary: {
//             50: '#f8fafc',
//             100: '#f1f5f9',
//             200: '#e2e8f0',
//             300: '#cbd5e1',
//             400: '#94a3b8',
//             500: '#64748b',
//             600: '#475569',
//             700: '#334155',
//             800: '#1e293b',
//             900: '#0f172a',
//           },
//           background: {
//             primary: '#111827',
//             secondary: '#1f2937',
//             tertiary: '#374151',
//           },
//           text: {
//             primary: '#f9fafb',
//             secondary: '#e5e7eb',
//             tertiary: '#d1d5db',
//           },
//           border: {
//             light: '#374151',
//             medium: '#4b5563',
//             dark: '#6b7280',
//           },
//         },
//         // Functional colors (work in both themes)
//         success: {
//           50: '#f0fdf4',
//           100: '#dcfce7',
//           500: '#22c55e',
//           600: '#16a34a',
//           700: '#15803d',
//         },
//         warning: {
//           50: '#fffbeb',
//           100: '#fef3c7',
//           500: '#f59e0b',
//           600: '#d97706',
//           700: '#b45309',
//         },
//         error: {
//           50: '#fef2f2',
//           100: '#fee2e2',
//           500: '#ef4444',
//           600: '#dc2626',
//           700: '#b91c1c',
//         },
//         // MUI indigo integration
//         indigo: {
//           50: indigo[50],
//           100: indigo[100],
//           200: indigo[200],
//           300: indigo[300],
//           400: indigo[400],
//           500: indigo[500],
//           600: indigo[600],
//           700: indigo[700],
//           800: indigo[800],
//           900: indigo[900],
//         },
//       },
//       // Custom utilities for theme transitions
//       transitionProperty: {
//         'theme': 'color, background-color, border-color, fill, stroke',
//       }
//     },
//   },
//   plugins: [],
// }





import { indigo, amber, cyan, emerald, rose } from '@mui/material/colors';

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
        'glow': 'glow 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
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
        'glow': {
          '0%': { 
            boxShadow: '0 0 20px -10px rgba(79, 70, 229, 0.3)',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 30px -5px rgba(79, 70, 229, 0.6)',
            transform: 'scale(1.01)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      colors: {
        // Enhanced Light theme colors
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
        // Enhanced Dark theme colors matching AdminProfile aesthetic
        dark: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          background: {
            primary: 'rgb(17, 24, 39)', // gray-900
            secondary: 'rgb(31, 41, 55)', // gray-800
            tertiary: 'rgb(55, 65, 81)', // gray-700
            accent: 'rgb(49, 46, 129)', // indigo-900
          },
          surface: {
            primary: 'rgba(31, 41, 55, 0.8)',
            secondary: 'rgba(55, 65, 81, 0.6)',
            elevated: 'rgba(49, 46, 129, 0.2)',
            glass: 'rgba(30, 41, 59, 0.7)',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#e2e8f0',
            tertiary: '#cbd5e1',
            accent: '#93c5fd',
          },
          border: {
            light: 'rgba(255, 255, 255, 0.1)',
            medium: 'rgba(255, 255, 255, 0.2)',
            dark: 'rgba(255, 255, 255, 0.3)',
            glow: 'rgba(99, 102, 241, 0.5)',
          },
          gradient: {
            from: 'rgb(17, 24, 39)', // gray-900
            to: 'rgb(49, 46, 129)', // indigo-900
            via: 'rgb(30, 41, 59)', // slate-900
          },
        },
        // Functional colors
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
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, rgb(17, 24, 39) 0%, rgb(30, 41, 59) 50%, rgb(49, 46, 129) 100%)',
        'dark-gradient-shift': 'linear-gradient(135deg, rgb(17, 24, 39), rgb(30, 41, 59), rgb(49, 46, 129), rgb(30, 41, 59), rgb(17, 24, 39))',
        'glass-gradient': 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.6))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'radial-glow': 'radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
      },
      transitionProperty: {
        'theme': 'color, background-color, border-color, fill, stroke, box-shadow, transform, filter, backdrop-filter',
        'colors': 'color, background-color, border-color, fill, stroke',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px -10px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
        'depth': '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}