import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pure-white': '#ffffff',
        'light-surface': '#f4f5f6',
        'teal-accent': '#7ed7cc',
        'yellow-accent': '#ffdc39',
        'deep-indigo': '#272666',
        'muted-indigo': '#747198',
        'pale-indigo': '#aeacc3',
        'rich-black': '#000000',
        background: '#f4f5f6',
        foreground: '#272666',
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-sora)', 'sans-serif'],
      },
      borderRadius: {
        'pill-full': '99999px',
        'pill-large': '101px',
        'pill-100': '100px',
        'card-xl': '35px',
        'card-lg': '24px',
        'card-md': '20px',
        'card-sm': '16px',
      },
      boxShadow: {
        'card-default': '0px 4px 16px 0px rgba(39, 38, 102, 0.08)',
        'card-elevated': '0px 8px 30px 0px rgba(39, 38, 102, 0.12)',
        'overlay-lift': '0px 12px 36px 0px rgba(39, 38, 102, 0.15)',
        'cta-yellow': '0 0 0 3px #ffdc39',
        'cta-teal': '0 0 0 3px #7ed7cc',
      },
      letterSpacing: {
        'tight-hero': '-2.16px',
        'tight-section': '-1.32px',
        'tight-card': '-0.96px',
        'tight-body': '-0.48px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
