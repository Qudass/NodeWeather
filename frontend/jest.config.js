export default {
  testEnvironment: "jsdom",
  transform: {},
  verbose: true,
  moduleFileExtensions: ["js", "json"],
  setupFiles: ["<rootDir>/tests/setupJest.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js",
  },
};
