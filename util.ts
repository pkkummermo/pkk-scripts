import { ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import readPkgUp from "read-pkg-up";
import which from "which";

const { pkg, path: pkgPath } = readPkgUp.sync({
    cwd: fs.realpathSync(process.cwd()),
});

const appDirectory = path.dirname(pkgPath);

function resolvePKKScripts() {
    if (pkg.name === "pkk-scripts") {
        return require.resolve("./").replace(process.cwd(), ".");
    }
    return resolveBin("pkk-scripts");
}

const fromRoot = (pathToRelativeToRoot: string) => {
    return path.join(appDirectory, pathToRelativeToRoot);
};

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

const spawnProcessPromise = (childProcess: ChildProcess): Promise<number> => {
    return new Promise((res, rej) => {
        childProcess.addListener("close", res);
        childProcess.addListener("error", rej);
    });
};

const hasFile = (fileName: string) => {
    return fs.existsSync(fromRoot(fileName));
};

const hasOneOfFiles = (fileNames: string[]) => {
    return fileNames.some((fileName) => {
        return hasFile(fileName);
    });
};

const LOG = (...messages: Array<string | object>): void => {
    if (process.env.DEBUG) {
        console.log(messages);
    }
};

export {
    appDirectory,
    fromRoot,
    hasFile,
    hasOneOfFiles,
    LOG,
    resolveBin,
    resolvePKKScripts,
    spawnProcessPromise,
};
