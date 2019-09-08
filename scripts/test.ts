import { Command } from "commander";
import glob = require("glob");
import jest from "jest";
import util from "util";
import { fromRoot, hasOneOfFiles, hasPackageProperty, LOG, purgeArgument } from "../util";
import * as fallbackConfig from "./testers/configs/jest.config";
import { JEST_VARS } from "./testers/jest";

const globPromise = util.promisify(glob);

interface ITestCommand extends Command {
    watch?: boolean;
}

const testJest = async (args: string[], testCommand: ITestCommand) => {
    // const fallbackConfig = require("./testers/configs/jest.config");
    const hasJestConfig =
        hasOneOfFiles(JEST_VARS.CONFIG_FILES) || hasPackageProperty(JEST_VARS.PACKAGE_CONFIG_PROP);
    let jestConfig = [""];

    if (hasJestConfig) {
        if (hasOneOfFiles([JEST_VARS.CONFIG_FILE_JSON])) {
            jestConfig = ["-c", JEST_VARS.CONFIG_FILE_JSON];
        }
    } else {
        jestConfig = [
            "--config",
            JSON.stringify({
                ...fallbackConfig,
                ...{ rootDir: fromRoot(".") },
            }),
        ];
    }

    /**
     * Return instead of tossing an error if we do not have a specific config file
     * and we have no matches on default test globs
     */
    if (!hasJestConfig) {
        const globRes = await globPromise(JEST_VARS.DEFAULT_TEST_FILE_PATTERN_GLOB, {
            ignore: ["node_modules/**/*"],
        });
        if (globRes.length === 0) {
            console.log(`No tests could be found with the default configuration.

Either add a custom config or use the default naming conventions for picking up tests.

    Default glob: ${JEST_VARS.DEFAULT_TEST_FILE_PATTERN_GLOB}`);

            return;
        }
    }

    /**
     * Add watch flag
     */
    if (testCommand.watch) {
        args.push("--watch");
    }

    /**
     * Merging static and dynamic config (rootDir) to make up for relative config
     */
    const jestArguments = [...jestConfig, ...args];

    LOG("Running jest with", jestArguments);

    await jest.run(jestArguments);
};

export const testScript = async (args: string[] = [], testCommand: ITestCommand) => {
    try {
        await testJest(santitizeArguments(args), testCommand);
    } catch (err) {
        console.log("Error", err);
    }
};

const santitizeArguments = (args: string[]): string[] => {
    const santitizedArgs: string[] = [...args];

    purgeArgument(santitizedArgs, "--watch");
    purgeArgument(santitizedArgs, "-w");

    return santitizedArgs;
};
