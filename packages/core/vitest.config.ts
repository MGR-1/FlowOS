import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // models/onboarding.ts imports `colors` from the @flowos/ui-shared
      // barrel, which also re-exports components — those import react-native,
      // whose index.js is Flow-typed and cannot be parsed under Node. Point
      // tests at the tokens entry instead: same `colors`, no native code.
      "@flowos/ui-shared": fileURLToPath(
        new URL("../ui-shared/src/tokens/index.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/supabase/**", "src/models/**"],
      exclude: ["src/**/*.test.ts"],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
});
