import path from "path";

export const TS_LINT_VARS = {
    DEFAULT_EXCLUDES: ["node_modules/**"],
    DEFAULT_ARGS: ["--project", "."],
    FALLBACK_CONFIG: ["-c", path.join(__dirname, "./configs/tslint.json").replace(process.cwd(), ".")],
    CONFIG_FILES: ["tslint.json", "tslint.yml"],
};
