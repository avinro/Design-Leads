import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // server-only throws at import time in server component tests.
      // Replace with an empty stub so Vitest can import server modules.
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
    },
  },
});
