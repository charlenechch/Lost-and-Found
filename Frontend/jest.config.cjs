module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  roots: ["<rootDir>/src"],

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json"
      }
    ]
  },

  moduleFileExtensions: ["ts", "tsx", "js"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy"
  }
};