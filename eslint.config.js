import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "storybook-static/**", "playwright-report/**", "docs/artifacts/**", "src/components/animations/**", "src/hooks/**", "src/lib/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["tools/**/*.mjs"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);
