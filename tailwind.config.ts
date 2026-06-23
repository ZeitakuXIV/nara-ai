import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flattened for maximum compatibility with PostCSS/Next.js
        "nara-hunter": "#3D644D",
        "nara-hunter-light": "#5A8B6A",
        "nara-evergreen": "#223E2F",
        "nara-emerald": "#10B981", 
        "nara-light": "#F0F4F2", 
        "nara-paper": "#FFFFFF",
        "nara-text": "#1E293B",
        "nara-muted": "#64748B",
      },
      animation: {
        'blob': "blob 7s infinite",
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
