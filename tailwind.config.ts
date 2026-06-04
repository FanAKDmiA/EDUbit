import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mint: "#2fbf9f",
        coral: "#f07057",
        gold: "#f4b740"
      }
    }
  },
  plugins: []
};

export default config;
