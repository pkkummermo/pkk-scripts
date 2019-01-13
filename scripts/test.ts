import { Command } from "commander";
import glob = require("glob");
// @ts-ignore-line
import jest from "jest";
import util from "util";
import { fromRoot, hasOneOfFiles, hasPackageProperty, LOG } from "../util";
import { JEST_VARS } from "./testers/jest";

const globPromise = util.promisify(glob);

interface ITestCommand extends Command {
    excludeTest?: string;
    includeTest?: string;
}

const testJest = async (args: string[]) => {
    const hasJestConfig = hasOneOfFiles(JEST_VARS.CONFIG_FILES) || hasPackageProperty(JEST_VARS.PACKAGE_CONFIG_PROP);
    const jestConfig = hasJestConfig ? [] : JEST_VARS.FALLBACK_CONFIG;

    const fallbackConfig = require("./testers/configs/jest.config");

    /**
     * Return instead of tossing an error if we do not have a specific config file
     * and we have no matches on default test globs
     */
    if (!hasJestConfig) {
        const globRes = await globPromise("**/*spec.+(ts|js)", { ignore: ["node_modules/**/*"] });
        if (globRes.length === 0) {
            return;
        }
    }

    /**
     * Merging static and dynamic config (rootDir) to make up for relative config
     */
    const jestArguments = [
        ...(hasJestConfig ?
            [""] :
            ["--config", JSON.stringify(
                {
                    ...fallbackConfig,
                    ...{ rootDir: fromRoot(".") },
                },
            )]
        ), ...args];

    LOG("Chose jest config", jestConfig);
    LOG("Running jest with", jestArguments);

    await jest.run(jestArguments);
};

export const testScript = async (args: string[] = [], _: ITestCommand) => {
    try {
        await testJest(args);
    } catch (err) {
        console.log("Error", err);
    }
};
