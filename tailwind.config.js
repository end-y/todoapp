/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],

  // Dinamik class'ları korumak için safelist
  safelist: [
    'bg-purple',
    'bg-blue',
    'bg-pink',
    'bg-green',
    'bg-yellow',
    'bg-peach',
    'text-purple',
    'text-blue',
    'text-pink',
    'text-green',
    'text-yellow',
    'text-peach',
  ],
  theme: {
    extend: {
      colors: {
        // Light Colors (default)
        background: '#F5F5F5',
        textPrimary: '#2C3E50',
        blue: '#7FB3D5',
        pink: '#F1948A',
        green: '#82E0AA',
        purple: '#BB8FCE',
        yellow: '#F7DC6F',
        peach: '#FAD7A0',

        // Dark Colors (for dark mode)
        dark: {
          background: '#212F3D',
          textPrimary: '#EAF2F8',
          blue: '#5D8AA8',
          pink: '#BF6F6F',
          green: '#5FA38F',
          purple: '#9B59B6',
          yellow: '#F1C40F',
          peach: '#D35400',
        },
      },
    },
  },
  plugins: [],
};
