import { Command } from "commander";
import spawn from "cross-spawn";
import glob from "glob";
import ora from "ora";
import util from "util";

const globPromise = util.promisify(glob);

import {
    hasOneOfFiles,
    hasPackageProperty,
    LOG,
    purgeArgument,
    resolveBin,
    spawnProcessPromise,
} from "../util";
import { ES_LINT_VARS } from "./linters/eslint";
import { TS_LINT_VARS } from "./linters/tslint";

interface ILintCommand extends Command {
    excludeLint?: string;
    includeLint?: string;
    fix?: boolean;
}

const lintTypeScript = async (args: string[]) => {
    const hasTSLintConfig = hasOneOfFiles(TS_LINT_VARS.CONFIG_FILES);
    const tsLintConfig = hasTSLintConfig ? [] : TS_LINT_VARS.FALLBACK_CONFIG;

    LOG("tslintconfig:", hasTSLintConfig ? "Using project local" : tsLintConfig);

    const tslintArgs = [...TS_LINT_VARS.DEFAULT_ARGS, ...tsLintConfig, ...args];

    LOG("Running TSLint with args:", tslintArgs);

    const exitCode = await spawnProcessPromise(
        spawn(await resolveBin("tslint"), tslintArgs, { stdio: "inherit" }),
    );
    if (exitCode !== 0) {
        throw new Error(`There were lint errors. Exit code: ${exitCode}`);
    }
};

const lintJavaScript = async (args: string[]) => {
    const hasESLintConfig =
        hasOneOfFiles(ES_LINT_VARS.CONFIG_FILES) ||
        hasPackageProperty(ES_LINT_VARS.PACKAGE_CONFIG_PROP) ||
        hasPackageProperty("eslintIgnore");
    const esLintConfig = hasESLintConfig ? [] : ES_LINT_VARS.FALLBACK_CONFIG;

    /**
     * If there is no config there's a couple of assumptions we make. The user either:
     *
     * 1. Has no JavaScript files in the project. We therefore glob search the default pattern and simply
     * returns if no files could be found.
     *
     * 2. The user wants to just use the default configuration bundled with pkk-scripts
     *
     * If we do not check the glob pattern, and there's no files, ESLint fails with exit code 2 which
     * doesn't really feel right and keeps us from linting everything by default.
     *
     * Ref: https://github.com/eslint/eslint/issues/10587
     * Ref: https://github.com/eslint/eslint/issues/9977
     *
     * TODO: Use ESLint CLIEngine to bypass issue
     */
    if (!hasESLintConfig) {
        const globRes = await globPromise(ES_LINT_VARS.DEFAULT_ARGS[0], {
            ignore: ["node_modules/**/*"],
        });
        if (globRes.length === 0) {
            return;
        }
    }

    LOG("Chosen eslintconfig", esLintConfig);

    const eslintArgs = [...ES_LINT_VARS.DEFAULT_ARGS, ...esLintConfig, ...args];

    LOG("Running ESLint with args:", eslintArgs);

    await spawnProcessPromise(
        spawn(await resolveBin("eslint"), eslintArgs, { stdio: "inherit" }),
    ).then((res) => {
        if (res === ES_LINT_VARS.RETURN_CODES.GENERIC_ERROR_V5) {
            throw new Error("Something went wrong when trying to lint your files");
        }
        if (res === ES_LINT_VARS.RETURN_CODES.LINT_ERROR_V5) {
            throw new Error("Found lint errors");
        }
    });
};

export const lintScript = async (args: string[] = [], lintArgs: ILintCommand) => {
    const spinner = ora();
    const hasTSConfig = hasOneOfFiles(["tsconfig.json"]);

    const shouldLintTS = shouldLint(lintArgs, ["ts", "typescript"]) && hasTSConfig;
    const shouldLintJS = shouldLint(lintArgs, ["js", "javascript"]);

    LOG("Sanitized args", santitizeArguments(args));

    if (shouldLintTS) {
        spinner.start("Linting TS");
        try {
            await lintTypeScript(santitizeArguments(args));
            spinner.succeed();
        } catch (error) {
            spinner.text = `Error when running TSLint:\n${error}`;
            spinner.fail();
        }
    }

    if (shouldLintJS) {
        try {
            spinner.start("Linting JS");
            await lintJavaScript(santitizeArguments(args));
            spinner.succeed();
        } catch (error) {
            spinner.text = `ESLint:\n${error}`;
            spinner.fail();
        }
    }

    if (!shouldLintJS && !shouldLintTS) {
        spinner.text = "No files were set up for linting. This might be a configuration issue";
        spinner.fail();
    }

    spinner.stop();
};

const santitizeArguments = (args: string[]): string[] => {
    const santitizedArgs: string[] = [...args];

    purgeArgument(santitizedArgs, "--exclude-lint", 2);
    purgeArgument(santitizedArgs, "--include-lint", 2);

    return santitizedArgs;
};

const shouldLint = (lintCommand: ILintCommand, languageIndentifiers: string[]): boolean => {
    if (lintCommand.includeLint) {
        if (
            lintCommand.includeLint.split(",").some((includeLanguage) => {
                return languageIndentifiers.some((language) => {
                    return language === includeLanguage;
                });
            })
        ) {
            LOG(`Included in lint due to match in [${languageIndentifiers.join("|")}]`);
            return true;
        } else {
            LOG(`Excluded in lint due to no match in [${languageIndentifiers.join("|")}]`);
            return false;
        }
    }

    if (lintCommand.excludeLint) {
        if (
            lintCommand.excludeLint.split(",").some((excludeLanguage) => {
                return languageIndentifiers.some((language) => {
                    return language === excludeLanguage;
                });
            })
        ) {
            LOG(`Excluded from lint due to match in [${languageIndentifiers.join("|")}]`);
            return false;
        }
    }

    return true;
};
