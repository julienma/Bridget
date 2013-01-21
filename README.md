# Bridget

Bridge Template Upload.

Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

# 1. Use it!

## Installation (OSX 10.7.5)

Either

1. Download the latest standalone, prebuilt binary (OSX only - 25MB): http://cl.ly/0L2E250q0p0r

2. Download the [node-webkit binary](https://github.com/rogerwang/node-webkit#downloads) and the latest [Bridget.nw](https://github.com/julienma/Bridget/raw/master/build/Bridget.nw)

### Growl notifications (optional)

If you are using [Growl](http://growl.info) > 1.3, you will get notifications when upload are done.

### Compatibility

This is tested and working on OSX only.

As it is implemented now, it could theorically work on Windows with minimal code adaptation.
However, it is currently based on cURL and zip OSX binaries, so until those features are built-in (using Node modules), you will have to manually install cURL and zip's windows-compatible CLIs. And even then, it's not garanteed to work.

## Usage

![Bridget lives in the menu bar / tray](https://raw.github.com/julienma/Bridget/master/readme.png)

### Settings file

Your watched folders are saved in a hidden `.bridget_settings.json` JSON file in your $HOME directory.
It is created the first time you add a watched folder.
You can back it up if needed.

Note that it should never be empty, otherwise app won't load.
If you want to reset your watched directory, do not empty and save the file, just delete it.

# 2. Hack it!

## Prerequisites

### Node & node-webkit

- [Node.js](http://nodejs.org/) (> 0.8.16): recommanded installation through [NVM](https://github.com/creationix/nvm). Used for development only, as node-webkit has its own node binary already built-in.
- [node-webkit](https://github.com/rogerwang/node-webkit) (> 0.3.6): download [prebuilt binary](https://github.com/rogerwang/node-webkit#downloads), and drop it in your Applications folder (OSX)

### Node modules

These are already included in the repo under `./app.nw/node_modules`.
You can reinstall / update them through [NPM](https://npmjs.org/) (should already be shipped with any recent version of Node).

Note that:

- You need to be in the `./app.nw` folder in order to install the node modules in `./app.nw/node_modules`.

- The `app.nw/package.json` file is used by node-webkit, and might conflict with npm. Just temporarily rename it, run your `npm install bla`, and rename it back before building the app.

**Modules:**

- [Watchr](https://github.com/bevry/watchr): provides a normalised API the file watching APIs of different node versions, nested/recursive file and directory watching, and accurate detailed events for file/directory creations, updates, and deletions.

```
npm install watchr
```

- [nconf](https://github.com/flatiron/nconf): save and load node.js configuration to JSON files. Used to save watched folder settings.

```
npm install nconf
```

- [Restler](https://github.com/danwrong/restler): An HTTP client library for node.js (0.6.x and up). Hides most of the complexity of creating and using http.Client. Used to PUT zipped templates to Bridge API.

```
npm install restler
```

- [node-native-zip](https://github.com/janjongboom/node-native-zip): Zipping in node.js with no external dependencies.

```
npm install node-native-zip
```

- [dive](https://github.com/pvorb/node-dive): walk through directory trees and apply an action to every file.

```
npm install dive
```

- [Node Growler](https://github.com/betamos/Node-Growler): A Growl server for node.js which sends notifications to remote and local Growl clients using GNTP. Needs [Growl](http://growl.info) > 1.3.

```
npm install growler
```

## Build (OSX 10.7.5)

Make sure the _build.command script is executable

```
chmod u+x _build.command
```

Make sure your package.json references your entry point file, e.g:
```
{
  "main": "source/init.html"
}
```

Then run it, it will package both Bridget.nw (light archive needing node-webkit binary) and Bridget.app (standalone app -- but far bigger).
It will also open the .app so you can test it immediately.

For development, you can run _test.command instead, it will just package an _app.nw and launch it through node-webkit.

# Licence

Tray icon using Entypo pictograms by Daniel Bruce — www.entypo.com
