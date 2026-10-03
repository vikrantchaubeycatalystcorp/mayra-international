import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 removed `next lint`; ESLint runs directly with the Next flat configs.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Pre-existing debt surfaced when lint was re-enabled (Oct 2026): ~74 explicit
    // \`any\`s and ~65 React Compiler hook findings across 50+ files. Reported as
    // warnings so lint can gate new errors; tighten back to "error" as they are fixed.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", ".claude/**", ".claude-flow/**", ".swarm/**"]),
]);
