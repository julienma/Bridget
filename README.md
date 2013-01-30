# Bridget

Bridge Template Upload.

Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

# 1. Use it!

## Installation

Current version: **v1.2** - 30/01/2013

### OSX

- Download [OSX standalone .app - v1.2](http://cl.ly/3W40201K3l29/download/Bridget-1.2-osx.zip) (25MB)
- Unzip and move .app to /Applications
- If you want Bridget to start automatically, move Bridget.app in the dock to create a shortcut, right-click on it, and select Options > Open at login.

### Windows

- Download [Win32 standalone .exe - v1.2](http://cl.ly/3Z2O2S0S2637/download/Bridget-1.2-win32.zip) (22MB)
- Unzip and double-click on .exe

### .NW Package

Alternatively, you could download the [node-webkit binary](https://github.com/rogerwang/node-webkit#downloads) and the latest [Bridget.nw](https://github.com/julienma/Bridget/raw/master/build/Bridget.nw), which is far lighter (< 1MB).
Just drag the Bridget.nw over the node-webkit binary, and zam!

### Growl notifications (optional)

If you are using [Growl](http://growl.info) > 1.3, you will get notifications when uploads are done.

![Bridget notifications using Growl](https://raw.github.com/julienma/Bridget/master/readme_growl.png)

### Compatibility

This has been tested on OSX 10.7 and Windows 8.
It should be compatible with Windows 7 and some Linux, as long as you use the right node-webkit binary to open Bridget.nw.

## Usage

![Bridget lives in the menu bar / tray](https://raw.github.com/julienma/Bridget/master/readme_menu.png)

1. Add a folder to watch for changes (browse or drag and drop the target folder).

2. Enter the **write_templates** API key, refresh and select the target template slot, save.

3. Any change done in the watched folder will be uploaded within 30s to the template slot.

### Settings file

Your watched folders are saved in a hidden `.bridget_settings.json` JSON file under your $HOME directory (or under $USERPROFILE on Windows, which should be somewhere like 'C:\Users\YourUsername').
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
