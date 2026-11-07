import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-solid-color)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          contrast: 'var(--color-accent-contrast)',
        },
        panel: 'var(--panel-bg)',
        capsule: {
          bg: 'var(--capsule-bg)',
          border: 'var(--capsule-border-color)',
        },
      },
      borderRadius: {
        capsule: 'var(--capsule-radius)',
      },
      backdropBlur: {
        capsule: 'var(--capsule-blur)',
        wallpaper: 'var(--bg-blur)',
      },
      fontFamily: {
        clock: ['var(--font-clock)', 'Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
