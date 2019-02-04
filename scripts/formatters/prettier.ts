import path from "path";

export const PRETTIER_VARS = {
    DEFAULT_EXCLUDES: ["node_modules/**"],
    DEFAULT_ARGS: ["**/*.+(js|json|less|scss|css|ts|tsx|md)"],
    FALLBACK_CONFIG: [
        "--config",
        path.join(__dirname, "./configs/prettier.config.js").replace(process.cwd(), "."),
    ],
    FALLBACK_EXCLUDE: [
        "--ignore-path",
        path.join(__dirname, "./configs/.prettierignore").replace(process.cwd(), "."),
    ],
    CONFIG_FILES: [
        "prettier.config.js",
        ".prettierrc.js",
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.yml",
        ".prettierrc.yaml",
        ".prettierrc.toml",
    ],
    PACKAGE_CONFIG_PROP: "prettier",
};
