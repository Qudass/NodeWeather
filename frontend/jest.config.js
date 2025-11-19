export default {
  testEnvironment: "jsdom",
  transform: {},
  verbose: true,
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setupJest.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js",
  },
};
