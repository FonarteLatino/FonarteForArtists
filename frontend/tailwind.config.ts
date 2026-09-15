import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fonarte: {
          bg: '#090d16',
          card: '#111726',
          cardHover: '#161f33',
          border: '#1e293b',
          borderHighlight: '#334155',
          primary: '#8b5cf6',
          primaryHover: '#7c3aed',
          secondary: '#38bdf8',
          gold: '#f59e0b',
          danger: '#ef4444',
          dangerHover: '#dc2626',
          success: '#10b981',
          textMuted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};
export default config;
