import { defineConfig } from "vite";;

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  define: {
    "process.platform": JSON.stringify(process.platform),
    "process.env.IS_PREACT": JSON.stringify("true"),
  },
});