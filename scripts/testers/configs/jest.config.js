module.exports = {
    moduleDirectories: [
        "node_modules",
        "src"
    ],
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/?(*.)+(spec).(ts|js)?(x)"],
    coverageDirectory: "<rootDir>/test/coverage-jest",
    coverageReporters: [
        "json",
        "lcov",
        "text",
        "html"
    ]
};
