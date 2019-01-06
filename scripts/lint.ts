import spawn from "cross-spawn";
import glob from "glob";
import ora from "ora";
import util from "util";

const globPromise = util.promisify(glob);

import { hasOneOfFiles, resolveBin, spawnProcessPromise } from "../util";
import { ES_LINT_VARS } from "./linters/eslint";
import { TS_LINT_VARS } from "./linters/tslint";

const lintTypeScript = async (args: string[]) => {
    const hasTSLintConfig = hasOneOfFiles(TS_LINT_VARS.CONFIG_FILES);
    const tsLintConfig = hasTSLintConfig ? [] : TS_LINT_VARS.FALLBACK_CONFIG;

    console.debug("Chosen tslintconfig", tsLintConfig);
    console.debug("Running TSLint with", [...TS_LINT_VARS.DEFAULT_ARGS, ...tsLintConfig, ...args]);

    const exitCode = await spawnProcessPromise(spawn(
        resolveBin("tslint"),
        [...TS_LINT_VARS.DEFAULT_ARGS, ...tsLintConfig, ...args],
        { stdio: "inherit" },
    ));
    if (exitCode !== 0) {
        throw new Error("There were lint errors");
    }
};

const lintJavaScript = async (args: string[]) => {
    const hasESLintConfig = hasOneOfFiles(ES_LINT_VARS.CONFIG_FILES);
    const esLintConfig = hasESLintConfig ? [] : ES_LINT_VARS.FALLBACK_CONFIG;

    if (!hasESLintConfig) {
        const globRes = await globPromise(ES_LINT_VARS.DEFAULT_ARGS[0], { ignore: ["node_modules/**/*"] });
        if (globRes.length === 0) {
            return;
        }
    }
    console.debug("Chosen tslintconfig", esLintConfig);
    console.debug("Running ESLint with", [...ES_LINT_VARS.DEFAULT_ARGS, ...esLintConfig, ...args]);

    const exitCode = await spawnProcessPromise(spawn(
        resolveBin("eslint"),
        [...ES_LINT_VARS.DEFAULT_ARGS, ...esLintConfig, ...args],
        { stdio: "inherit" },
    ));
    if (exitCode !== 0) {
        throw new Error("There were lint errors");
    }
};

export const lintScript = async (args: string[] = []) => {
    console.debug("Called lintScript with args", args);
    const spinner = ora();

    spinner.start("Linting TS");
    try {
        await lintTypeScript(args);
        spinner.succeed();
    } catch (error) {
        spinner.text = `Error when running TSLint:\n${error}`;
        spinner.fail();
    }

    spinner.start("Linting JS");
    try {
        await lintJavaScript(args);
        spinner.succeed();
    } catch (error) {
        spinner.text = `Error when running ESLint:\n${error}`;
        spinner.fail();
    }

    spinner.stop();
};
