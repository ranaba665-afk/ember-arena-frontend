/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens for Ember Arena
        ash: {
          950: "#0D0B09", // page background — near-black, warm charcoal (not pure #000)
          900: "#16130F",
          800: "#211C16",
          700: "#332B22",
        },
        ember: {
          500: "#FF5A1F", // primary accent — flame orange-red
          600: "#E8450F",
          400: "#FF7A45",
        },
        gold: {
          400: "#D9A441", // secondary accent — used sparingly (prize pool, live badge)
        },
        bone: {
          100: "#F2ECE3", // primary text on dark background
          400: "#9C9186", // muted/secondary text
        },
      },
      fontFamily: {
        display: ["var(--font-rajdhani)", "sans-serif"], // condensed, angular — headings, numbers
        body: ["var(--font-inter)", "sans-serif"], // body copy, UI labels
      },
      clipPath: {
        slant: "polygon(0 0, 100% 0, 96% 100%, 0% 100%)",
      },
    },
  },
  plugins: [],
};
