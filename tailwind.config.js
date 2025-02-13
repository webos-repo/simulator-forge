// tailwind.config.js
const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [heroui()],
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        LGSmart2: ["LGSmart2"],
      },
      colors: {
        simul: {
          card: {
            bg: "#82888c",
            tx: "#e6e6e6",
          },
        },
      },
    },
  },
};
