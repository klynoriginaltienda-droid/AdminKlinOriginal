export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#0f0f0f',
        surface2: '#181818',
        surfaceHover: '#222222',
        bdr: '#262626',
        accent: '#c8f060',
        accentHover: '#b4d856',
        danger: '#ff4d4d',
        textMain: '#e8e4dc',
        textMuted: '#88827c',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}