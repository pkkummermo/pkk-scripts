# pkk-scripts

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![data-mapper-chain](https://img.shields.io/npm/v/@pkkummermo/pkk-scripts.svg)](https://www.npmjs.com/package/@pkkummermo/pkk-scripts)

A package for bootstrapping and simplifying startup of private projects

## Why

Highly inspired by Kent C. Dodds [kcd-scripts](https://github.com/kentcdodds/kcd-scripts) and [his article](https://blog.kentcdodds.com/automation-without-config-412ab5e47229) I created pkk-scripts. It's meant to simplify creating new projects and standardize tooling versions and help keep everything up to date.

## Install

```
npm i -D @pkkummermo/pkk-scripts
```

## Usage

```bash
pkk-scripts --help

Usage: pkk-scripts [options] [command]

pkk-scripts - bootstrapper for projects

Options:
  -V, --version     output the version number
  -h, --help        output usage information

Commands:
  test|t            Runs project tests
  lint|l [options]  Lints project files.
  server|s          Starts development server
  build|b           Builds current project
```

Add configurations according to your needs in package.json.

Ex (in `package.json` script attribute):

```json
{
    "scripts": {
        "build": "pkk-scripts b",
        "start": "pkk-scripts s",
        "test:unit": "pkk-scripts t",
        "test:lint": "pkk-scripts l"
    }
}
```

These will trigger `pkk-scripts` which will in turn automatically detect project configurations and run the according action.

## Configuration

The CLI comes bundles with default configurations, but will eat configurations available in the project folder it is run in. This includes (for now):

-   TSLint (tslint.json)
-   ESLint (.eslintignore, .eslintrc.js, .eslintrc.json)
