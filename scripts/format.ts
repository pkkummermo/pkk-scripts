import { spawn } from "child_process";
import { hasOneOfFiles, hasPackageProperty, LOG, resolveBin, spawnProcessPromise } from "../util";
import { PRETTIER_VARS } from "./formatters/prettier";

interface IFormatCommand {
    dryrun?: boolean;
}

export const formatFiles = async (args: string[] = [], formatArgs: IFormatCommand) => {
    const useFallbackConfig =
        !hasOneOfFiles(PRETTIER_VARS.CONFIG_FILES) &&
        !hasPackageProperty(PRETTIER_VARS.PACKAGE_CONFIG_PROP);
    const configArg = useFallbackConfig ? PRETTIER_VARS.FALLBACK_CONFIG : [];

    const useFallbackExcludes = !hasOneOfFiles([".prettierignore"]);
    const excludesArg = useFallbackExcludes ? PRETTIER_VARS.FALLBACK_EXCLUDE : [];

    const targetArgs = args.length ? args : PRETTIER_VARS.DEFAULT_ARGS;

    const writeArg = formatArgs.dryrun ? ["--check"] : ["--write"];

    const prettierArgs = [...writeArg, ...configArg, ...excludesArg, ...targetArgs];

    LOG("Prettier args", prettierArgs);

    await spawnProcessPromise(spawn(resolveBin("prettier"), prettierArgs, { stdio: "inherit" }));
};
