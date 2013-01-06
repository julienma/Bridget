# Bridget

Bridge Template Upload.

Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

## Prerequisites

### Node & node-webkit

- [Node.js](http://nodejs.org/) (at least v0.8.16): recommanded installation through [NVM](https://github.com/creationix/nvm)
- [node-webkit](https://github.com/rogerwang/node-webkit): download [prebuilt binary](https://github.com/rogerwang/node-webkit#downloads), and drop it in your Applications folder (OSX)

### Node modules

These are already included in the repo under `./node_modules`.
You can reinstall / update them through [NPM](https://npmjs.org/) (should already be shipped with any recent version of Node).

- [Watchr](https://github.com/bevry/watchr): provides a normalised API the file watching APIs of different node versions, nested/recursive file and directory watching, and accurate detailed events for file/directory creations, updates, and deletions.

```
npm install watchr
```

- [nconf](https://github.com/flatiron/nconf): save and load node.js configuration to JSON files.

```
npm install nconf
```

## Build

Make sure the _package.command script is executable

```
chmod u+x _package.command
```

Make sure your package.json references your entry point file, e.g:
```
{
  "main": "source/init.html"
}
```

Then run it, it will package an _app.nw and launch it through node-webkit.

## Usage

Here usage instructions

> Usage
