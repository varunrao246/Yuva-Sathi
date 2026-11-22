/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#E9E1D3',
        },
        forest: {
          50: '#EBF4EE',
          100: '#D2E6D8',
          200: '#A6CFB4',
          500: '#2D6A4F',
          600: '#1E5139',
          700: '#143E2B',
          800: '#0F2F20',
          900: '#0A2016',
        },
        lime: {
          300: '#D9F99D',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        charcoal: {
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
