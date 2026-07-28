import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta CineProx (violeta de marca #901CEB)
        brand: {
          50: "#F5EBFE",
          100: "#EAD6FD",
          200: "#D4AEFB",
          300: "#BB82F7",
          400: "#A550F1",
          500: "#901CEB",
          600: "#7B12CE",
          700: "#620FA3",
          800: "#4B0C7D",
          900: "#360A59",
        },
      },
    },
  },
  plugins: [],
};
export default config;
