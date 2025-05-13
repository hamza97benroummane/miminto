// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       container: {
//         padding: '1rem', 
//         center: true,
//       }
//     },
//   },
//   plugins: [],
// };
// export default config;


import type { Config } from "tailwindcss";
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      container: {
        padding: "1rem",
        center: true,
      },
      colors: {
        primary: {
          light: "#F9C2E7",
          DEFAULT: "#D63384",
          dark: "#8B008B",
        },
        secondary: {
          light: "#C4B5FD",
          DEFAULT: "#7C3AED",
          dark: "#4C1D95",
        },
        bg: {
          DEFAULT: "#0F0F13",
          overlay: "rgba(0,0,0,0.6)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [
    forms,        // ← ESM imports, no require()
    typography,

  ],
}as import('tailwindcss').Config;

export default config;
