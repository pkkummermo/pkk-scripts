import path from "path";

export const JEST_VARS = {
    DEFAULT_ARGS: [],
    FALLBACK_CONFIG: path.join(__dirname, "./configs/jest.config.js").replace(process.cwd(), "."),
    CONFIG_FILES: ["jest.config.js", "jest.config.json"],
    PACKAGE_CONFIG_PROP: "jest",
};
