module.exports = {
  name: 'Unit test',
  testMatch: ['**/__tests__/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: [
    "/node_modules/",
    ".tmp",
    ".cache",
    "/__mocks__/helpers/"
  ],
  testEnvironment: "node",
  transform: {},
  coverageDirectory: "./coverage/",
  collectCoverage: true,
};
