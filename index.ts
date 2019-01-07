#!/usr/bin/env node

import commander from "commander";

// console.debug("Process args", process.argv);
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
    .allowUnknownOption()
    .action(async () => {
        await import("./scripts/lint").then((lintModule) => {
            lintModule.lintScript(commandArgs);
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
