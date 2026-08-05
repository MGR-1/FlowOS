import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/supabase/**", "src/models/**"],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
});
