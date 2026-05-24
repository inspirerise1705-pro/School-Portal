import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", 'serif'],
        body: ['Barlow', 'sans-serif'],
      },
      boxShadow: {
        'glass-soft': '0 25px 120px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
