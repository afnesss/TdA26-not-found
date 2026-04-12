import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    passWithNoTests: true,
    exclude: ["tests/legacy/**", "node_modules/**", "dist/**"],
    env: {
      RUN_URL: process.env.RUN_URL || "http://localhost:8080",
      API_URL: process.env.API_URL || "http://localhost:8080/api",
    },
  },
});
