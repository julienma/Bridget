# Bridget

Bridge Template Upload.
Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

## Prerequisites

- [Node.js](http://nodejs.org/): recommanded installation through [NVM](https://github.com/creationix/nvm)
- [node-webkit](https://github.com/rogerwang/node-webkit): download [prebuilt binary](https://github.com/rogerwang/node-webkit#downloads), and drop it in your Applications folder (OSX)

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
