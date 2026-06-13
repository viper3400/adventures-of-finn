import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/adventures-of-finn/" : "/",
  server: {
    port: 8080,
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
  },
}));
