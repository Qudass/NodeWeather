import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/**",
      "frontend/vendor/**",
      "frontend/commits.log",
      "**/*.html",
    ],
  },

  js.configs.recommended,

  {
    files: ["frontend/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        confirm: "readonly",
        $: "readonly",
        jQuery: "readonly",
      },
    },
  },

  {
    files: ["frontend/tests/**/*.test.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
      },
    },
  },

  {
    files: ["backend/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
];
