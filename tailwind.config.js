/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Thème clair par défaut, variantes sombres via la classe `dark:`.
        bg:      { DEFAULT: '#f5f6f8', dark: '#0f1115' },
        panel:   { DEFAULT: '#ffffff', dark: '#161a21' },
        panel2:  { DEFAULT: '#f0f2f5', dark: '#1c212a' },
        line:    { DEFAULT: '#e2e5ea', dark: '#262d38' },
        content: { DEFAULT: '#141821', dark: '#e6e9ef' },
        muted:   { DEFAULT: '#6b7280', dark: '#8b94a5' },
        accent:  { DEFAULT: '#5b8cff', strong: '#2f6bff' },
        warn:    '#e3b341',
        danger:  '#f0616d',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        screen: '0 24px 60px rgba(0,0,0,.35)',
        key: '0 4px 0 #000',
        'key-pressed': '0 1px 0 #000',
      },
    },
  },
  plugins: [],
};
