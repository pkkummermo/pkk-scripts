import path from "path";

export const ES_LINT_VARS = {
    DEFAULT_EXCLUDES: ["node_modules/**"],
    DEFAULT_ARGS: ["**/*.js", "**/*.ts"],
    CONFIG_FILES: [".eslintrc", ".eslintrc.js", ".eslintrc.json"],
    FALLBACK_CONFIG: [
        "-c",
        path.join(__dirname, "./configs/.eslintrc.js").replace(process.cwd(), "."),
    ],
    PACKAGE_CONFIG_PROP: "eslintConfig",
    RETURN_CODES: {
        OK: 0,
        LINT_ERROR_V5: 1,
        GENERIC_ERROR_V5: 2,
    },
};
