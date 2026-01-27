import next from "eslint-config-next";

const config = [
  // Next.js v16 ships a native flat config; do not wrap it with FlatCompat.
  ...next,
  {
    ignores: [
      "node_modules/**",
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
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    // Loosen a few rules to keep CI/build green while we gradually add types.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;
