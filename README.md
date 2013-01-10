# Bridget

Bridge Template Upload.

Watch local template folder for changes, and auto-upload template to an associated Bridge dev server, through Bridge API.

## Prerequisites

### Node & node-webkit

- [Node.js](http://nodejs.org/) (> 0.8.16): recommanded installation through [NVM](https://github.com/creationix/nvm)
- [node-webkit](https://github.com/rogerwang/node-webkit) (> 0.3.6): download [prebuilt binary](https://github.com/rogerwang/node-webkit#downloads), and drop it in your Applications folder (OSX)

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

- [node-growl](https://github.com/visionmedia/node-growl): Growl support for Nodejs. Needs [growlnotify(1)](http://growl.info/extras.php#growlnotify).

```
npm install growl
```

## Build (OSX 10.7.5)

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

### Settings file

Your watched folders are saved in a hidden `.bridget_settings.json` JSON file in your $HOME directory.
It is created the first time you add a watched folder.
You can back it up if needed.

Note that it should never be empty, otherwise app won't load.
If you want to reset your watched directory, do not empty and save the file, just delete it.

### Here usage instructions
=======
### Installation

TODO

### Growl notifications (optional)
You should install [growlnotify(1)](http://growl.info/extras.php#growlnotify) if you want to get Growl notifications when uploads are done.
>>>>>>> Added growl notifications (with growl module)

> Usage

## Licence

Tray icon using Entypo pictograms by Daniel Bruce — www.entypo.com
