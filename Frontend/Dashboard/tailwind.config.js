// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ["Inter", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// }

import { indigo } from '@mui/material/colors';




/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'pulse-short': 'pulse-short 2s infinite',
      },
      keyframes: {
        'pulse-short': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      colors: {
        indigo: {
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        violet: {
          100: '#f5f3ff',
        }
      }
    },
  },
  plugins: [],
}