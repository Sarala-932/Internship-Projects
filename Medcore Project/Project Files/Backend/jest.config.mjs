export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup.mjs"],
  moduleFileExtensions: ["js", "mjs"],
  testMatch: ["**/tests/**/*.test.mjs"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
