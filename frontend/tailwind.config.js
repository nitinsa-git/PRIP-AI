/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          void: '#07090e',
          card: '#0f141f',
          surface: '#171e2e',
          border: '#222d42',
          cyan: '#00f0ff',
          neon: '#00ff9d',
          violet: '#9d4edd',
          amber: '#ffaa00',
          danger: '#ff3366',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'glow-neon': '0 0 20px -3px rgba(0, 255, 157, 0.35)',
        'glow-violet': '0 0 20px -3px rgba(157, 78, 221, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(255, 170, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
