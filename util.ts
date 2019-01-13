import { ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import readPkgUp, { Package } from "read-pkg-up";
import which from "which";

const { pkg, path: pkgPath } = readPkgUp.sync({
    cwd: fs.realpathSync(process.cwd()),
});

const appDirectory = path.dirname(pkgPath);

/**
 * Resolves pkk-scripts bin
 */
function resolvePKKScripts() {
    if (pkg.name === "pkk-scripts") {
        return require.resolve("./").replace(process.cwd(), ".");
    }
    return resolveBin("pkk-scripts");
}

/**
 * Join root path with given path
 * @param pathToRelativeToRoot Path to join with root path
 */
const fromRoot = (pathToRelativeToRoot: string) => {
    return path.join(appDirectory, pathToRelativeToRoot);
};

/**
 * Resolves bin in the module name given
 * @param moduleName Name of module
 * @param param1 Optional extended configuration of module
 */
const resolveBin = (moduleName: string, { executable = moduleName, cwd = process.cwd() } = {}): string => {
    let whichPath = which.sync(executable, { nothrow: true });

    if (typeof whichPath === "string") {
        whichPath = fs.realpathSync(whichPath);
    }

    try {
        const modPkgPath = require.resolve(`${moduleName}/package.json`);
        const modPkgDir = path.dirname(modPkgPath);
        const { bin } = require(modPkgPath);
        const binPath = typeof bin === "string" ? bin : bin[executable];
        const fullPathToBin = path.join(modPkgDir, binPath);
        if (fullPathToBin === whichPath) {
            return executable;
        }
        return fullPathToBin.replace(cwd, ".");
    } catch (error) {
        if (whichPath) {
            return executable;
        }
        throw error;
    }
};

/**
 * Wraps a ChildProcess in a Promise
 * @param childProcess ChildProcess to wrap in a Promise
 */
const spawnProcessPromise = (childProcess: ChildProcess): Promise<number> => {
    return new Promise((res, rej) => {
        childProcess.addListener("close", res);
        childProcess.addListener("error", rej);
    });
};

/**
 * Checks if a file exists in package root
 * @param fileName Name of file to check if exists
 */
const hasFile = (fileName: string): boolean => {
    return fs.existsSync(fromRoot(fileName));
};

/**
 * Checks if one ore more files exists a list of file names
 * @param fileNames Array of file names to check if exists
 */
const hasOneOfFiles = (fileNames: string[]) => {
    return fileNames.some((fileName) => {
        return hasFile(fileName);
    });
};

/**
 * Fetches the root package
 */
const getPackage = (): object & Package => {
    return pkg;
};

/**
 * Checks if a property exists on the root package
 * @param attribute Property to check if exists
 */
const hasPackageProperty = (attribute: string): boolean => {
    return Object.keys(pkg).includes(attribute);
};

/**
 * Logs message if DEBUG is set in the environment variables
 * @param messages Messages to be logged
 */
const LOG = (...messages: Array<string | object | undefined>): void => {
    if (process.env.DEBUG) {
        console.log("[pkk-scripts]", ...messages);
    }
};

/**
 * Modifies argument list by removing given argument if the argument exist
 * @param argumentList Argument list
 * @param argument Argument to be purged
 * @param numberOfArgs Number of arguments including first argument to purge
 */
const purgeArgument = (argumentList: string[], argument: string, numberOfArgs: number = 1) => {
    const argIndex = argumentList.indexOf(argument);
    if (argIndex !== -1) {
        LOG(`Found argument ${argument} to purge. Santitizing ${numberOfArgs} arguments.`);
        argumentList.splice(argIndex, numberOfArgs);
    }
    return argumentList;
};

export {
    appDirectory,
    fromRoot,
    getPackage,
    hasFile,
    hasOneOfFiles,
    hasPackageProperty,
    LOG,
    purgeArgument,
    resolveBin,
    resolvePKKScripts,
    spawnProcessPromise,
};
