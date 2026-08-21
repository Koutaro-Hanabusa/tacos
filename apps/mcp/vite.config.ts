import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "./src/index.ts",
    format: "esm",
    outDir: "./dist/server",
    clean: true,
    deps: {
      alwaysBundle: [/@tacos\/.*/],
    },
  },
});
