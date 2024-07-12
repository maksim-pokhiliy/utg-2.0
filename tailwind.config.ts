import type { Config } from "tailwindcss";
import flowbite from "flowbite-react/tailwind";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        "yellow-100": "#ffc657",
        "blue-100": "#5362ac",
        "white-15": "rgba(255,255,255,0.15)",
        "custom-1": "#FFF9F6",
        site: "rgb(255,249,246)",
      },
      fontSize: {
        12: "12px",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade 3s ease-in-out",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
export default config;
