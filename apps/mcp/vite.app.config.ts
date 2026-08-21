import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite-plus";
import { viteSingleFile } from "vite-plugin-singlefile";

function emitHtmlModule(): Plugin {
  return {
    name: "restaurant-app-html-module",
    enforce: "post" as const,
    generateBundle(_options, bundle) {
      const html = bundle["restaurant-app.html"];

      if (!html || html.type !== "asset" || typeof html.source !== "string") {
        throw new Error("Bundled restaurant-app.html was not found");
      }

      this.emitFile({
        type: "asset",
        fileName: "restaurant-app.js",
        source: `export default ${JSON.stringify(html.source)};\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "restaurant-app.d.ts",
        source: "declare const html: string;\nexport default html;\n",
      });
    },
  };
}

export default defineConfig({
  root: resolve(import.meta.dirname, "src"),
  // vite-plugin-singlefile exposes Vite's Plugin type, while Vite+ wraps its own copy.
  plugins: [tailwindcss(), viteSingleFile() as unknown as Plugin, emitHtmlModule()],
  build: {
    outDir: "../dist/app",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(import.meta.dirname, "src/restaurant-app.html"),
    },
  },
});
