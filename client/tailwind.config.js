/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: 'var(--color-surface-page)',
          card: 'var(--color-surface-card)',
          raised: 'var(--color-surface-raised)',
          muted: 'var(--color-surface-muted)',
        },
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          'on-action': 'var(--color-text-on-action)',
          link: 'var(--color-text-link)',
        },
        brand: {
          DEFAULT: 'var(--color-action-primary)',
          hover: 'var(--color-action-primary-hover)',
          active: 'var(--color-action-primary-active)',
        },
        destructive: {
          DEFAULT: 'var(--color-action-destructive)',
          hover: 'var(--color-action-destructive-hover)',
          active: 'var(--color-action-destructive-active)',
        },
        line: {
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
          error: 'var(--color-border-error)',
        },
        feedback: {
          success: 'var(--color-feedback-success)',
          warning: 'var(--color-feedback-warning)',
          error: 'var(--color-feedback-error)',
          info: 'var(--color-feedback-info)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
};
