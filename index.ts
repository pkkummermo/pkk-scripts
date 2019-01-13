#!/usr/bin/env node

import commander from "commander";
import { LOG } from "./util";

LOG("Process args", process.argv);
const commandArgs = process.argv.slice(3);

commander
    .version("0.1.0")
    .name("pkk-scripts")
    .description("pkk-scripts - bootstrapper for projects");

commander
    .command("test")
    .alias("t")
    .description("Runs project tests")
    .action(async () => {
        console.info("Not implemented yet");

    });

commander
    .command("lint")
    .alias("l")
    .description("Lints project files.")
    .option("-f, --fix", "Fix lint errors")
    .option("--exclude-lint <languages>", "Exclude linting for specific languages")
    .option("--include-lint <languages>", "Include linting only for given languages")
    .allowUnknownOption()
    .action(async (lintArgs) => {
        await import("./scripts/lint").then((lintModule) => {
            lintModule.lintScript(commandArgs, lintArgs);
        });
    });

commander
    .command("server")
    .alias("s")
    .description("Starts development server")
    .action(() => {
        console.info("Not implemented yet");
        return;
    });

commander
    .command("build")
    .alias("b")
    .description("Builds current project")
    .action(() => {
        console.info("Not implemented yet");
        return;
    });

if (process.argv.slice(2).length === 0) {
    commander.outputHelp();
    process.exit(); // 127?
}

commander.parse(process.argv);
