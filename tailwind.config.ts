import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './apps/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
    './user-frontend/**/*.{ts,tsx}',
    './admin-frontend/**/*.{ts,tsx}',
    './landing-page/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f9f9',
          100: '#d9f2f1',
          200: '#b3e5e3',
          300: '#66d4d0',
          400: '#33c4be',
          500: '#00A19B',
          600: '#008A85',
          700: '#007370',
          800: '#006460',
          900: '#003D3B',
        },
        accent: {
          500: '#00A19B',
          600: '#008A85',
        },
        latte: {
          50:  '#FAF8F5',
          100: '#F5F1EB',
          200: '#EDE8E0',
          300: '#E4DDD3',
          400: '#D4CCC1',
          500: '#B8AFA3',
          600: '#9C958E',
          700: '#6B6560',
          800: '#3D3833',
          900: '#2D2A26',
        },
        surface: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary:  'var(--bg-tertiary)',
          accent:    'var(--bg-accent)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
    },
  },
}

export default config
