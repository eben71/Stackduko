import { defineConfig } from "vitest/config";
import path from "path";

const root = path.resolve(__dirname);

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        "server/routes.ts",
        "shared/**/*.ts",
        "client/src/lib/**/*.ts",
        "client/src/store/**/*.ts",
        "client/src/logic/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "**/node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "client/src"),
      "@shared": path.resolve(root, "shared"),
    },
  },
});
