/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: ["storage.js"],
  testRunner: "command",
  commandRunner: {
    command: "npm test"
  },
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "off"
};
