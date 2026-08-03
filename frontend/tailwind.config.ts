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
        background: "var(--background)",
        surface: "var(--surface)",
        accent: "var(--accent)",
        income: "var(--income)",
        expense: "var(--expense)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
