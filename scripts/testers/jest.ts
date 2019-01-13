import path from "path";

export const JEST_VARS = {
    DEFAULT_ARGS: [],
    DEFAULT_TEST_FILE_PATTERN_GLOB: "**/*spec.+(ts|js)",
    FALLBACK_CONFIG: path.join(__dirname, "./configs/jest.config.js").replace(process.cwd(), "."),
    CONFIG_FILES: ["jest.config.js", "jest.config.json"],
    PACKAGE_CONFIG_PROP: "jest",
};
