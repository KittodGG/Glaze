/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
           100: 'rgba(255, 255, 255, 0.1)',
           200: 'rgba(255, 255, 255, 0.2)',
           300: 'rgba(255, 255, 255, 0.3)',
           400: 'rgba(255, 255, 255, 0.4)',
        }
      },
      fontFamily: {
        heading: ['PlusJakartaSans_700Bold'],
        body: ['PlusJakartaSans_400Regular'],
      }
    },
  },
  plugins: [],
}
