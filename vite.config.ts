import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { comlink } from "vite-plugin-comlink";

export default defineConfig({
  plugins: [
    comlink(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  worker: {
    plugins: () => [comlink()],
  },
  test: {
    globals: true,
    testTimeout: 50000,
    environment: "jsdom",
    setupFiles: "./src/test/test-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
