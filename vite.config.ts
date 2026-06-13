import { defineConfig } from "vitest/config";

import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/adventures-of-finn/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.APP_VERSION ?? `v${packageJson.version}`,
    ),
  },
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
