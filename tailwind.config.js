/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#060a12',
        'bg-soft': '#0b1220',
        fg: '#e7edf7',
        muted: '#93a3bc',
        line: 'rgba(147, 163, 188, 0.2)',
        accent: '#52d6c8',
        'accent-hover': '#7ae6da',
        warm: '#f6b94b',
        panel: 'rgba(9, 15, 27, 0.8)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['"Instrument Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 50s linear infinite',
        'spin-diamond': 'spinDiamond 6s linear infinite',
      },
      keyframes: {
        spinDiamond: {
          to: { transform: 'rotate(405deg)' }
        }
      }
    },
  },
  plugins: [],
}

