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
        border: "var(--border)",
        accent: "var(--accent)",
        signature: "var(--signature)",
        income: "var(--income)",
        expense: "var(--expense)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
      },
    },
  },
  plugins: [],
};

export default config;
