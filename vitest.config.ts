import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
      "next/headers": path.resolve(rootDir, "./lib/__mocks__/next-headers.ts"),
    },
  },
  test: {
    environment: "node",
    passWithNoTests: true,
  },
});
