import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs}": ["vp lint", "vp fmt --write"],
  },
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
  },
  lint: {
    rules: {
      "typescript/triple-slash-reference": "off",
    },
    settings: {
      jsdoc: {
        ignoreReplacesDocs: true,
        overrideReplacesDocs: true,
      },
      vitest: {
        typecheck: false,
      },
    },
    env: {
      builtin: true,
    },
    ignorePatterns: ["**/routeTree.gen.ts"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
