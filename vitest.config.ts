import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

const SERVER_ONLY_SERVER_BUILD =
  "./node_modules/next/dist/compiled/server-only/empty.js";

const NODE_INCLUDE = ["tests/**/*.{test,spec}.{ts,tsx}"];
const NODE_EXCLUDE = ["tests/**/*.dom.{test,spec}.{ts,tsx}"];
const DOM_INCLUDE = ["tests/**/*.dom.{test,spec}.{ts,tsx}"];
const DOM_SETUP = ["./tests/setup/dom.ts"];

export default defineConfig({
  resolve: {
    alias: {
      "@root": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL(SERVER_ONLY_SERVER_BUILD, import.meta.url)
      ),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: NODE_INCLUDE,
          exclude: [...configDefaults.exclude, ...NODE_EXCLUDE],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: DOM_SETUP,
          include: DOM_INCLUDE,
        },
      },
    ],
  },
});
