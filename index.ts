#!/usr/bin/env node

import commander from "commander";
import { LOG } from "./util";

LOG("Process args", process.argv);
const commandArgs = process.argv.slice(3);

commander
    .version("0.1.10")
    .name("pkk-scripts")
    .description("pkk-scripts - bootstrapper for projects");

commander
    .command("test")
    .alias("t")
    .description("Runs project tests")
    .allowUnknownOption()
    .option("-w, --watch", "Run in watch mode")
    .action(async (testArgs) => {
        await import("./scripts/test").then((lintModule) => {
            return lintModule.testScript(commandArgs, testArgs);
        });
    });

commander
    .command("lint")
    .alias("l")
    .description(
        "Lints project files. If no options is provided it will try to lint everything possible",
    )
    .option("-f, --fix", "Fix lint errors")
    .option("--exclude-lint <languages>", "Exclude linting for specific languages")
    .option("--include-lint <languages>", "Include linting only for given languages")
    .allowUnknownOption()
    .action(async (lintArgs) => {
        await import("./scripts/lint").then((lintModule) => {
            return lintModule.lintScript(commandArgs, lintArgs);
        });
    });

commander
    .command("format [files]")
    .alias("f")
    .description("Formats project files. If no files provided it will format the whole project")
    .option("-d, --dryrun", "Do not write fixes to files")
    .action(async function(files, formatArgs, ...additionalFiles) {
        const filesInput = !files ? [] : [files, ...additionalFiles];
        await import("./scripts/format").then((formatModule) => {
            return formatModule.formatFiles(filesInput, formatArgs);
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
