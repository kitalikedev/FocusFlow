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
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'panel-in': {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'panel-out': {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
        },
        'sheet-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'sheet-out': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(100%)' } },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(32px)' },
        },
        'row-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'bar-grow': { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(10px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out backwards',
        'fade-out': 'fade-out 160ms ease-in forwards',
        'panel-in': 'panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'panel-out': 'panel-out 160ms ease-in forwards',
        'sheet-in': 'sheet-in 260ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'sheet-out': 'sheet-out 180ms ease-in forwards',
        'slide-in-right': 'slide-in-right 260ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'slide-out-right': 'slide-out-right 180ms ease-in forwards',
        'row-in': 'row-in 220ms ease-out backwards',
        pop: 'pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        'bar-grow': 'bar-grow 520ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'toast-in': 'toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
      },
      fontFamily: {
        clock: ['var(--font-clock)', 'Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
