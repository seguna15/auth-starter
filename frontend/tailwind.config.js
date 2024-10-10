/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        nunitoSans: ["Nunito Sans", "system-ui"],
        lato: ["Lato", "system - ui"],
      },
    },
  },
  plugins: [],
};

