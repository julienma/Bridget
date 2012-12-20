# Bridget

Bridge Template Upload.
Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

## Prerequisites

- [Node.js](http://nodejs.org/) (at least v0.8.16): recommanded installation through [NVM](https://github.com/creationix/nvm)
- [node-webkit](https://github.com/rogerwang/node-webkit): download [prebuilt binary](https://github.com/rogerwang/node-webkit#downloads), and drop it in your Applications folder (OSX)
- Node modules
  - [Watchr](https://github.com/bevry/watchr): `npm install watchr`
  > Watchr provides a normalised API the file watching APIs of different node versions, nested/recursive file and directory watching, and accurate detailed events for file/directory creations, updates, and deletions.
  - [nconf](https://github.com/flatiron/nconf): `npm install nconf`
  > Save and load node.js configuration to JSON files.

## Build

Make sure the _package.command script is executable

```
chmod u+x _package.command
```

Make sure your package.json reference your entry point file, e.g:
```
{
  "main": "source/static/index.html"
}
```

Then run it, it will package an _app.nw and launch it through node-webkit.

## Usage

Here usage instructions

> Usage
