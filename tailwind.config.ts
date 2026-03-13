import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)',
        button: '0 4px 14px rgba(37,99,235,0.35)',
        glass: '0 8px 32px rgba(31,38,135,0.08)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
