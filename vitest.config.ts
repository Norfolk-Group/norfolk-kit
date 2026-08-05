import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": path.join(root, "src") } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts", "tests/motion/**/*.test.ts", "tests/artifacts/**/*.test.ts", "tests/auth/**/*.test.ts", "tests/kit-guard/**/*.test.ts"],
    exclude: ["tests/integration/production-start.test.ts"],
    coverage: { provider: "v8", reporter: ["text", "json-summary"] },
  },
});
