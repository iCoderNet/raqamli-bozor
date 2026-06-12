/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        raqamli: {
          primary: '#2563eb',
          'primary-content': '#ffffff',
          secondary: '#7c3aed',
          'secondary-content': '#ffffff',
          accent: '#0891b2',
          'accent-content': '#ffffff',
          neutral: '#1e293b',
          'neutral-content': '#f8fafc',
          'base-100': '#f1f5f9',
          'base-200': '#e2e8f0',
          'base-300': '#cbd5e1',
          'base-content': '#1e293b',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      'dark',
    ],
    defaultTheme: 'raqamli',
  },
}
