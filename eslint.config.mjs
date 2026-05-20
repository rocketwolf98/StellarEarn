import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ─── StellarEarn Quality & Security Rules ───────────────────────────────
  // See AGENTS.md §5.2 for rationale on every rule below.
  {
    rules: {
      // ── React / JSX ──────────────────────────────────────────────────────
      // Prevent use of dangerouslySetInnerHTML (XSS risk — OWASP A03)
      "react/no-danger": "error",
      // Require rel="noopener noreferrer" on target="_blank" links
      "react/jsx-no-target-blank": ["error", { enforceDynamicLinks: "always" }],

      // ── TypeScript ───────────────────────────────────────────────────────
      // Ban explicit `any` — use `unknown` + type narrowing instead
      "@typescript-eslint/no-explicit-any": "error",
      // Flag unused variables except those prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Enforce `import type` for type-only imports (cleaner tree-shaking)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // ── Security (OWASP A03) ─────────────────────────────────────────────
      // Prevent eval() and equivalent dynamic code execution
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // ── Best Practices ───────────────────────────────────────────────────
      // Warn on console.log (remove before prod); allow warn/error
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Prefer const; ban var
      "prefer-const": "error",
      "no-var": "error",
      // Require strict equality (=== instead of ==)
      "eqeqeq": ["error", "always", { null: "ignore" }],
      // Disallow dead code (unreachable statements)
      "no-unreachable": "error",
      // Enforce consistent return in functions
      "consistent-return": "warn",
    },
  },
]);

export default eslintConfig;
