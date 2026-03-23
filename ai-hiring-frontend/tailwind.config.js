/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          red:       '#CA1D24',
          'red-dark':'#7E1519',
          'red-mid': '#A81920',
          'red-light':'#F8E8E9',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f1f5f9',
          border:  '#e2e8f0',
        },
        ink: {
          DEFAULT: '#1e293b',
          muted:   '#64748b',
          faint:   '#94a3b8',
        },
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        nav:   '0 2px 8px 0 rgba(0,0,0,.10)',
        focus: '0 0 0 3px rgba(202,29,36,.25)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
