/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
      bold: [ 'Roboto bold', 'sans-serif' ],
      heading: [ 'Roboto Slab', 'sans-serif' ],
      body: [ 'Open Sans', 'sans-serif' ],
    },
    extend: {
      rotate: {
        135: '135deg',
      },
      colors: {
        metropoliaMainOrange: {
          DEFAULT: '#ff5000',
          dark: '#cc4000',
        },
        metropoliaSecondaryOrange: {
          DEFAULT: '#e54b00',
          dark: '#b63b00',
        },
        metropoliaMainGrey: {
          DEFAULT: '#53565a',
          dark: '#2d2e30',
        },
        metropoliaSupportWhite: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
        },
        metropoliaSupportBlack: {
          DEFAULT: '#000000',
          dark: '#111111',
        },
        metropoliaSupportRed: {
          DEFAULT: '#cb2228',
          dark: '#a31b20',
        },
        metropoliaSupportSecondaryRed: {
          DEFAULT: '#e60000',
          dark: '#b30000',
        },
        metropoliaSupportBlue: {
          DEFAULT: '#4046a8',
          dark: '#333886',
        },
        metropoliaSupportYellow: {
          DEFAULT: '#fff000',
          dark: '#ccc000',
        },
        metropoliaTrendPink: {
          DEFAULT: '#e384c4',
          dark: '#b6699d',
        },
        metropoliaTrendLightBlue: {
          DEFAULT: '#5db1e4',
          dark: '#4a8eb6',
        },
        metropoliaTrendGreen: {
          DEFAULT: '#3ba88f',
          dark: '#2f8672',
        },
      },
      animation: {
        spin: 'spin 2s linear infinite',
        backandforth: 'backandforth 60s linear infinite',
      },

      inset: {
        10: '10%',
        20: '20%',
        30: '30%',
        40: '40%',
        50: '50%',
        60: '60%',
        70: '70%',
        80: '80%',
        90: '90%',
        100: '100%',
      },

      keyframes: {
        backandforth: {
          '0%, 100%': {transform: 'translateX(-10%)'},
          '50%': {transform: 'translateX(90%)'},
        },
      },
    },
  },
  plugins: [],
};
