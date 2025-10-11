import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // non-code files
      "*.md",
      "**/*.md",
      "*.json",
      "**/*.json",
      "*.yml",
      "*.yaml",
      ".dockerignore",
      "Dockerfile",
      "Dockerfile*",
      ".env",
      ".env.*",
      "!/.env.example",
    ],
    // Loosen a few rules to keep CI/build green while we gradually add types.
    // We still surface them as warnings in the Problems panel.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
